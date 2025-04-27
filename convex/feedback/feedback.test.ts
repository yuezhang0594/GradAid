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
import { Id } from "../_generated/dataModel";
import * as FeedbackModel from "./model";
import { api } from "../_generated/api";

describe("Feedback", () => {
  const t = convexTest(schema);
  let testUserId: Id<"users">;
  let otherUserId: Id<"users">;
  let feedbackId: Id<"feedback">;

  const clerkId = `clerk-feedback-test-${Date.now()}-${Math.random()}`;
  const otherClerkId = `clerk-other-feedback-${Date.now()}-${Math.random()}`;
  const asUser = t.withIdentity({ subject: clerkId });
  const asOtherUser = t.withIdentity({ subject: otherClerkId });

  beforeAll(async () => {
    // Create test users
    [testUserId, otherUserId] = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {
        name: "Feedback Test User",
        email: `feedback-test-${Date.now()}@example.com`,
        clerkId: clerkId,
      });
      const otherId = await ctx.db.insert("users", {
        name: "Other Feedback User",
        email: `other-feedback-${Date.now()}@example.com`,
        clerkId: otherClerkId,
      });
      return [userId, otherId];
    });
  });

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date());

    // Create a test feedback entry
    feedbackId = await t.run(async (ctx) => {
      return await ctx.db.insert("feedback", {
        userId: testUserId,
        positive: "I like the application tracking feature",
        negative: "Could use more AI recommendations",
        rating: 4,
        device: "desktop",
      });
    });
  });

  afterEach(async () => {
    vi.useRealTimers();
    vi.clearAllMocks();

    // Clean up database tables
    await t.run(async (ctx) => {
      // Delete all feedback records
      const feedbacks = await ctx.db.query("feedback").collect();
      await Promise.all(
        feedbacks.map((feedback) => ctx.db.delete(feedback._id))
      );
    });
  });

  afterAll(async () => {
    // Clean up the users after all tests are done
    await t.run(async (ctx) => {
      const users = await ctx.db.query("users").collect();
      await Promise.all(users.map((user) => ctx.db.delete(user._id)));
    });
  });

  describe("Mutations", () => {
    describe("submitFeedback", () => {
      test("should successfully submit feedback with all fields", async () => {
        const feedbackData = {
          positive: "Great user interface!",
          negative: "Loading times could be improved",
          rating: 4,
          device: "desktop" as const,
        };

        const newFeedbackId = await asUser.mutation(
          api.feedback.mutations.submitFeedback,
          feedbackData
        );

        expect(newFeedbackId).toBeDefined();

        const newFeedback = await t.run(async (ctx) => {
          return await ctx.db.get(newFeedbackId);
        });

        expect(newFeedback).not.toBeNull();
        expect(newFeedback?.userId).toBe(testUserId);
        expect(newFeedback?.positive).toBe(feedbackData.positive);
        expect(newFeedback?.negative).toBe(feedbackData.negative);
        expect(newFeedback?.rating).toBe(feedbackData.rating);
        expect(newFeedback?.device).toBe(feedbackData.device);
      });

      test("should submit feedback with only rating and device", async () => {
        const feedbackData = {
          rating: 5,
          device: "mobile" as const,
        };

        const newFeedbackId = await asUser.mutation(
          api.feedback.mutations.submitFeedback,
          feedbackData
        );

        const newFeedback = await t.run(async (ctx) => {
          return await ctx.db.get(newFeedbackId);
        });

        expect(newFeedback?.positive).toBeUndefined();
        expect(newFeedback?.negative).toBeUndefined();
        expect(newFeedback?.rating).toBe(feedbackData.rating);
        expect(newFeedback?.device).toBe(feedbackData.device);
      });

      test("should throw when rating is out of range", async () => {
        await expect(
          asUser.mutation(api.feedback.mutations.submitFeedback, {
            rating: 6, // Out of range (should be 1-5)
            device: "desktop" as const,
          })
        ).rejects.toThrow();

        await expect(
          asUser.mutation(api.feedback.mutations.submitFeedback, {
            rating: 0, // Out of range (should be 1-5)
            device: "desktop" as const,
          })
        ).rejects.toThrow();
      });

      test("should log user activity when feedback is submitted", async () => {
        await asUser.mutation(api.feedback.mutations.submitFeedback, {
          positive: "Activity log test",
          rating: 3,
          device: "tablet" as const,
        });

        // Check if activity was logged
        const activities = await t.run(async (ctx) => {
          return await ctx.db
            .query("userActivity")
            .withIndex("by_user", (q) => q.eq("userId", testUserId))
            .filter((q) => q.eq(q.field("type"), "feedback_submission"))
            .collect();
        });

        expect(activities.length).toBeGreaterThan(0);
        expect(activities[0].description).toBe("Submitted feedback");
      });

      test("should throw if not authenticated", async () => {
        await expect(
          t.mutation(api.feedback.mutations.submitFeedback, {
            positive: "Unauthenticated feedback",
            rating: 3,
            device: "desktop" as const,
          })
        ).rejects.toThrow(); // Authentication error
      });
    });
  });

  describe("Model", () => {
    describe("validateRating", () => {
      test("should not throw for valid ratings", () => {
        expect(() => FeedbackModel.validateRating(1)).not.toThrow();
        expect(() => FeedbackModel.validateRating(3)).not.toThrow();
        expect(() => FeedbackModel.validateRating(5)).not.toThrow();
      });

      test("should throw for invalid ratings", () => {
        expect(() => FeedbackModel.validateRating(0)).toThrow();
        expect(() => FeedbackModel.validateRating(6)).toThrow();
        expect(() => FeedbackModel.validateRating(3.5)).toThrow();
      });
    });

    describe("sanitizeAndValidateFeedbackText", () => {
      test("should return sanitized text", () => {
        const result = FeedbackModel.sanitizeAndValidateFeedbackText(
          "  Test feedback  with  extra spaces  ",
          "Positive feedback"
        );
        expect(result).toBe("Test feedback  with  extra spaces");
      });

      test("should return undefined for empty or whitespace-only text", () => {
        expect(
          FeedbackModel.sanitizeAndValidateFeedbackText("", "Field")
        ).toBeUndefined();
        expect(
          FeedbackModel.sanitizeAndValidateFeedbackText("   ", "Field")
        ).toBeUndefined();
        expect(
          FeedbackModel.sanitizeAndValidateFeedbackText(undefined, "Field")
        ).toBeUndefined();
      });

      test("should remove HTML tags", () => {
        const result = FeedbackModel.sanitizeAndValidateFeedbackText(
          "<script>alert('xss')</script>Good feedback",
          "Field"
        );
        expect(result).toBe("alert('xss')Good feedback");
      });

      test("should throw for text exceeding character limit", () => {
        // Create a string longer than FEEDBACK_MAX_CHARS
        const longText = "a".repeat(1001);
        expect(() =>
          FeedbackModel.sanitizeAndValidateFeedbackText(
            longText,
            "Positive feedback"
          )
        ).toThrow(/exceeds maximum length/);
      });
    });

    describe("createFeedbackEntry", () => {
      test("should create feedback entry with all fields", async () => {
        const feedbackData = {
          userId: testUserId,
          positive: "Model test positive",
          negative: "Model test negative",
          rating: 4,
          device: "tablet" as const,
        };

        const newFeedbackId = await t.run(async (ctx) => {
          return await FeedbackModel.createFeedbackEntry(ctx, feedbackData);
        });

        const newFeedback = await t.run(async (ctx) => {
          return await ctx.db.get(newFeedbackId);
        });

        expect(newFeedback).not.toBeNull();
        expect(newFeedback?.userId).toBe(testUserId);
        expect(newFeedback?.positive).toBe(feedbackData.positive);
        expect(newFeedback?.negative).toBe(feedbackData.negative);
        expect(newFeedback?.rating).toBe(feedbackData.rating);
        expect(newFeedback?.device).toBe(feedbackData.device);
      });

      test("should create feedback entry with only required fields", async () => {
        const feedbackData = {
          userId: testUserId,
          rating: 2,
          device: "mobile" as const,
        };

        const newFeedbackId = await t.run(async (ctx) => {
          return await FeedbackModel.createFeedbackEntry(ctx, feedbackData);
        });

        const newFeedback = await t.run(async (ctx) => {
          return await ctx.db.get(newFeedbackId);
        });

        expect(newFeedback?.positive).toBeUndefined();
        expect(newFeedback?.negative).toBeUndefined();
        expect(newFeedback?.rating).toBe(feedbackData.rating);
        expect(newFeedback?.device).toBe(feedbackData.device);
      });

      test("should throw for non-existent user ID", async () => {
        const nonExistentUserId = "00000000000000000000" as Id<"users">;

        await expect(
          t.run(async (ctx) => {
            return await FeedbackModel.createFeedbackEntry(ctx, {
              userId: nonExistentUserId,
              rating: 3,
              device: "desktop" as const,
            });
          })
        ).rejects.toThrow(); // Foreign key constraint violation
      });
    });
  });
});
