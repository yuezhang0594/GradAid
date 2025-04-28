import { convexTest } from "convex-test";
import {
  describe,
  test,
  expect,
  beforeEach,
  afterEach,
  vi,
  beforeAll,
  afterAll,
} from "vitest";
import schema from "../schema";

// Mock the svix Webhook class - with better header validation
const mockVerify = vi.fn().mockImplementation((payloadString, svixHeaders) => {
  // Check if required headers exist
  if (!svixHeaders["svix-id"] || !svixHeaders["svix-timestamp"] || !svixHeaders["svix-signature"]) {
    throw new Error("Missing required Svix headers");
  }
  
  // Default implementation returns the parsed payload
  return JSON.parse(payloadString);
});

vi.mock("svix", () => {
  return {
    Webhook: vi.fn().mockImplementation(() => ({
      verify: mockVerify,
    })),
  };
});

describe("HTTP Endpoints", () => {
  const t = convexTest(schema);
  
  // Set webhook secret for tests
  beforeAll(() => {
    process.env.CLERK_WEBHOOK_SECRET = "test-webhook-secret";
  });

  afterAll(() => {
    delete process.env.CLERK_WEBHOOK_SECRET;
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(async () => {
    // Clean up database tables
    await t.run(async (ctx) => {
      const users = await ctx.db.query("users").collect();
      await Promise.all(users.map((user) => ctx.db.delete(user._id)));
    });
  });

  describe("/clerk-users-webhook", () => {
    test("should handle user.created webhook and create user", async () => {
      const clerkId = `clerk-test-${Date.now()}`;
      const userData = {
        id: clerkId,
        email_addresses: [{ 
          email_address: "test@example.com", 
          id: "email-id-123" 
        }],
        primary_email_address_id: "email-id-123",
        first_name: "Test",
        last_name: "User",
      };

      // Prepare webhook payload
      const webhookPayload = {
        data: userData,
        object: "event",
        type: "user.created",
      };

      // Send request to webhook endpoint
      const response = await t.fetch("/clerk-users-webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "svix-id": "test-svix-id",
          "svix-timestamp": "2023-01-01T00:00:00Z",
          "svix-signature": "test-svix-signature",
        },
        body: JSON.stringify(webhookPayload),
      });

      // Check response
      expect(response.status).toBe(200);
      
      // Check if user was created in database
      const users = await t.run(async (ctx) => {
        return await ctx.db
          .query("users")
          .withIndex("byClerkId", (q) => q.eq("clerkId", clerkId))
          .collect();
      });

      expect(users.length).toBe(1);
      expect(users[0].clerkId).toBe(clerkId);
      expect(users[0].name).toBe("Test User");
      expect(users[0].email).toBe("test@example.com");
    });

    test("should handle user.updated webhook and update user", async () => {
      // First create a user
      const clerkId = `clerk-test-${Date.now()}`;
      const userId = await t.run(async (ctx) => {
        return await ctx.db.insert("users", {
          name: "Original Name",
          email: "original@example.com",
          clerkId: clerkId,
        });
      });

      // Then update via webhook
      const updatedUserData = {
        id: clerkId,
        email_addresses: [{ 
          email_address: "updated@example.com",
          id: "email-id-456"
        }],
        primary_email_address_id: "email-id-456",
        first_name: "Updated",
        last_name: "User",
      };

      // Prepare webhook payload
      const webhookPayload = {
        data: updatedUserData,
        object: "event",
        type: "user.updated",
      };

      // Send request to webhook endpoint
      const response = await t.fetch("/clerk-users-webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "svix-id": "test-svix-id",
          "svix-timestamp": "2023-01-01T00:00:00Z",
          "svix-signature": "test-svix-signature",
        },
        body: JSON.stringify(webhookPayload),
      });

      // Check response
      expect(response.status).toBe(200);
      
      // Check if user was updated in database
      const updatedUser = await t.run(async (ctx) => {
        return await ctx.db.get(userId);
      });

      expect(updatedUser).not.toBeNull();
      expect(updatedUser?.clerkId).toBe(clerkId);
      expect(updatedUser?.name).toBe("Updated User");
      expect(updatedUser?.email).toBe("updated@example.com");
    });

    test("should handle user.deleted webhook and delete user", async () => {
      // First create a user
      const clerkId = `clerk-test-${Date.now()}`;
      await t.run(async (ctx) => {
        return await ctx.db.insert("users", {
          name: "To Be Deleted",
          email: "delete@example.com",
          clerkId: clerkId,
        });
      });

      // Then delete via webhook
      const deleteUserData = {
        id: clerkId,
        deleted: true,
      };

      // Prepare webhook payload
      const webhookPayload = {
        data: deleteUserData,
        object: "event",
        type: "user.deleted",
      };

      // Send request to webhook endpoint
      const response = await t.fetch("/clerk-users-webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "svix-id": "test-svix-id",
          "svix-timestamp": "2023-01-01T00:00:00Z",
          "svix-signature": "test-svix-signature",
        },
        body: JSON.stringify(webhookPayload),
      });

      // Check response
      expect(response.status).toBe(200);
      
      // Check if user was deleted from database
      const users = await t.run(async (ctx) => {
        return await ctx.db
          .query("users")
          .withIndex("byClerkId", (q) => q.eq("clerkId", clerkId))
          .collect();
      });

      expect(users.length).toBe(0);
    });

    test("should ignore unhandled webhook event types", async () => {
      // Prepare webhook payload with an unhandled event type
      const webhookPayload = {
        data: { 
          id: "some-id",
          email_addresses: [],
          primary_email_address_id: null
        },
        object: "event",
        type: "user.some_other_event",
      };

      // Spy on console.log
      const consoleSpy = vi.spyOn(console, "log");

      // Send request to webhook endpoint
      const response = await t.fetch("/clerk-users-webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "svix-id": "test-svix-id",
          "svix-timestamp": "2023-01-01T00:00:00Z",
          "svix-signature": "test-svix-signature",
        },
        body: JSON.stringify(webhookPayload),
      });

      // Check response
      expect(response.status).toBe(200);
      
      // Check if the event was logged as ignored
      expect(consoleSpy).toHaveBeenCalledWith(
        "Ignored Clerk webhook event",
        "user.some_other_event"
      );
    });

    test("should return 400 if webhook signature verification fails", async () => {
      // Mock the Webhook.verify method to throw an error
      mockVerify.mockImplementationOnce(() => {
        throw new Error("Invalid signature");
      });

      // Prepare webhook payload
      const webhookPayload = {
        data: { 
          id: "clerk-test-invalid",
          email_addresses: [],
          primary_email_address_id: null
        },
        object: "event",
        type: "user.created",
      };

      // Spy on console.error
      const consoleSpy = vi.spyOn(console, "error");

      // Send request to webhook endpoint
      const response = await t.fetch("/clerk-users-webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "svix-id": "test-svix-id",
          "svix-timestamp": "2023-01-01T00:00:00Z",
          "svix-signature": "invalid-signature",
        },
        body: JSON.stringify(webhookPayload),
      });

      // Check response
      expect(response.status).toBe(400);
      expect(await response.text()).toBe("Error occured");
      
      // Check if error was logged
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error verifying webhook event",
        expect.any(Error)
      );
    });

    test("should return 400 if required svix headers are missing", async () => {
      // The default mockVerify implementation will throw for missing headers
      
      // Prepare webhook payload with proper data structure to avoid null reference errors
      const webhookPayload = {
        data: { 
          id: "clerk-test-missing-headers",
          email_addresses: [],
          primary_email_address_id: null
        },
        object: "event",
        type: "user.created",
      };

      // Send request to webhook endpoint without required headers
      const response = await t.fetch("/clerk-users-webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Missing svix headers
        },
        body: JSON.stringify(webhookPayload),
      });

      // Check response - should fail during verification
      expect(response.status).toBe(400);
    });
  });
});
