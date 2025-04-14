import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { educationValidator, workExperienceValidator, publicationValidator, researchExperienceValidator } from './validators';

const schema = defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    clerkId: v.string(),
  }).index("byClerkId", ["clerkId"]),

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

  userProfiles: defineTable({
    userId: v.id("users"),
    // Personal Info
    countryOfOrigin: v.string(),
    dateOfBirth: v.string(),
    currentLocation: v.string(),
    nativeLanguage: v.string(),

    // Education
    educationLevel: v.string(),
    major: v.string(),
    university: v.string(),
    gpa: v.number(),
    gpaScale: v.number(),
    graduationDate: v.string(),
    researchExperience: v.optional(v.string()),

    // Test Scores
    greScores: v.optional(v.object({
      verbal: v.number(),
      quantitative: v.number(),
      analyticalWriting: v.number(),
      testDate: v.string(),
    })),
    englishTest: v.optional(v.object({
      type: v.union(v.literal("TOEFL"), v.literal("IELTS")),
      overallScore: v.number(),
      sectionScores: v.record(v.string(), v.number()),
      testDate: v.string(),
    })),

    // Career Goals
    targetDegree: v.string(),
    intendedField: v.string(),
    researchInterests: v.array(v.string()),
    careerObjectives: v.string(),
    targetLocations: v.array(v.string()),
    expectedStartDate: v.string(),
    budgetRange: v.optional(v.string()),

    // Metadata
    createdAt: v.string(),
    updatedAt: v.string(),
    onboardingCompleted: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_completion", ["onboardingCompleted"]),

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
    .index("by_department", ["department"])
    .searchIndex("search_programs", {
      searchField: "name",
      filterFields: ["universityId", "degree", "department"],
    }),

  applications: defineTable({
    userId: v.id("users"),
    universityId: v.id("universities"),
    programId: v.id("programs"),
    status: v.union(
      v.literal("draft"),
      v.literal("in_progress"),
      v.literal("submitted"),
      v.literal("accepted"),
      v.literal("rejected")
    ),
    submissionDate: v.optional(v.string()),
    deadline: v.string(),
    priority: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
    notes: v.optional(v.string()),
    lastUpdated: v.string(),
    requirements: v.array(
      v.object({
        type: v.string(),
        status: v.union(
          v.literal("completed"),
          v.literal("in_progress"),
          v.literal("pending"),
          v.literal("not_started")
        ),
      })
    ),
  })
    .index("by_user", ["userId"])
    .index("by_university", ["universityId"])
    .index("by_program", ["programId"])
    .index("by_deadline", ["deadline"]),

  applicationDocuments: defineTable({
    applicationId: v.id("applications"),
    userId: v.id("users"),
    title: v.string(),
    type: v.union(
      v.literal("sop"),
      v.literal("research_statement"),
      v.literal("lor"),
      v.literal("transcript"),
      v.literal("cv"),
      v.literal("other")
    ),
    status: v.union(
      v.literal("draft"),
      v.literal("in_review"),
      v.literal("complete")
    ),
    progress: v.number(),
    lastEdited: v.string(),
    aiSuggestionsCount: v.optional(v.number()),
    content: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_application", ["applicationId"])
    .index("by_type", ["type"]),

  letterOfRecommendations: defineTable({
    applicationId: v.id("applications"),
    userId: v.id("users"),
    recommenderName: v.string(),
    recommenderEmail: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("submitted")
    ),
    requestedDate: v.string(),
    submittedDate: v.optional(v.string()),
    remindersSent: v.number(),
    lastReminderDate: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_application", ["applicationId"])
    .index("by_email", ["recommenderEmail"]),

  aiCredits: defineTable({
    userId: v.id("users"),
    totalCredits: v.number(),
    usedCredits: v.number(),
    resetDate: v.string(),
  }).index("by_user", ["userId"]),

  aiCreditUsage: defineTable({
    userId: v.id("users"),
    type: v.string(),
    credits: v.number(),
    timestamp: v.string(),
    description: v.optional(v.string()),
  }).index("by_user", ["userId"]),

  userActivity: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("document_edit"),
      v.literal("application_update"),
      v.literal("lor_request"),
      v.literal("lor_update"),
      v.literal("ai_usage"),
      v.literal("feedback_submission"),
    ),
    description: v.string(),
    timestamp: v.string(),
    metadata: v.object({
      documentId: v.optional(v.id("applicationDocuments")),
      applicationId: v.optional(v.id("applications")),
      lorId: v.optional(v.id("letterOfRecommendations")),
      creditsUsed: v.optional(v.number()),
      oldStatus: v.optional(v.string()),
      newStatus: v.optional(v.string()),
      oldProgress: v.optional(v.number()),
      newProgress: v.optional(v.number()),
      remainingCredits: v.optional(v.number()),
    }),
  })
    .index("by_user", ["userId"])
    .index("by_type", ["type"])
    .index("by_timestamp", ["timestamp"]),

  favorites: defineTable({
    userId: v.id("users"),
    programId: v.id("programs")
  })
    .index("by_user", ["userId"])
    .index("by_program", ["programId"]),

  feedback: defineTable({
    userId: v.id("users"),
    positive: v.optional(v.string()),
    negative: v.optional(v.string()),
    rating: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_rating", ["rating"]),
});


export default schema;