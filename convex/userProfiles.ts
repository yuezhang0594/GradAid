import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Helper function to determine next incomplete step
function getNextIncompleteStep(profile: any) {
  if (!profile.countryOfOrigin || !profile.dateOfBirth || !profile.currentLocation || !profile.nativeLanguage) {
    return "personal-info";
  }
  
  if (!profile.educationLevel || !profile.major || !profile.university || !profile.gpa || !profile.graduationDate) {
    return "education";
  }
  
  if (!profile.targetDegree || !profile.intendedField || !profile.researchInterests || !profile.careerObjectives) {
    return "career-goals";
  }
  
  return "complete";
}

// Queries
export const getProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
  },
});

export const checkOnboardingStatus = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
    
    return profile ? getNextIncompleteStep(profile) : "personal-info";
  },
});

// Mutations
export const savePersonalInfo = mutation({
  args: {
    userId: v.id("users"),
    countryOfOrigin: v.string(),
    dateOfBirth: v.string(),
    currentLocation: v.string(),
    nativeLanguage: v.string(),
  },
  handler: async (ctx, args) => {
    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existingProfile) {
      return await ctx.db.patch(existingProfile._id, {
        countryOfOrigin: args.countryOfOrigin,
        dateOfBirth: args.dateOfBirth,
        currentLocation: args.currentLocation,
        nativeLanguage: args.nativeLanguage,
        updatedAt: new Date().toISOString(),
      });
    }

    // Initialize with default values for required fields
    return await ctx.db.insert("userProfiles", {
      userId: args.userId,
      countryOfOrigin: args.countryOfOrigin,
      dateOfBirth: args.dateOfBirth,
      currentLocation: args.currentLocation,
      nativeLanguage: args.nativeLanguage,
      // Required fields with default values
      educationLevel: "",
      major: "",
      university: "",
      gpa: 0,
      gpaScale: 4,
      graduationDate: "",
      targetDegree: "",
      intendedField: "",
      researchInterests: [],
      careerObjectives: "",
      targetLocations: [],
      expectedStartDate: "",
      // Optional fields
      researchExperience: undefined,
      greScores: undefined,
      englishTest: undefined,
      budgetRange: undefined,
      // Metadata
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      onboardingCompleted: false,
    });
  },
});

export const saveEducation = mutation({
  args: {
    userId: v.id("users"),
    educationLevel: v.string(),
    major: v.string(),
    university: v.string(),
    gpa: v.number(),
    gpaScale: v.number(),
    graduationDate: v.string(),
    researchExperience: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!existingProfile) {
      throw new Error("Personal information must be saved first");
    }

    return await ctx.db.patch(existingProfile._id, {
      educationLevel: args.educationLevel,
      major: args.major,
      university: args.university,
      gpa: args.gpa,
      gpaScale: args.gpaScale,
      graduationDate: args.graduationDate,
      researchExperience: args.researchExperience,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const saveTestScores = mutation({
  args: {
    userId: v.id("users"),
    greScores: v.optional(
      v.object({
        verbal: v.number(),
        quantitative: v.number(),
        analyticalWriting: v.number(),
        testDate: v.string(),
      })
    ),
    englishTest: v.optional(
      v.object({
        type: v.union(v.literal("TOEFL"), v.literal("IELTS")),
        overallScore: v.number(),
        sectionScores: v.record(v.string(), v.number()),
        testDate: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!existingProfile) {
      throw new Error("Personal information must be saved first");
    }

    return await ctx.db.patch(existingProfile._id, {
      greScores: args.greScores,
      englishTest: args.englishTest,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const saveCareerGoals = mutation({
  args: {
    userId: v.id("users"),
    targetDegree: v.string(),
    intendedField: v.string(),
    researchInterests: v.array(v.string()),
    careerObjectives: v.string(),
    targetLocations: v.array(v.string()),
    expectedStartDate: v.string(),
    budgetRange: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!existingProfile) {
      throw new Error("Personal information must be saved first");
    }

    return await ctx.db.patch(existingProfile._id, {
      targetDegree: args.targetDegree,
      intendedField: args.intendedField,
      researchInterests: args.researchInterests,
      careerObjectives: args.careerObjectives,
      targetLocations: args.targetLocations,
      expectedStartDate: args.expectedStartDate,
      budgetRange: args.budgetRange,
      onboardingCompleted: true,
      updatedAt: new Date().toISOString(),
    });
  },
});
