import { convexTest } from "convex-test";
import {
  describe,
  test,
  expect,
  beforeEach,
  afterEach,
  vi,
  beforeAll,
} from "vitest";
import schema from "../schema";
import { Id } from "../_generated/dataModel";
import * as DashboardModel from "../dashboard/model";
import { api } from "../_generated/api";
import { DEFAULT_AI_CREDITS } from "../validators";

describe("Dashboard", () => {
  const t = convexTest(schema);
  let testUserId: Id<"users">;
  let otherUserId: Id<"users">; // User with no data
  let universityId: Id<"universities">;
  let programId1: Id<"programs">;
  let programId2: Id<"programs">;
  let programId3: Id<"programs">;
  let appId1: Id<"applications">;
  let appId2: Id<"applications">;
  let appId3: Id<"applications">;

  const clerkId = `clerk-dashboard-test-${Date.now()}-${Math.random()}`;
  const otherClerkId = `clerk-other-dashboard-${Date.now()}-${Math.random()}`;
  const asUser = t.withIdentity({ subject: clerkId });
  const asOtherUser = t.withIdentity({ subject: otherClerkId });

  const deadline1 = new Date(
    Date.now() + 10 * 24 * 60 * 60 * 1000
  ).toISOString(); // +10 days
  const deadline2 = new Date(
    Date.now() + 5 * 24 * 60 * 60 * 1000
  ).toISOString(); // +5 days (earliest)
  const deadline3 = new Date(
    Date.now() + 20 * 24 * 60 * 60 * 1000
  ).toISOString(); // +20 days

  beforeAll(async () => {
    // Create users, university, programs
    [
      testUserId,
      otherUserId,
      universityId,
      programId1,
      programId2,
      programId3,
    ] = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {
        name: "Dashboard Test User",
        email: `dashboard-test-${Date.now()}@example.com`,
        clerkId: clerkId,
      });
      const otherId = await ctx.db.insert("users", {
        name: "Other Dashboard User",
        email: `other-dashboard-${Date.now()}@example.com`,
        clerkId: otherClerkId,
      });
      const uniId = await ctx.db.insert("universities", {
        name: "Dashboard University",
        location: { city: "Dash City", state: "DB", country: "USA" },
        website: "http://dashuni.edu",
      });
      const progId1 = await ctx.db.insert("programs", {
        universityId: uniId,
        name: "Dash Program 1",
        degree: "M.S.",
        department: "Dashboarding",
        requirements: {},
        deadlines: { fall: deadline1 },
      });
      const progId2 = await ctx.db.insert("programs", {
        universityId: uniId,
        name: "Dash Program 2",
        degree: "Ph.D.",
        department: "Dashboarding",
        requirements: {},
        deadlines: { fall: deadline2 },
      });
      const progId3 = await ctx.db.insert("programs", {
        universityId: uniId,
        name: "Dash Program 3",
        degree: "M.Eng.",
        department: "Dashboarding",
        requirements: {},
        deadlines: { fall: deadline3 },
      });
      return [userId, otherId, uniId, progId1, progId2, progId3];
    });
  });

  beforeEach(async () => {
    vi.useFakeTimers();
    const now = new Date();
    vi.setSystemTime(now);

    // Create data for testUserId
    [appId1, appId2, appId3] = await t.run(async (ctx) => {
      // Applications
      const aId1 = await ctx.db.insert("applications", {
        userId: testUserId,
        universityId: universityId,
        programId: programId1,
        status: "submitted",
        deadline: deadline1,
        priority: "medium",
        lastUpdated: now.toISOString(),
      });
      const aId2 = await ctx.db.insert("applications", {
        userId: testUserId,
        universityId: universityId,
        programId: programId2,
        status: "in_progress",
        deadline: deadline2,
        priority: "high",
        lastUpdated: now.toISOString(),
      });
      const aId3 = await ctx.db.insert("applications", {
        userId: testUserId,
        universityId: universityId,
        programId: programId3,
        status: "draft",
        deadline: deadline3,
        priority: "low",
        lastUpdated: now.toISOString(),
      });

      // Documents
      await ctx.db.insert("applicationDocuments", {
        // Doc 1 (App 1) - Complete
        applicationId: aId1,
        userId: testUserId,
        title: "SOP Final",
        type: "sop",
        status: "complete",
        progress: 100,
        lastEdited: now.toISOString(),
      });
      await ctx.db.insert("applicationDocuments", {
        // Doc 2 (App 2) - In Progress
        applicationId: aId2,
        userId: testUserId,
        title: "LOR Req 1",
        type: "lor",
        status: "draft",
        progress: 50,
        lastEdited: now.toISOString(),
      });
      await ctx.db.insert("applicationDocuments", {
        // Doc 3 (App 2) - Not Started
        applicationId: aId2,
        userId: testUserId,
        title: "LOR Req 2",
        type: "lor",
        status: "not_started",
        progress: 0,
        lastEdited: now.toISOString(),
      });
      await ctx.db.insert("applicationDocuments", {
        // Doc 4 (App 3) - In Progress
        applicationId: aId3,
        userId: testUserId,
        title: "SOP Draft",
        type: "sop",
        status: "draft",
        progress: 25,
        lastEdited: now.toISOString(),
      });

      // AI Credits
      await ctx.db.insert("aiCredits", {
        userId: testUserId,
        totalCredits: DEFAULT_AI_CREDITS,
        usedCredits: 50,
        resetDate: new Date(
          now.getTime() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
      });

      // User Activity (create 15 records to test limit)
      for (let i = 0; i < 15; i++) {
        await ctx.db.insert("userActivity", {
          userId: testUserId,
          type: "document_edit",
          description: `Edited document ${i + 1}`,
          timestamp: new Date(now.getTime() - i * 60000).toISOString(), // Decrement timestamp
          metadata: {},
        });
      }
      return [aId1, aId2, aId3];
    });
  });

  afterEach(async () => {
    vi.useRealTimers();
    vi.clearAllMocks();

    // Clean up database tables
    await t.run(async (ctx) => {
      const tables: (keyof typeof schema.tables)[] = [
        "applications",
        "applicationDocuments",
        "aiCredits",
        "userActivity",
      ];
      for (const table of tables) {
        const items = await ctx.db.query(table).collect();
        await Promise.all(items.map((item) => ctx.db.delete(item._id)));
      }
    });
  });

  describe("Model", () => {
    describe("getDashboardStatsForUser", () => {
      test("should return correct stats for user with data", async () => {
        const stats = await t.run(async (ctx) => {
          return await DashboardModel.getDashboardStatsForUser(ctx, testUserId);
        });

        // Application Stats
        expect(stats.applications.total).toBe(3);
        expect(stats.applications.submitted).toBe(1);
        expect(stats.applications.inProgress).toBe(1);
        expect(stats.applications.nextDeadline).toBe(deadline2); // Earliest deadline

        // Document Stats (4 documents: 100, 50, 0, 25)
        expect(stats.documents.totalDocuments).toBe(4);
        expect(stats.documents.completedDocuments).toBe(1);
        expect(stats.documents.averageProgress).toBeCloseTo(
          (100 + 50 + 0 + 25) / 4
        ); // 43.75

        // AI Credits
        expect(stats.aiCredits).not.toBeNull();
        expect(stats.aiCredits?.totalCredits).toBe(DEFAULT_AI_CREDITS);
        expect(stats.aiCredits?.usedCredits).toBe(50);

        // Recent Activity
        expect(stats.recentActivity).toHaveLength(12); // Limited to 12
        expect(stats.recentActivity[0].description).toBe("Edited document 15"); // Most recent
        expect(stats.recentActivity[11].description).toBe("Edited document 4");
      });

      test("should return zero/default stats for user with no data", async () => {
        const stats = await t.run(async (ctx) => {
          // otherUserId has no applications, documents, or activity created in beforeEach
          // aiCredits will be created by getUserAiCredits if they don't exist
          return await DashboardModel.getDashboardStatsForUser(
            ctx,
            otherUserId
          );
        });

        // Application Stats
        expect(stats.applications.total).toBe(0);
        expect(stats.applications.submitted).toBe(0);
        expect(stats.applications.inProgress).toBe(0);
        expect(stats.applications.nextDeadline).toBeUndefined();

        // Document Stats
        expect(stats.documents.totalDocuments).toBe(0);
        expect(stats.documents.completedDocuments).toBe(0);
        expect(stats.documents.averageProgress).toBe(0);

        // AI Credits (should be default)
        expect(stats.aiCredits).not.toBeNull();
        expect(stats.aiCredits?.totalCredits).toBe(DEFAULT_AI_CREDITS);
        expect(stats.aiCredits?.usedCredits).toBe(0);

        // Recent Activity
        expect(stats.recentActivity).toEqual([]);
      });
    });
  });

  describe("Queries", () => {
    describe("getDashboardStats", () => {
      test("should return stats for the authenticated user", async () => {
        const stats = await asUser.query(
          api.dashboard.queries.getDashboardStats
        );

        // Verify a few key stats to ensure the query called the model correctly
        expect(stats.applications.total).toBe(3);
        expect(stats.applications.nextDeadline).toBe(deadline2);
        expect(stats.documents.totalDocuments).toBe(4);
        expect(stats.recentActivity).toHaveLength(12);
      });

      test("should return default/empty stats for a newly authenticated user with no data", async () => {
        // Use asOtherUser who has no data set up in beforeEach
        const stats = await asOtherUser.query(
          api.dashboard.queries.getDashboardStats
        );

        expect(stats.applications.total).toBe(0);
        expect(stats.applications.nextDeadline).toBeUndefined();
        expect(stats.documents.totalDocuments).toBe(0);
        expect(stats.recentActivity).toEqual([]);
      });

      test("should throw error if user is not authenticated", async () => {
        // Use t without identity
        await expect(
          t.query(api.dashboard.queries.getDashboardStats)
        ).rejects.toThrow(); // Should throw error because getCurrentUserIdOrThrow fails
      });
    });
  });
});
