import { convexTest } from "convex-test";
import { describe, test, expect, beforeEach, vi, afterEach } from "vitest";
import schema from "../schema";
import { Id } from "../_generated/dataModel";
import {
  AI_CREDITS_FOR_LOR,
  DEFAULT_AI_CREDITS,
  RESET_DAYS_IN_MILLISECONDS,
} from "../validators";
import * as AiCreditsModel from "./model"; // Import functions to test
import { api, internal } from "../_generated/api";
describe("aiCredits", () => {
  describe("Model", () => {
    describe("getUserAiCredits", () => {
      const t = convexTest(schema);
      let testUserId: Id<"users">;
      let aiCreditId: Id<"aiCredits">;
      const resetDate = new Date(
        Date.now() + RESET_DAYS_IN_MILLISECONDS
      ).toISOString();

      beforeEach(async () => {
        // Insert a dummy user
        testUserId = await t.run(async (ctx) => {
          return await ctx.db.insert("users", {
            name: "Test User",
            email: `test-${Date.now()}@example.com`,
            clerkId: `clerk-${Date.now()}`,
          });
        });
        // Insert an aiCredits record for the user
        aiCreditId = await t.run(async (ctx) => {
          return await ctx.db.insert("aiCredits", {
            userId: testUserId,
            totalCredits: DEFAULT_AI_CREDITS,
            usedCredits: 10,
            resetDate: resetDate,
          });
        });
      });

      test("should return the aiCredits record for a valid userId", async () => {
        const credits = await t.run(async (ctx) => {
          return await AiCreditsModel.getUserAiCredits(ctx, testUserId);
        });

        expect(credits).not.toBeNull();
        expect(credits?.totalCredits).toBe(DEFAULT_AI_CREDITS);
        expect(credits?.usedCredits).toBe(10);
        expect(credits?.resetDate).toBe(resetDate);
      });

      test("should return default credits summary if no aiCredits record exists for the userId", async () => {
        // Create a new user ID that doesn't have an aiCredits record
        const newUser = await t.run(async (ctx) => {
          return await ctx.db.insert("users", {
            name: "New User",
            email: `new-${Date.now()}@example.com`,
            clerkId: `clerk-new-${Date.now()}`,
          });
        });

        const credits = await t.run(async (ctx) => {
          return await AiCreditsModel.getUserAiCredits(ctx, newUser);
        });

        expect(credits).not.toBeNull();
        expect(credits?.totalCredits).toBe(DEFAULT_AI_CREDITS);
        expect(credits?.usedCredits).toBe(0);
      });
    });

    describe("getUserAiCreditUsage", () => {
      const t = convexTest(schema);
      let testUserId: Id<"users">;
      let aiCreditUsageId: Id<"aiCreditUsage">;
      const resetDate = new Date(
        Date.now() + RESET_DAYS_IN_MILLISECONDS
      ).toISOString();

      beforeEach(async () => {
        // Insert a dummy user
        testUserId = await t.run(async (ctx) => {
          return await ctx.db.insert("users", {
            name: "Test User",
            email: `test-${Date.now()}@example.com`,
            clerkId: `clerk-${Date.now()}`,
          });
        });
        // Insert an aiCredits record for the user
        aiCreditUsageId = await t.run(async (ctx) => {
          return await ctx.db.insert("aiCreditUsage", {
            userId: testUserId,
            type: "lor_request",
            credits: AI_CREDITS_FOR_LOR,
            timestamp: new Date().toISOString(),
          });
        });
      });

      test("should return the aiCreditUsage record for a valid userId", async () => {
        const usage = await t.run(async (ctx) => {
          return await AiCreditsModel.getUserAiCreditUsage(ctx, testUserId);
        });

        expect(usage).not.toBeNull();
        expect(usage).toBeInstanceOf(Array);
        expect(usage.length).toBeGreaterThan(0);
        expect(usage[0].type).toBe("lor_request");
        expect(usage[0].used).toBe(AI_CREDITS_FOR_LOR);
        expect(usage[0].percentage).toBe(100);
      });
    });

    describe("createAiCredits", () => {
      const t = convexTest(schema);
      let testUserId: Id<"users">;

      beforeEach(async () => {
        vi.useFakeTimers(); // Enable fake timers for date calculations

        // Insert a dummy user to get a valid ID before each test
        testUserId = await t.run(async (ctx) => {
          return await ctx.db.insert("users", {
            name: "Test User",
            email: `test-${Date.now()}@example.com`,
            clerkId: `clerk-${Date.now()}`, // Ensure unique clerkId
          });
        });
      });

      test("should create an aiCredits record with default values", async () => {
        const userId = testUserId;
        const now = Date.now();
        vi.setSystemTime(now);

        const expectedResetDate = new Date(
          now + RESET_DAYS_IN_MILLISECONDS
        ).toISOString();

        // Run the createAiCredits function with the valid userId
        const newCreditId = await t.run(async (ctx) => {
          return await AiCreditsModel.createAiCredits(ctx, userId);
        });

        // Verify the record was created
        const createdRecord = await t.run(async (ctx) => {
          return await ctx.db.get(newCreditId);
        });

        expect(createdRecord).not.toBeNull();
        // Check against the valid userId
        expect(createdRecord?.userId).toBe(userId);
        expect(createdRecord?.totalCredits).toBe(DEFAULT_AI_CREDITS);
        expect(createdRecord?.usedCredits).toBe(0);
        expect(createdRecord?.resetDate).toBe(expectedResetDate);
        expect(createdRecord?._id).toBe(newCreditId);
      });

      test("should create an aiCredits record with custom values", async () => {
        // Use the valid testUserId generated in beforeEach
        const userId = testUserId;
        const customTotalCredits = 500;
        const customUsedCredits = 50;
        const customResetDate = new Date(
          "2025-12-31T00:00:00.000Z"
        ).toISOString();

        // Run the createAiCredits function with custom values
        const newCreditId = await t.run(async (ctx) => {
          return await AiCreditsModel.createAiCredits(
            ctx,
            // Pass the valid userId
            userId,
            customTotalCredits,
            customUsedCredits,
            customResetDate
          );
        });

        // Verify the record was created with custom values
        const createdRecord = await t.run(async (ctx) => {
          return await ctx.db.get(newCreditId);
        });

        expect(createdRecord).not.toBeNull();
        // Check against the valid userId
        expect(createdRecord?.userId).toBe(userId);
        expect(createdRecord?.totalCredits).toBe(customTotalCredits);
        expect(createdRecord?.usedCredits).toBe(customUsedCredits);
        expect(createdRecord?.resetDate).toBe(customResetDate);
        expect(createdRecord?._id).toBe(newCreditId);
      });

      test("should return the ID of the newly created record", async () => {
        // Use the valid testUserId generated in beforeEach
        const userId = testUserId;

        const returnedId = await t.run(async (ctx) => {
          // Pass the valid userId
          return await AiCreditsModel.createAiCredits(ctx, userId);
        });

        // Verify the returned ID corresponds to a valid record
        const fetchedRecord = await t.run(async (ctx) => {
          return await ctx.db.get(returnedId);
        });

        expect(fetchedRecord).not.toBeNull();
        expect(fetchedRecord?._id).toBe(returnedId);
        // Check against the valid userId
        expect(fetchedRecord?.userId).toBe(userId);
      });

      // Clean up timers after tests
      afterEach(() => {
        vi.useRealTimers();
      });
    });

    describe("updateUserAiCredits", () => {
      const t = convexTest(schema);
      let testUserId: Id<"users">;
      let aiCreditId: Id<"aiCredits">;
      const startingUsedCredits = 100;
      const creditsToUse = 50;

      beforeEach(async () => {
        // Insert a dummy user
        testUserId = await t.run(async (ctx) => {
          return await ctx.db.insert("users", {
            name: "Test User",
            email: `test-${Date.now()}@example.com`,
            clerkId: `clerk-${Date.now()}`,
          });
        });
        // Insert an aiCredits record for the user
        aiCreditId = await t.run(async (ctx) => {
          return await ctx.db.insert("aiCredits", {
            userId: testUserId,
            totalCredits: DEFAULT_AI_CREDITS,
            usedCredits: startingUsedCredits,
            resetDate: new Date(
              Date.now() + RESET_DAYS_IN_MILLISECONDS
            ).toISOString(),
          });
        });
      });

      test("should update the usedCredits for a valid aiCreditId", async () => {
        await t.run(async (ctx) => {
          await AiCreditsModel.updateUserAiCredits(
            ctx,
            testUserId,
            creditsToUse
          );
        });

        const updatedRecord = await t.run(async (ctx) => {
          return await ctx.db.get(aiCreditId);
        });

        expect(updatedRecord).not.toBeNull();
        expect(updatedRecord?.usedCredits).toBe(
          startingUsedCredits + creditsToUse
        );
        // Ensure other fields are unchanged
        expect(updatedRecord?.totalCredits).toBe(DEFAULT_AI_CREDITS);
      });

      test("should throw an error if trying to update a record when unauthenticated", async () => {
        const nonExistentId = "j1234567890abcdefghij" as Id<"users">; // Example of a non-existent ID format
        await expect(
          t.run(async (ctx) => {
            await AiCreditsModel.updateUserAiCredits(ctx, nonExistentId, 50);
          })
        ).rejects.toThrow(); // Convex throws an error if the ID doesn't exist
      });
    });
  });

  describe("Queries", () => {
    const t = convexTest(schema);
    let testUserId: Id<"users">;
    let aiCreditId: Id<"aiCredits">;
    const initialUsedCredits = 50;
    const initialTotalCredits = DEFAULT_AI_CREDITS;
    let resetDate: string;
    let asUser: any;

    beforeEach(async () => {
      vi.useFakeTimers(); // Use fake timers for consistent resetDate
      const now = Date.now();
      vi.setSystemTime(now);
      resetDate = new Date(now + RESET_DAYS_IN_MILLISECONDS).toISOString();

      const clerkId = `clerk-${Date.now()}-${Math.random()}`;
      const testUserIdentity = { subject: clerkId };
      asUser = t.withIdentity(testUserIdentity);

      // Insert a dummy user
      testUserId = await t.run(async (ctx) => {
        return await ctx.db.insert("users", {
          name: "Test User",
          email: `test-${Date.now()}@example.com`,
          clerkId: clerkId,
        });
      });

      // Insert an aiCredits record for the user
      aiCreditId = await t.run(async (ctx) => {
        return await ctx.db.insert("aiCredits", {
          userId: testUserId,
          totalCredits: initialTotalCredits,
          usedCredits: initialUsedCredits,
          resetDate: resetDate,
        });
      });

      // Insert some usage data
      await t.run(async (ctx) => {
        await ctx.db.insert("aiCreditUsage", {
          userId: testUserId,
          type: "lor_request",
          credits: 30,
          timestamp: new Date().toISOString(),
        });
        await ctx.db.insert("aiCreditUsage", {
          userId: testUserId,
          type: "sop_request",
          credits: 20,
          timestamp: new Date().toISOString(),
        });
      });
    });

    afterEach(() => {
      vi.useRealTimers(); // Restore real timers
    });

    test("getAiCredits: should return correct credit summary for authenticated user", async () => {
      const credits = await asUser.query(api.aiCredits.queries.getAiCredits);

      expect(credits).toEqual({
        totalCredits: initialTotalCredits,
        usedCredits: initialUsedCredits,
        resetDate: resetDate,
      });
    });

    test("getAiCredits: should return default credits for user with no record", async () => {
      // Create a new user without an aiCredits record
      const newUserClerkId = `clerk-new-${Date.now()}`;
      const newUserIdentity = { subject: newUserClerkId };
      await t.run(async (ctx) => {
        await ctx.db.insert("users", {
          name: "New User",
          email: `new-${Date.now()}@example.com`,
          clerkId: newUserClerkId,
        });
      });

      const credits = await t
        .withIdentity(newUserIdentity)
        .query(api.aiCredits.queries.getAiCredits);

      expect(credits).toEqual({
        totalCredits: DEFAULT_AI_CREDITS,
        usedCredits: 0,
        resetDate: resetDate, // Uses the mocked current time
      });
    });

    test("getAiCreditUsage: should return aggregated usage statistics", async () => {
      const usage = await asUser.query(api.aiCredits.queries.getAiCreditUsage);

      // Total used = 30 + 20 = 50
      expect(usage).toHaveLength(2);
      expect(usage).toEqual(
        expect.arrayContaining([
          { type: "lor_request", used: 30, percentage: 60 }, // 30 / 50 * 100
          { type: "sop_request", used: 20, percentage: 40 }, // 20 / 50 * 100
        ])
      );
    });

    test("getAiCreditUsage: should return empty array for user with no usage", async () => {
      // Create a new user without usage records
      const newUserClerkId = `clerk-nousage-${Date.now()}`;
      const newUserIdentity = { subject: newUserClerkId };
      await t.run(async (ctx) => {
        const newUser = await ctx.db.insert("users", {
          name: "No Usage User",
          email: `nousage-${Date.now()}@example.com`,
          clerkId: newUserClerkId,
        });
        // Give them credits but no usage
        await ctx.db.insert("aiCredits", {
          userId: newUser,
          totalCredits: DEFAULT_AI_CREDITS,
          usedCredits: 0,
          resetDate: resetDate,
        });
      });

      const usage = await t
        .withIdentity(newUserIdentity)
        .query(api.aiCredits.queries.getAiCreditUsage);
      expect(usage).toEqual([]);
    });

    test("getAiCreditsRemaining: should return correct remaining credits", async () => {
      const remaining = await asUser.query(
        api.aiCredits.queries.getAiCreditsRemaining
      );
      expect(remaining).toBe(initialTotalCredits - initialUsedCredits); // 500 - 50 = 450
    });

    test("getAiCreditsRemaining: should return default credits for user with no record", async () => {
      // Create a new user without an aiCredits record
      const newUserClerkId = `clerk-remaining-${Date.now()}`;
      const newUserIdentity = { subject: newUserClerkId };
      await t.run(async (ctx) => {
        await ctx.db.insert("users", {
          name: "New User Remaining",
          email: `new-remaining-${Date.now()}@example.com`,
          clerkId: newUserClerkId,
        });
      });

      const remaining = await t
        .withIdentity(newUserIdentity)
        .query(api.aiCredits.queries.getAiCreditsRemaining);
      expect(remaining).toBe(DEFAULT_AI_CREDITS);
    });

    test("getAiCreditsRemaining: should return 0 if used credits exceed total", async () => {
      // Update credits to have used > total
      await t.run(async (ctx) => {
        await ctx.db.patch(aiCreditId, {
          usedCredits: initialTotalCredits + 100,
        });
      });

      const remaining = await asUser.query(
        api.aiCredits.queries.getAiCreditsRemaining
      );
      expect(remaining).toBe(0);
    });
  });

  describe("Mutations", () => {
    const t = convexTest(schema);
    let testUserId: Id<"users">;
    let testUserIdentity: { subject: string };
    let aiCreditId: Id<"aiCredits">;
    const initialUsedCredits = 100;
    const initialTotalCredits = DEFAULT_AI_CREDITS;
    let resetDate: string;
    let asUser: any;

    beforeEach(async () => {
      vi.useFakeTimers();
      const now = Date.now();
      vi.setSystemTime(now);
      resetDate = new Date(now + RESET_DAYS_IN_MILLISECONDS).toISOString();

      const clerkId = `clerk-mut-${Date.now()}-${Math.random()}`;
      testUserIdentity = { subject: clerkId };
      asUser = t.withIdentity(testUserIdentity);

      testUserId = await t.run(async (ctx) => {
        return await ctx.db.insert("users", {
          name: "Mutation User",
          email: `mut-${Date.now()}@example.com`,
          clerkId: clerkId,
        });
      });

      aiCreditId = await t.run(async (ctx) => {
        return await ctx.db.insert("aiCredits", {
          userId: testUserId,
          totalCredits: initialTotalCredits,
          usedCredits: initialUsedCredits,
          resetDate: resetDate,
        });
      });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    describe("useCredits Mutation", () => {
      const creditsToUse = 50;
      const usageType = "sop_request";
      const usageDescription = "Drafting initial SOP";

      test("should deduct credits and record usage", async () => {
        const result = await asUser.mutation(
          api.aiCredits.mutations.useCredits,
          {
            type: usageType,
            credits: creditsToUse,
            description: usageDescription,
          }
        );

        const expectedUsedCredits = initialUsedCredits + creditsToUse;
        const expectedRemaining = initialTotalCredits - expectedUsedCredits;

        // Check returned summary
        expect(result).toEqual({
          totalCredits: initialTotalCredits,
          usedCredits: expectedUsedCredits,
          resetDate: resetDate,
          remainingCredits: expectedRemaining,
        });

        // Verify database state
        const updatedCredits = await t.run(
          async (ctx) => await ctx.db.get(aiCreditId)
        );
        expect(updatedCredits?.usedCredits).toBe(expectedUsedCredits);

        const usageRecord = await t.run(
          async (ctx) =>
            await AiCreditsModel.getUserAiCreditUsage(ctx, testUserId)
        );
        expect(usageRecord).not.toBeNull();
        expect(usageRecord.length).not.toBe(0);
        expect(usageRecord[0].type).toBe(usageType);

        // Verify user activity log
        const activityLog = await t.run(
          async (ctx) =>
            await ctx.db
              .query("userActivity")
              .filter((q) => q.eq(q.field("type"), "ai_usage"))
              .first()
        );
        expect(activityLog).not.toBeNull();
        expect(activityLog?.description).toContain(
          `Used ${creditsToUse} credits for ${usageType}`
        );
        expect(activityLog?.metadata.creditsUsed).toBe(creditsToUse);
        expect(activityLog?.metadata.remainingCredits).toBe(expectedRemaining);
      });

      test("should throw error for insufficient credits", async () => {
        const creditsToUseHigh = initialTotalCredits - initialUsedCredits + 1; // 1 more than available

        await expect(
          t
            .withIdentity(testUserIdentity)
            .mutation(api.aiCredits.mutations.useCredits, {
              type: usageType,
              credits: creditsToUseHigh,
            })
        ).rejects.toThrowError(/Insufficient credits/);
      });

      test("should throw error for non-positive credit amount", async () => {
        await expect(
          asUser.mutation(api.aiCredits.mutations.useCredits, {
            type: usageType,
            credits: 0,
          })
        ).rejects.toThrowError("Credit amount must be positive");

        await expect(
          asUser.mutation(api.aiCredits.mutations.useCredits, {
            type: usageType,
            credits: -10,
          })
        ).rejects.toThrowError("Credit amount must be positive");
      });

      test("should create credits record if none exists and deduct", async () => {
        // Create a new user without an aiCredits record
        const newUserClerkId = `clerk-nocred-${Date.now()}`;
        const newUserIdentity = { subject: newUserClerkId };
        const newUserId = await t.run(async (ctx) => {
          return await ctx.db.insert("users", {
            name: "No Credit User",
            email: `nocred-${Date.now()}@example.com`,
            clerkId: newUserClerkId,
          });
        });

        const creditsToUseNew = 25;
        const result = await t
          .withIdentity(newUserIdentity)
          .mutation(api.aiCredits.mutations.useCredits, {
            type: "lor_request",
            credits: creditsToUseNew,
          });

        const expectedRemaining = DEFAULT_AI_CREDITS - creditsToUseNew;

        expect(result).toEqual({
          totalCredits: DEFAULT_AI_CREDITS,
          usedCredits: creditsToUseNew,
          resetDate: resetDate, // Uses mocked time for creation
          remainingCredits: expectedRemaining,
        });

        // Verify database state
        const createdCredits = await t.run(
          async (ctx) =>
            await ctx.db
              .query("aiCredits")
              .withIndex("by_user", (q) => q.eq("userId", newUserId))
              .first()
        );
        expect(createdCredits).not.toBeNull();
        expect(createdCredits?.totalCredits).toBe(DEFAULT_AI_CREDITS);
        expect(createdCredits?.usedCredits).toBe(creditsToUseNew);
        expect(createdCredits?.resetDate).toBe(resetDate);

        const usageRecord = await t.run(
          async (ctx) =>
            await ctx.db
              .query("aiCreditUsage")
              .withIndex("by_user", (q) => q.eq("userId", newUserId))
              .first()
        );
        expect(usageRecord?.credits).toBe(creditsToUseNew);
      });
    });

    describe("resetCredits Internal Mutation", () => {
      test("should reset used credits and update reset date for existing record", async () => {
        const now = Date.now();
        vi.setSystemTime(now); // Ensure consistent reset date calculation
        const expectedResetDate = new Date(
          now + RESET_DAYS_IN_MILLISECONDS
        ).toISOString();

        const result = await asUser.mutation(
          internal.aiCredits.mutations.resetCredits,
          {
            userId: testUserId,
          }
        );

        // Check returned summary
        expect(result).toEqual({
          totalCredits: initialTotalCredits,
          usedCredits: 0,
          resetDate: expectedResetDate,
        });

        // Verify database state
        const updatedCredits = await t.run(
          async (ctx) => await ctx.db.get(aiCreditId)
        );
        expect(updatedCredits?.usedCredits).toBe(0);
        expect(updatedCredits?.resetDate).toBe(expectedResetDate);

        // Verify usage log for reset
        const usageRecord = await t.run(
          async (ctx) =>
            await ctx.db
              .query("aiCreditUsage")
              .withIndex("by_user", (q) => q.eq("userId", testUserId))
              .filter((q) => q.eq(q.field("type"), "ai_credits_reset"))
              .order("desc") // Get the latest one
              .first()
        );
        expect(usageRecord).not.toBeNull();
        expect(usageRecord?.credits).toBe(0);
        expect(usageRecord?.description).toContain("replenished");
      });

      test("should create a new record with reset values if none exists", async () => {
        // Create a new user without an aiCredits record
        const newUserClerkId = `clerk-resetnew-${Date.now()}`;
        const newUserId = await t.run(async (ctx) => {
          return await ctx.db.insert("users", {
            name: "Reset New User",
            email: `resetnew-${Date.now()}@example.com`,
            clerkId: newUserClerkId,
          });
        });

        const now = Date.now();
        vi.setSystemTime(now);
        const expectedResetDate = new Date(
          now + RESET_DAYS_IN_MILLISECONDS
        ).toISOString();
        const asUser = t.withIdentity({ subject: newUserClerkId });

        const result = await asUser.mutation(
          internal.aiCredits.mutations.resetCredits,
          {
            userId: newUserId,
          }
        );

        // Check returned summary
        expect(result).toEqual({
          totalCredits: DEFAULT_AI_CREDITS,
          usedCredits: 0,
          resetDate: expectedResetDate,
        });

        // Verify database state
        const createdCredits = await t.run(
          async (ctx) =>
            await ctx.db
              .query("aiCredits")
              .withIndex("by_user", (q) => q.eq("userId", newUserId))
              .first()
        );
        expect(createdCredits).not.toBeNull();
        expect(createdCredits?.totalCredits).toBe(DEFAULT_AI_CREDITS);
        expect(createdCredits?.usedCredits).toBe(0);
        expect(createdCredits?.resetDate).toBe(expectedResetDate);

        // Verify usage log for reset
        const usageRecord = await t.run(
          async (ctx) =>
            await ctx.db
              .query("aiCreditUsage")
              .withIndex("by_user", (q) => q.eq("userId", newUserId))
              .filter((q) => q.eq(q.field("type"), "ai_credits_reset"))
              .first()
        );
        expect(usageRecord).not.toBeNull();
        expect(usageRecord?.credits).toBe(0);
      });
    });
  });
});
