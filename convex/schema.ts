import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
  universities: defineTable({
    name: v.string(),
    location: v.object({
      city: v.string(),
      state: v.string(),
      country: v.string(),
      region: v.optional(v.string()),
    }),
    programs: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        degree: v.string(),
        department: v.string(),
        requirements: v.object({
          gre: v.boolean(),
          greRequired: v.optional(v.boolean()),
          grePreferred: v.optional(v.boolean()),
          greWaiver: v.optional(v.boolean()),
          toefl: v.boolean(),
          toeflMinimum: v.optional(v.number()),
          ielts: v.optional(v.boolean()),
          ieltsMinimum: v.optional(v.number()),
          minimumGPA: v.number(),
          applicationFee: v.number(),
          recommendationLetters: v.number(),
          statementRequired: v.boolean(),
          cvRequired: v.boolean(),
          writingSampleRequired: v.optional(v.boolean()),
          portfolioRequired: v.optional(v.boolean()),
          interviewRequired: v.optional(v.boolean()),
        }),
        deadlines: v.object({
          fall: v.union(v.string(), v.null()),
          spring: v.union(v.string(), v.null()),
          summer: v.union(v.string(), v.null()),
          priority: v.optional(v.union(v.string(), v.null())),
          funding: v.optional(v.union(v.string(), v.null())),
        }),
        acceptanceRate: v.optional(v.number()),
        tuition: v.optional(v.number()),
        duration: v.optional(v.string()),
        website: v.optional(v.string()),
        facultyStrengths: v.optional(v.array(v.string())),
        researchAreas: v.optional(v.array(v.string())),
      })
    ),
    ranking: v.optional(v.number()),
    website: v.string(),
    description: v.optional(v.string()),
    admissionStats: v.optional(
      v.object({
        applicants: v.optional(v.number()),
        admitted: v.optional(v.number()),
        enrolled: v.optional(v.number()),
        acceptanceRate: v.optional(v.number()),
        averageGPA: v.optional(v.number()),
        averageGRE: v.optional(
          v.object({
            verbal: v.optional(v.number()),
            quantitative: v.optional(v.number()),
            analytical: v.optional(v.number()),
          })
        ),
      })
    ),
    imageUrl: v.optional(v.string()),
  })
    .index("by_name", ["name"])
    .index("by_country", ["location.country"])
    .index("by_ranking", ["ranking"])
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: ["location.country", "ranking"],
    }),

  favorites: defineTable({
    userId: v.string(),
    universityId: v.id("universities"),
    programId: v.union(v.string(), v.null()),
    createdAt: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_university", ["userId", "universityId"]),
});

export default schema;