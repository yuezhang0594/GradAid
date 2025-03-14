import { query } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";

// Get all applications for a user with their associated documents and LORs
export const getApplications = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const applications = await ctx.db
      .query("applications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Get documents and LORs for each application
    const applicationsWithDetails = await Promise.all(
      applications.map(async (application) => {
        const documents = await ctx.db
          .query("applicationDocuments")
          .withIndex("by_application", (q) => q.eq("applicationId", application._id))
          .collect();

        const lors = await ctx.db
          .query("letterOfRecommendations")
          .withIndex("by_application", (q) => q.eq("applicationId", application._id))
          .collect();

        return {
          ...application,
          documents,
          lors,
        };
      })
    );

    return applicationsWithDetails;
  },
});

// Get dashboard stats for a user
export const getDashboardStats = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // Get applications count and status
    const applications = await ctx.db
      .query("applications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
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
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
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
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const lorStats = {
      total: lors.length,
      submitted: lors.filter((l) => l.status === "submitted").length,
      pending: lors.filter((l) => l.status === "in_progress").length,
    };

    // Get AI credits
    const aiCredits = await ctx.db
      .query("aiCredits")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    // Get recent activity
    const recentActivity = await ctx.db
      .query("userActivity")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
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
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 12;
    return await ctx.db
      .query("userActivity")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);
  },
});

// Get AI credits for a user
export const getAiCredits = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("aiCredits")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
  },
});
