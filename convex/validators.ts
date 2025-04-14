import { v } from "convex/values";
import { z } from "zod";

/**
 * Validator for educational background information
 * Used to validate user education entries in profile updates
 */
export const educationValidator = v.object({
    id: v.optional(v.string()),
    degree: v.string(),
    institution: v.string(),
    field: v.string(),
    gpa: v.optional(v.number()),
    startDate: v.string(), // Store as ISO string
    graduationDate: v.string(), // Store as ISO string
    description: v.optional(v.string()),
    courses: v.optional(v.array(v.string()))
});

/**
 * Validator for work experience information
 * Used to validate user work history entries in profile updates
 */
export const workExperienceValidator = v.object({
    id: v.optional(v.string()),
    title: v.string(),
    company: v.string(),
    location: v.optional(v.string()),
    startDate: v.string(), // Store as ISO string
    endDate: v.optional(v.string()), // Store as ISO string
    current: v.boolean(),
    description: v.string(),
    achievements: v.optional(v.array(v.string()))
});

/**
 * Validator for academic publication information
 * Used to validate publication entries within research experience
 */
export const publicationValidator = v.object({
    title: v.string(),
    authors: v.array(v.string()),
    journal: v.optional(v.string()),
    conference: v.optional(v.string()),
    year: v.number(),
    doi: v.optional(v.string()),
    url: v.optional(v.string())
});

/**
 * Validator for research experience information
 * Used to validate user research history entries in profile updates
 */
export const researchExperienceValidator = v.object({
    id: v.optional(v.string()),
    title: v.string(),
    institution: v.string(),
    supervisor: v.optional(v.string()),
    startDate: v.string(), // Store as ISO string
    endDate: v.optional(v.string()), // Store as ISO string
    current: v.boolean(),
    description: v.string(),
    publications: v.optional(v.array(publicationValidator))
});

/**
 * Validator for profile update operations
 * Used to validate the structure of user profile data during updates
 * Contains both basic profile information and detailed background information
 */
export const profileUpdateValidator = v.object({
    // Basic profile information
    description: v.string(),
    websiteUrl: v.string(),
    githubUrl: v.string(),
    linkedInUrl: v.string(),
    profileComplete: v.optional(v.boolean()),

    // Detailed profile information
    education: v.optional(v.array(educationValidator)),
    workExperience: v.optional(v.array(workExperienceValidator)),
    achievements: v.optional(v.array(v.string())),
    researchExperience: v.optional(v.array(researchExperienceValidator)),
    skills: v.optional(v.array(v.string())),
    careerGoals: v.optional(v.string()),
});

/**
 * Zod schema for validating user feedback submissions
 * Includes positive feedback, negative feedback, and a numerical rating
 * Trims string inputs and transforms empty strings to undefined
 */
export const feedbackSchema = z.object({
    positive: z.string().optional().transform(val => val?.trim() || undefined),
    negative: z.string().optional().transform(val => val?.trim() || undefined),
    rating: z.number().int().min(1).max(5)
});

/**
 * TypeScript type definition for feedback input data
 * Generated from the Zod schema for type safety across the application
 */
export type FeedbackInput = z.infer<typeof feedbackSchema>;