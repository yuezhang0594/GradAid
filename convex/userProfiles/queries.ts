import { query } from "../_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "../_generated/dataModel";
import { getCurrentUserIdOrThrow } from "../users";

/**
 * Retrieves the current user's profile information.
 * 
 * @returns The complete user profile or null if it doesn't exist
 */
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

/**
 * Checks the current user's onboarding status and determines the next step.
 * 
 * @returns Object containing the current onboarding step and completion status
 */
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

/**
 * Determines the next incomplete step in the user profile onboarding process.
 * 
 * @param profile - The user profile document
 * @returns The next incomplete step identifier: "personal-info", "education", "test-scores", "career-goals", or "complete"
 */
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

/**
 * Retrieves all applications for the current user with their associated documents.
 * 
 * @returns Array of applications with their associated documents
 */
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

/**
 * Retrieves dashboard statistics for the current user including application counts, 
 * document statuses, AI credits, and recent activity.
 * 
 * @returns Dashboard statistics object with applications, documents, aiCredits and recentActivity
 */
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

/**
 * Retrieves recent activity records for the current user.
 * 
 * @param limit - Optional limit on number of records to return (defaults to 12)
 * @returns Array of recent activity records
 */
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

/**
 * Retrieves the AI credits for the current user.
 * 
 * @returns AI credits object or null if no credits exist
 */
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

/**
 * Retrieves the name of the current user.
 * 
 * @returns The user's name or an empty string if not found
 */
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

