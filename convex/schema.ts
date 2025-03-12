import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { educationValidator, workExperienceValidator, publicationValidator, researchExperienceValidator } from './validators';

const schema = defineSchema({

  // Do not alter users table. It is set by Clerk.
  users: defineTable({
    email: v.string(),
    emailVerificationTime: v.float64(),
    image: v.string(),
    name: v.string(),
  }),

  profiles: defineTable({
    userId: v.id("users"),
    // User profile fields for document generation
    description: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    githubUrl: v.optional(v.string()),
    linkedInUrl: v.optional(v.string()),
    profileComplete: v.boolean(),

    // Education details
    education: v.optional(v.array(educationValidator)),

    // Work experience details
    workExperience: v.optional(v.array(workExperienceValidator)),

    // Academic achievements
    achievements: v.optional(v.array(v.string())),

    // Research experience
    researchExperience: v.optional(v.array(researchExperienceValidator)),

    // Skills and career goals
    skills: v.optional(v.array(v.string())),
    careerGoals: v.optional(v.string()),
  })
    .index("by_user", ["userId"]),

  universities: defineTable({
    name: v.string(),
    location: v.object({
      city: v.string(),
      state: v.string(),
      country: v.string(),
    }),
    ranking: v.optional(v.number()),
    website: v.string(),
    imageUrl: v.optional(v.string()),
  })
    .index("by_name", ["name"])
    .index("by_country", ["location.country"])
    .index("by_ranking", ["ranking"])
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: ["location.country", "ranking"],
    }),

  programs: defineTable({
    universityId: v.id("universities"),
    name: v.string(),
    degree: v.string(),
    department: v.string(),
    requirements: v.object({
      minimumGPA: v.optional(v.number()),
      gre: v.optional(v.boolean()),
      toefl: v.optional(v.boolean()),
      recommendationLetters: v.optional(v.number()),
    }),
    deadlines: v.object({
      fall: v.optional(v.string()),
      spring: v.optional(v.string()),
    }),
    website: v.optional(v.string()),
  })
    .index("by_university", ["universityId"])
    .index("by_degree", ["degree"])
    .searchIndex("search_programs", {
      searchField: "name",
      filterFields: ["universityId", "degree"],
    }),

  favorites: defineTable({
    userId: v.string(),
    programId: v.id("programs"),
    createdAt: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_program", ["programId"]),
});

export default schema;