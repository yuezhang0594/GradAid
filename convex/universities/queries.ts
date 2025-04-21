import { v } from "convex/values";
import { query } from "../_generated/server";
import * as UniversityModel from "./model";
import { getUniversitiesByIds } from "./model";
/**
 * Get a university by its ID
 */
export const getUniversity = query({
  args: {
    universityId: v.id("universities"),
  },
  handler: async (ctx, { universityId }) => {
    const university = await ctx.db.get(universityId);
    if (!university) {
      throw new Error(`University with ID ${universityId} not found`);
    }
    return university;
  },
});
export const getUniversities = query({
    args: { universityIds: v.array(v.id("universities")) },
    handler: async (ctx, args) => {
        const { universityIds } = args;
        return await getUniversitiesByIds(ctx, universityIds);
    },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    // Fetch all universities and sort them by name
    const universities = await ctx.db
    .query("universities")
    .withIndex("by_name")
    .order("asc")
    .collect();
    
    return universities;
  },
});