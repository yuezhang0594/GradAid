import { query } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentUserIdOrThrow, getDemoUserId } from "../users";
// Get all applications for a user with their associated documents and LORs
export const getApplications = query({
    args: { demoMode: v.optional(v.boolean()) },
    handler: async (ctx, args) => {
        // Try to get current user, if not available or demo mode is on, use mock user
        let userId;
        try {
            if (args.demoMode) {
                userId = await getDemoUserId(ctx);
            }
            else {
                userId = await getCurrentUserIdOrThrow(ctx);
            }
        }
        catch {
            userId = "mock-user-id";
        }
        const applications = await ctx.db
            .query("applications")
            .filter((q) => q.eq(q.field("userId"), userId))
            .collect();
        // Get documents and LORs for each application
        const applicationsWithDetails = await Promise.all(applications.map(async (application) => {
            const documents = await ctx.db
                .query("applicationDocuments")
                .filter((q) => q.eq(q.field("applicationId"), application._id))
                .collect();
            const lors = await ctx.db
                .query("letterOfRecommendations")
                .filter((q) => q.eq(q.field("applicationId"), application._id))
                .collect();
            return {
                ...application,
                documents,
                lors,
            };
        }));
        return applicationsWithDetails;
    },
});
// Get dashboard stats for a user
export const getDashboardStats = query({
    args: { demoMode: v.optional(v.boolean()) },
    handler: async (ctx, args) => {
        // Try to get current user, if not available or demo mode is on, use mock user
        let userId;
        try {
            if (args.demoMode) {
                userId = await getDemoUserId(ctx);
            }
            else {
                userId = await getCurrentUserIdOrThrow(ctx);
            }
        }
        catch {
            // Use mock user ID if authentication fails
            userId = "mock-user-id";
        }
        // Get applications count and status
        const applications = await ctx.db
            .query("applications")
            .filter((q) => q.eq(q.field("userId"), userId))
            .collect();
        const applicationStats = {
            total: applications.length,
            submitted: applications.filter((a) => a.status === "submitted").length,
            inProgress: applications.filter((a) => a.status === "in_progress").length,
            nextDeadline: applications
                .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())[0]
                ?.deadline,
        };
        // Get document progress
        const documents = await ctx.db
            .query("applicationDocuments")
            .filter((q) => q.eq(q.field("userId"), userId))
            .collect();
        const documentStats = {
            totalDocuments: documents.length,
            averageProgress: documents.length > 0
                ? documents.reduce((sum, doc) => sum + doc.progress, 0) / documents.length
                : 0,
            completedDocuments: documents.filter((d) => d.progress === 100).length,
        };
        // Get LOR stats
        const lors = await ctx.db
            .query("letterOfRecommendations")
            .filter((q) => q.eq(q.field("userId"), userId))
            .collect();
        const lorStats = {
            total: lors.length,
            submitted: lors.filter((l) => l.status === "submitted").length,
            pending: lors.filter((l) => l.status === "in_progress").length,
        };
        // Get AI credits
        const aiCredits = await ctx.db
            .query("aiCredits")
            .filter((q) => q.eq(q.field("userId"), userId))
            .first();
        // Get recent activity
        const recentActivity = await ctx.db
            .query("userActivity")
            .filter((q) => q.eq(q.field("userId"), userId))
            .order("desc")
            .take(12);
        return {
            applications: applicationStats,
            documents: documentStats,
            lors: lorStats,
            aiCredits: aiCredits ?? { totalCredits: 0, usedCredits: 0 },
            recentActivity,
        };
    },
});
// Get recent activity for a user
export const getRecentActivity = query({
    args: {
        demoMode: v.optional(v.boolean()),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        // Try to get current user, if not available or demo mode is on, use mock user
        let userId;
        try {
            if (args.demoMode) {
                userId = await getDemoUserId(ctx);
            }
            else {
                userId = await getCurrentUserIdOrThrow(ctx);
            }
        }
        catch {
            userId = "mock-user-id";
        }
        const limit = args.limit ?? 12;
        return await ctx.db
            .query("userActivity")
            .filter((q) => q.eq(q.field("userId"), userId))
            .order("desc")
            .take(limit);
    },
});
// Get AI credits for a user
export const getAiCredits = query({
    args: { demoMode: v.optional(v.boolean()) },
    handler: async (ctx, args) => {
        // Try to get current user, if not available or demo mode is on, use mock user
        let userId;
        try {
            if (args.demoMode) {
                userId = await getDemoUserId(ctx);
            }
            else {
                userId = await getCurrentUserIdOrThrow(ctx);
            }
        }
        catch {
            userId = "mock-user-id";
        }
        return await ctx.db
            .query("aiCredits")
            .filter((q) => q.eq(q.field("userId"), userId))
            .first();
    },
});
