import { query } from "./_generated/server";
import { v } from "convex/values";

export const getProfile = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
  },
});

export const checkOnboardingStatus = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
    
    return {
      isComplete: profile?.onboardingCompleted ?? false,
      currentStep: profile ? getNextIncompleteStep(profile) : "personal",
    };
  },
});

function getNextIncompleteStep(profile: any): string {
  if (!profile.countryOfOrigin || !profile.dateOfBirth || !profile.currentLocation || !profile.nativeLanguage) {
    return "personal";
  }
  if (!profile.educationLevel || !profile.major || !profile.university || !profile.gpa) {
    return "education";
  }
  if (!profile.targetDegree || !profile.intendedField || !profile.researchInterests || !profile.careerObjectives) {
    return "career";
  }
  return "completed";
}
