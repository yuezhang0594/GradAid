import { v } from "convex/values";
import { query } from "../_generated/server";
import * as UniversityModel from "./model";
import { getUniversitiesByIds } from "./model";

/**
 * Retrieves a university by its ID from the database.
 * 
 * @param args.universityId - The unique identifier of the university to retrieve
 * @returns The university object matching the provided ID
 * @throws Error if the university with the specified ID is not found
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

/**
 * Retrieves multiple universities based on their IDs.
 * 
 * @param ctx - The Convex query context
 * @param args - The query arguments
 * @param args.universityIds - Array of university document IDs to retrieve
 * @returns Promise that resolves to an array of university objects corresponding to the provided IDs
 */
export const getUniversities = query({
    args: { universityIds: v.array(v.id("universities")) },
    handler: async (ctx, args) => {
        const { universityIds } = args;
        return await getUniversitiesByIds(ctx, universityIds);
    },
});

/**
 * Retrieves a list of all universities sorted alphabetically by name.
 * 
 * @remarks
 * This query uses the "by_name" index to efficiently retrieve sorted results.
 * 
 * @returns An array of university documents from the "universities" table,
 * sorted in ascending order by name.
 */
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