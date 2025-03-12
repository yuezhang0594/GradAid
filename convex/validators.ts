import { v } from "convex/values";

// Education validator
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

// Work experience validator
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

// Publication validator
export const publicationValidator = v.object({
    title: v.string(),
    authors: v.array(v.string()),
    journal: v.optional(v.string()),
    conference: v.optional(v.string()),
    year: v.number(),
    doi: v.optional(v.string()),
    url: v.optional(v.string())
});

// Research experience validator
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

// Profile update validator 
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
