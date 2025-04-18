import { query } from "../_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "../_generated/dataModel";
import { getCurrentUserIdOrThrow } from "../users";

export const getProfile = query({
  args: {},
  handler: async (ctx, args) => {
    const userId = await getCurrentUserIdOrThrow(ctx);
    return await ctx.db
      .query("userProfiles")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();
  },
});

export const checkOnboardingStatus = query({
  args: {},
  handler: async (ctx, args) => {
    const userId = await getCurrentUserIdOrThrow(ctx);
    const profile = await ctx.db
      .query("userProfiles")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (!profile) {
      return {
        currentStep: "personal-info",
        isComplete: false,
      };
    }

    // Determine the current step based on what's completed
    const currentStep = getNextIncompleteStep(profile);

    return {
      currentStep,
      isComplete: currentStep === "complete",
    };
  },
});

function getNextIncompleteStep(profile: Doc<"userProfiles">): string {
  // Check if personalInfo exists and has all required fields
  if (!profile.countryOfOrigin ||
    !profile.dateOfBirth ||
    !profile.currentLocation ||
    !profile.nativeLanguage) {
    return "personal-info";
  }

  // Check if education exists and has all required fields
  if (!profile.educationLevel ||
    !profile.major ||
    !profile.university ||
    typeof profile.gpa !== 'number' ||
    typeof profile.gpaScale !== 'number' ||
    !profile.graduationDate) {
    return "education";
  }

  // Check if test scores section has been visited (all fields are optional)
  // We'll consider this step incomplete if neither greScores nor englishTest exists
  if (!profile.greScores && !profile.englishTest) {
    return "test-scores";
  }

  // Check if careerGoals exists and has all required fields
  if (!profile.targetDegree ||
    !profile.intendedField ||
    !Array.isArray(profile.researchInterests) ||
    profile.researchInterests.length === 0 ||
    !profile.careerObjectives ||
    !Array.isArray(profile.targetLocations) ||
    profile.targetLocations.length === 0 ||
    !profile.expectedStartDate) {
    return "career-goals";
  }

  return "complete";
}

// Get all applications for a user with their associated documents and LORs
export const getApplications = query({
  args: {},
  handler: async (ctx, args) => {
    const userId = await getCurrentUserIdOrThrow(ctx);
    const applications = await ctx.db
      .query("applications")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    // Get documents for each application
    const result = await Promise.all(
      applications.map(async (application) => {
        const documents = await ctx.db
          .query("applicationDocuments")
          .filter((q) => q.eq(q.field("applicationId"), application._id))
          .collect();

        return {
          ...application,
          documents,
        };
      })
    );

    return result;
  },
});

// Get dashboard stats for a user
export const getDashboardStats = query({
  args: {},
  handler: async (ctx, args) => {
    const userId = await getCurrentUserIdOrThrow(ctx);
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

    // Get documents count and status
    const documents = await ctx.db
      .query("applicationDocuments")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    const documentStats = {
      total: documents.length,
      complete: documents.filter((d) => d.status === "complete").length,
      inReview: documents.filter((d) => d.status === "in_review").length,
      draft: documents.filter((d) => d.status === "draft").length,
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
      aiCredits: aiCredits ?? { totalCredits: 0, usedCredits: 0 },
      recentActivity,
    };
  },
});

// Get recent activity for a user
export const getRecentActivity = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserIdOrThrow(ctx);
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
  args: {},
  handler: async (ctx, args) => {
    const userId = await getCurrentUserIdOrThrow(ctx);
    return await ctx.db
      .query("aiCredits")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();
  },
});

export const getUserName = query({
  args: {},
  handler: async (ctx, args) => {
    const userId = await getCurrentUserIdOrThrow(ctx);
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("_id"), userId))
      .first();
    return user?.name || "";
  },
});

