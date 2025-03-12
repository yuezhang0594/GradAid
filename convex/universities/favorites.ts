import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

// Toggle a university/program as favorite
export const toggleFavorite = mutation({
  args: {
    userId: v.string(),
    universityId: v.id("universities"),
    programId: v.optional(v.string()),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const { userId, universityId, programId } = args;
    
    // Check if this favorite already exists
    const existingFavorite = await ctx.db
      .query("favorites")
      .withIndex("by_user_and_university", (q) => 
        q.eq("userId", userId).eq("universityId", universityId)
      )
      .filter((q) => 
        programId ? q.eq(q.field("programId"), programId) : q.eq(q.field("programId"), null)
      )
      .first();
    
    // If it exists, remove it (toggle off)
    if (existingFavorite) {
      await ctx.db.delete(existingFavorite._id);
      return false; // No longer favorited
    }
    
    // Otherwise, add it (toggle on)
    await ctx.db.insert("favorites", {
      userId,
      universityId,
      programId: programId || null,
      createdAt: new Date().toISOString(),
    });
    
    return true; // Now favorited
  },
});

// Get a user's favorite universities/programs
export const getFavorites = query({
  args: {
    userId: v.string(),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const { userId } = args;
    
    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    
    // Fetch the full university objects for each favorite
    const universities = await Promise.all(
      favorites.map(async (favorite) => {
        const university = await ctx.db.get(favorite.universityId);
        if (!university) return null;
        
        // If it's a specific program favorite, filter to just that program
        if (favorite.programId) {
          return {
            ...university,
            programs: university.programs.filter(p => p.id === favorite.programId),
            favoriteId: favorite._id
          };
        }
        
        // Otherwise return the whole university
        return {
          ...university,
          favoriteId: favorite._id
        };
      })
    );
    
    return universities.filter(Boolean); // Filter out any nulls (in case a university was deleted)
  },
});
