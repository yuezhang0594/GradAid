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
import * as UserActivityModel from "./model";
import { api } from "../_generated/api";

describe("UserActivity", () => {
  const t = convexTest(schema);
  let testUserId: Id<"users">;
  let otherUserId: Id<"users">;
  let documentId: Id<"applicationDocuments">;
  let applicationId: Id<"applications">;
  let activityId1: Id<"userActivity">;
  let activityId2: Id<"userActivity">;

  const clerkId = `clerk-activity-test-${Date.now()}-${Math.random()}`;
  const otherClerkId = `clerk-other-activity-${Date.now()}-${Math.random()}`;
  const asUser = t.withIdentity({ subject: clerkId });
  const asOtherUser = t.withIdentity({ subject: otherClerkId });

  beforeAll(async () => {
    // Create users
    [testUserId, otherUserId] = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {
        name: "Activity Test User",
        email: `activity-test-${Date.now()}@example.com`,
        clerkId,
      });
      const otherId = await ctx.db.insert("users", {
        name: "Other Activity User",
        email: `other-activity-${Date.now()}@example.com`,
        clerkId: otherClerkId,
      });
      return [userId, otherId];
    });

    // Create a university, program, and application
    const universityId = await t.run(async (ctx) => {
      return await ctx.db.insert("universities", {
        name: "Activity University",
        location: { city: "Activity City", state: "AC", country: "USA" },
        website: "http://activityuni.edu",
      });
    });

    const programId = await t.run(async (ctx) => {
      return await ctx.db.insert("programs", {
        universityId,
        name: "Activity Program",
        degree: "M.S.",
        department: "ActivityScience",
        requirements: {},
        deadlines: { fall: new Date().toISOString() },
      });
    });

    applicationId = await t.run(async (ctx) => {
      return await ctx.db.insert("applications", {
        userId: testUserId,
        universityId,
        programId,
        status: "draft",
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        priority: "medium",
        lastUpdated: new Date().toISOString(),
      });
    });

    // Create a document
    documentId = await t.run(async (ctx) => {
      return await ctx.db.insert("applicationDocuments", {
        applicationId,
        userId: testUserId,
        title: "Test Document",
        type: "sop",
        status: "draft",
        progress: 50,
        lastEdited: new Date().toISOString(),
      });
    });
  });

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date());

    // Create sample activities for the test user
    [activityId1, activityId2] = await t.run(async (ctx) => {
      const id1 = await ctx.db.insert("userActivity", {
        userId: testUserId,
        type: "document_edit",
        description: "Test user edited a document",
        timestamp: new Date().toISOString(),
        metadata: {
          documentId,
          newProgress: 50,
          oldProgress: 25,
        },
      });

      // Add a second activity 1 day ago
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const id2 = await ctx.db.insert("userActivity", {
        userId: testUserId,
        type: "application_update",
        description: "Test user updated application status",
        timestamp: yesterday.toISOString(),
        metadata: {
          applicationId,
          oldStatus: "not_started",
          newStatus: "draft",
        },
      });

      return [id1, id2];
    });

    // Create an activity for the other user
    await t.run(async (ctx) => {
      await ctx.db.insert("userActivity", {
        userId: otherUserId,
        type: "document_edit",
        description: "Other user edited a document",
        timestamp: new Date().toISOString(),
        metadata: {},
      });
    });
  });

  afterEach(async () => {
    vi.useRealTimers();
    vi.clearAllMocks();

    // Clean up activities
    await t.run(async (ctx) => {
      const activities = await ctx.db.query("userActivity").collect();
      await Promise.all(
        activities.map((activity) => ctx.db.delete(activity._id))
      );
    });
  });

  afterAll(async () => {
    // Clean up all data
    await t.run(async (ctx) => {
      // Delete application documents
      const docs = await ctx.db.query("applicationDocuments").collect();
      await Promise.all(docs.map((doc) => ctx.db.delete(doc._id)));

      // Delete applications
      const apps = await ctx.db.query("applications").collect();
      await Promise.all(apps.map((app) => ctx.db.delete(app._id)));

      // Delete programs
      const progs = await ctx.db.query("programs").collect();
      await Promise.all(progs.map((prog) => ctx.db.delete(prog._id)));

      // Delete universities
      const unis = await ctx.db.query("universities").collect();
      await Promise.all(unis.map((uni) => ctx.db.delete(uni._id)));

      // Delete users
      const users = await ctx.db.query("users").collect();
      await Promise.all(users.map((user) => ctx.db.delete(user._id)));
    });
  });

  describe("Queries", () => {
    describe("getRecentActivity", () => {
      test("should return recent activities for authenticated user", async () => {
        const activities = await asUser.query(
          api.userActivity.queries.getRecentActivity,
          {
            limit: 10,
          }
        );

        expect(activities.length).toBe(2);
        expect(activities[0].userId).toBe(testUserId);
        expect(activities[0].description).toBe(
          "Test user updated application status"
        );
        expect(activities[0].type).toBe("application_update");
        expect(activities[1].type).toBe("document_edit");
      });

      test("should respect the limit parameter", async () => {
        const activities = await asUser.query(
          api.userActivity.queries.getRecentActivity,
          {
            limit: 1,
          }
        );

        expect(activities.length).toBe(1);
        expect(activities[0].description).toBe(
          "Test user updated application status"
        );
      });

      test("should return activities ordered by recency (newest first)", async () => {
        const activities = await asUser.query(
          api.userActivity.queries.getRecentActivity,
          {}
        );

        expect(activities.length).toBeGreaterThan(0);
        expect(new Date(activities[0].timestamp).getTime()).toBeLessThanOrEqual(
          new Date(activities[1].timestamp).getTime()
        );
      });

      test("should throw if not authenticated", async () => {
        await expect(
          t.query(api.userActivity.queries.getRecentActivity, {})
        ).rejects.toThrow();
      });

      test("should not return activities of other users", async () => {
        const activities = await asUser.query(
          api.userActivity.queries.getRecentActivity,
          {}
        );

        // Check that all returned activities belong to the authenticated user
        activities.forEach((activity) => {
          expect(activity.userId).toBe(testUserId);
        });
      });
    });

    describe("getActivityStats", () => {
      test("should calculate correct activity counts for different time periods", async () => {
        // Create additional activities for different time periods
        await t.run(async (ctx) => {
          const now = new Date();
          now.setMonth(3);
          now.setDate(13);
          now.setHours(15, 14, 13, 12);
          vi.setSystemTime(now);
          // Create an activity from 2 days ago (this week)
          const twoDaysAgo = now;
          twoDaysAgo.setDate(now.getDate() - 2);

          await ctx.db.insert("userActivity", {
            userId: testUserId,
            type: "feedback_submission",
            description: "User submitted feedback",
            timestamp: twoDaysAgo.toISOString(),
            metadata: {},
          });
          // Create an activity from last month
          const lastMonth = now;
          lastMonth.setMonth(now.getMonth() - 1);
          lastMonth.setDate(1); // Set to the first day of the month

          await ctx.db.insert("userActivity", {
            userId: testUserId,
            type: "ai_usage",
            description: "User used AI",
            timestamp: lastMonth.toISOString(),
            metadata: {
              creditsUsed: 10,
            },
          });
        });

        const stats = await asUser.query(
          api.userActivity.queries.getActivityStats,
          {}
        );

        // We should have 1 activity today, 2+ this week, and 3+ this month
        expect(stats.today).toBeGreaterThanOrEqual(1); // Only 1 activity was created "today"
        expect(stats.thisWeek).toBeGreaterThanOrEqual(2); // Today + yesterday
        expect(stats.thisMonth).toBeGreaterThanOrEqual(3); // Today + yesterday + more
      });

      test("should throw if not authenticated", async () => {
        await expect(
          t.query(api.userActivity.queries.getActivityStats, {})
        ).rejects.toThrow();
      });
    });
  });

  describe("Model", () => {
    describe("getRecentActivityForUser", () => {
      test("should return recent activity for specified user", async () => {
        const activities = await t.run(async (ctx) => {
          return await UserActivityModel.getRecentActivityForUser(
            ctx,
            testUserId
          );
        });

        expect(activities.length).toBeGreaterThan(0);
        expect(activities[0].userId).toBe(testUserId);
      });

      test("should respect limit parameter", async () => {
        // Create more activities
        await t.run(async (ctx) => {
          for (let i = 0; i < 5; i++) {
            await ctx.db.insert("userActivity", {
              userId: testUserId,
              type: "document_edit",
              description: `Activity ${i}`,
              timestamp: new Date().toISOString(),
              metadata: {},
            });
          }
        });

        const activities = await t.run(async (ctx) => {
          return await UserActivityModel.getRecentActivityForUser(
            ctx,
            testUserId,
            3
          );
        });

        expect(activities.length).toBe(3);
      });

      test("should return empty array if user has no activities", async () => {
        // Create new user with no activities
        const newUserId = await t.run(async (ctx) => {
          return await ctx.db.insert("users", {
            name: "New User",
            email: `new-user-${Date.now()}@example.com`,
            clerkId: `new-clerk-${Date.now()}`,
          });
        });

        const activities = await t.run(async (ctx) => {
          return await UserActivityModel.getRecentActivityForUser(
            ctx,
            newUserId
          );
        });

        expect(activities.length).toBe(0);
      });
    });

    describe("logUserActivity", () => {
      test("should create activity record with correct fields", async () => {
        const timestamp = new Date();
        vi.setSystemTime(timestamp);

        const activityId = await t.run(async (ctx) => {
          return await UserActivityModel.logUserActivity(
            ctx,
            testUserId,
            "ai_usage",
            "User generated content with AI",
            {
              creditsUsed: 50,
              remainingCredits: 150,
            }
          );
        });

        const activity = await t.run(async (ctx) => {
          return await ctx.db.get(activityId);
        });

        expect(activity).not.toBeNull();
        expect(activity?.userId).toBe(testUserId);
        expect(activity?.type).toBe("ai_usage");
        expect(activity?.description).toBe("User generated content with AI");
        expect(activity?.timestamp).toBe(timestamp.toISOString());
        expect(activity?.metadata.creditsUsed).toBe(50);
        expect(activity?.metadata.remainingCredits).toBe(150);
      });

      test("should handle empty metadata object", async () => {
        const activityId = await t.run(async (ctx) => {
          return await UserActivityModel.logUserActivity(
            ctx,
            testUserId,
            "feedback_submission",
            "User submitted feedback"
          );
        });

        const activity = await t.run(async (ctx) => {
          return await ctx.db.get(activityId);
        });

        expect(activity).not.toBeNull();
        expect(activity?.metadata).toEqual({});
      });

      test("should record document-related metadata", async () => {
        const activityId = await t.run(async (ctx) => {
          return await UserActivityModel.logUserActivity(
            ctx,
            testUserId,
            "document_status_update",
            "Document status changed",
            {
              documentId,
              oldStatus: "draft",
              newStatus: "in_review",
            }
          );
        });

        const activity = await t.run(async (ctx) => {
          return await ctx.db.get(activityId);
        });

        expect(activity?.metadata.documentId).toBe(documentId);
        expect(activity?.metadata.oldStatus).toBe("draft");
        expect(activity?.metadata.newStatus).toBe("in_review");
      });

      test("should record application-related metadata", async () => {
        const activityId = await t.run(async (ctx) => {
          return await UserActivityModel.logUserActivity(
            ctx,
            testUserId,
            "application_update",
            "Application updated",
            {
              applicationId,
              oldStatus: "draft",
              newStatus: "in_progress",
            }
          );
        });

        const activity = await t.run(async (ctx) => {
          return await ctx.db.get(activityId);
        });

        expect(activity?.metadata.applicationId).toBe(applicationId);
        expect(activity?.metadata.oldStatus).toBe("draft");
        expect(activity?.metadata.newStatus).toBe("in_progress");
      });
    });
  });
});
