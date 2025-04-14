import { query } from "../_generated/server";
import { v } from "convex/values";

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

export const getById = query({
  args: { universityId: v.id("universities") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.universityId);
  },
});