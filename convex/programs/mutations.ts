import { v } from "convex/values";
import { mutation } from "../_generated/server";

/**
 * Creates a new academic program associated with a university.
 * 
 * @param ctx - The mutation context
 * @param args - Object containing program details (university ID, name, degree, etc.)
 * @returns The ID of the newly created program
 * @throws Error if the user is not authenticated or if the university is not found
 */
export const create = mutation({
  args: {
    universityId: v.id("universities"),
    name: v.string(),
    degree: v.string(),
    department: v.string(),
    website: v.optional(v.string()),
    requirements: v.object({
      minimumGPA: v.optional(v.number()),
      gre: v.optional(v.boolean()),
      toefl: v.optional(v.boolean()),
      recommendationLetters: v.optional(v.number()),
    }),
    deadlines: v.object({
      fall: v.optional(v.union(v.string(), v.null())),
      spring: v.optional(v.union(v.string(), v.null())),
    }),
  },
  handler: async (ctx, args) => {
    // Get the current authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: You must be logged in to create a program");
    }

    // Verify the university exists
    const university = await ctx.db.get(args.universityId);
    if (!university) {
      throw new Error("University not found");
    }

    // Create the program
    const programId = await ctx.db.insert("programs", {
      universityId: args.universityId,
      name: args.name,
      degree: args.degree,
      department: args.department,
      requirements: {
        minimumGPA: args.requirements.minimumGPA,
        gre: args.requirements.gre || false,
        toefl: args.requirements.toefl || false,
        recommendationLetters: args.requirements.recommendationLetters,
      },
      deadlines: {
        fall: args.deadlines.fall === null ? undefined : args.deadlines.fall,
        spring: args.deadlines.spring === null ? undefined : args.deadlines.spring,
      },
      website: args.website,
    });

    return programId;
  },
});