import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { get } from "http";
import { getCurrentUserIdOrThrow } from "../users";

/**
 * Determines the next incomplete step in the user profile onboarding process.
 * 
 * @param profile - The user profile object to evaluate
 * @returns The next incomplete step identifier: "personal-info", "education", "career-goals", or "complete"
 */
function getNextIncompleteStep(profile: any) {
  if (!profile || !profile.countryOfOrigin || !profile.dateOfBirth || !profile.currentLocation || !profile.nativeLanguage) {
    return "personal-info";
  }
  
  if (!profile.educationLevel || !profile.major || !profile.university || !profile.gpa || !profile.graduationDate) {
    return "education";
  }
  
  // Test scores are optional, so we'll skip this check and move to career goals
  // if (!profile.greScores && !profile.englishTest) {
  //   return "test-scores";
  // }
  
  if (!profile.targetDegree || !profile.intendedField || !profile.researchInterests || !profile.careerObjectives) {
    return "career-goals";
  }
  
  return "complete";
}

// Queries
/**
 * Retrieves the current user's profile.
 * 
 * @returns The complete user profile or null if it doesn't exist
 */
export const getProfile = query({
  args: {},
  handler: async (ctx, args) => {
    const userId = await getCurrentUserIdOrThrow(ctx);
    return await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
  },
});

/**
 * Checks the current user's onboarding completion status and returns the next step.
 * 
 * @returns Object containing isComplete status and the currentStep identifier
 */
export const checkOnboardingStatus = query({
  args: {},
  handler: async (ctx, args) => {
    const userId = await getCurrentUserIdOrThrow(ctx);
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    
    const currentStep = profile ? getNextIncompleteStep(profile) : "personal-info";
    return {
      isComplete: currentStep === "complete",
      currentStep
    };
  },
});

// Mutations
/**
 * Saves or updates the user's personal information in their profile.
 * Creates a new profile if one doesn't exist.
 * 
 * @param countryOfOrigin - The user's country of origin
 * @param dateOfBirth - The user's date of birth
 * @param currentLocation - The user's current location
 * @param nativeLanguage - The user's native language
 * @returns Object containing the next step ("education")
 */
export const savePersonalInfo = mutation({
  args: {
    countryOfOrigin: v.string(),
    dateOfBirth: v.string(),
    currentLocation: v.string(),
    nativeLanguage: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserIdOrThrow(ctx);
    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existingProfile) {
      await ctx.db.patch(existingProfile._id, {
        countryOfOrigin: args.countryOfOrigin,
        dateOfBirth: args.dateOfBirth,
        currentLocation: args.currentLocation,
        nativeLanguage: args.nativeLanguage,
        updatedAt: new Date().toISOString(),
      });
      return { currentStep: "education" };
    }

    // Initialize with default values for required fields
    await ctx.db.insert("userProfiles", {
      userId: userId,
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
    return { currentStep: "education" };
  },
});

/**
 * Saves or updates the user's education information.
 * Requires that personal information has already been saved.
 * 
 * @param educationLevel - The highest level of education completed
 * @param major - The user's field of study
 * @param university - The university attended
 * @param gpa - The user's GPA
 * @param gpaScale - The scale used for the GPA (typically 4.0)
 * @param graduationDate - The graduation date
 * @param researchExperience - Optional description of research experience
 * @returns Object containing the next step ("test-scores")
 */
export const saveEducation = mutation({
  args: {
    educationLevel: v.string(),
    major: v.string(),
    university: v.string(),
    gpa: v.number(),
    gpaScale: v.number(),
    graduationDate: v.string(),
    researchExperience: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserIdOrThrow(ctx);
    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!existingProfile) {
      throw new Error("Personal information must be saved first");
    }

    await ctx.db.patch(existingProfile._id, {
      educationLevel: args.educationLevel,
      major: args.major,
      university: args.university,
      gpa: args.gpa,
      gpaScale: args.gpaScale,
      graduationDate: args.graduationDate,
      researchExperience: args.researchExperience,
      updatedAt: new Date().toISOString(),
    });
    return { currentStep: "test-scores" };
  },
});

/**
 * Saves or updates the user's standardized test scores.
 * Requires that personal information has already been saved.
 * Test scores are optional for the overall profile completion.
 * 
 * @param greScores - Optional object containing GRE scores and test date
 * @param englishTest - Optional object containing English proficiency test details
 * @returns Object containing the next step ("career-goals")
 */
export const saveTestScores = mutation({
  args: {
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
    const userId = await getCurrentUserIdOrThrow(ctx);
    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!existingProfile) {
      throw new Error("Personal information must be saved first");
    }

    await ctx.db.patch(existingProfile._id, {
      greScores: args.greScores,
      englishTest: args.englishTest,
      updatedAt: new Date().toISOString(),
    });
    return { currentStep: "career-goals" };
  },
});

/**
 * Saves or updates the user's career goals and completes the onboarding process.
 * Requires that personal information has already been saved.
 * 
 * @param targetDegree - The degree the user is pursuing
 * @param intendedField - The user's intended field of study
 * @param researchInterests - Array of research interests
 * @param careerObjectives - Description of career objectives
 * @param targetLocations - Array of desired study locations
 * @param expectedStartDate - When the user expects to begin studies
 * @param budgetRange - Optional budget range for studies
 * @returns Object indicating completion ("complete")
 */
export const saveCareerGoals = mutation({
  args: {
    targetDegree: v.string(),
    intendedField: v.string(),
    researchInterests: v.array(v.string()),
    careerObjectives: v.string(),
    targetLocations: v.array(v.string()),
    expectedStartDate: v.string(),
    budgetRange: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserIdOrThrow(ctx);
    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!existingProfile) {
      throw new Error("Personal information must be saved first");
    }

    await ctx.db.patch(existingProfile._id, {
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
    return { currentStep: "complete" };
  },
});
