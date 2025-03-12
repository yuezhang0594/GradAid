import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "../_generated/dataModel";

// Define types for better type safety
type Program = Doc<"programs">;
type Favorite = Doc<"favorites">;

// Toggle a program as favorite
export const toggleFavorite = mutation({
  args: {
    userId: v.string(),
    programId: v.id("programs"),
  },
  returns: v.boolean(),
  handler: async (ctx, args) : Promise<boolean> => {
    const { userId, programId } = args;
    
    // Check if this favorite already exists
    const existingFavorite = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("programId"), programId))
      .first();
    
    // If it exists, remove it (toggle off)
    if (existingFavorite) {
      await ctx.db.delete(existingFavorite._id);
      return false; // No longer favorited
    }
    
    // Otherwise, add it (toggle on)
    await ctx.db.insert("favorites", {
      userId,
      programId,
      createdAt: new Date().toISOString(),
    });
    
    return true; // Now favorited
  },
});

// Check if a program is favorited
export const isFavorite = query({
  args: {
    userId: v.string(),
    programId: v.id("programs"),
  },
  returns: v.boolean(),
  handler: async (ctx, args): Promise<boolean> => {
    const { userId, programId } = args;
    
    const favorite = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("programId"), programId))
      .first();
    
    return favorite !== null;
  },
});

// Get all favorited programs for a user
export const getFavoritePrograms = query({
  args: {
    userId: v.string(),
  },
  returns: v.array(v.object({
    _id: v.id("programs"),
    name: v.string(),
    degree: v.string(),
    department: v.string(),
    requirements: v.any(),
    universityId: v.id("universities")
  })),
  handler: async (ctx, args): Promise<Array<Program>> => {
    const { userId } = args;
    
    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    
    // Get all program objects directly
    const programs = await Promise.all(
      favorites.map(async (favorite) => {
        const program = await ctx.db.get(favorite.programId);
        return program;
      })
    );
    
    // Filter out any null values
    return programs.filter((program): program is Program => program !== null);
  },
});

// Get all program IDs that a user has favorited
export const getFavoriteProgramIds = query({
  args: {
    userId: v.string(),
  },
  returns: v.array(
    v.object({
      programId: v.id("programs"),
    })
  ),
  handler: async (ctx, args) => {
    const { userId } = args;
    
    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    
    return favorites.map(favorite => ({
      programId: favorite.programId,
    }));
  },
});

// Delete a favorite by ID
export const deleteFavorite = mutation({
  args: {
    favoriteId: v.id("favorites"),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.favoriteId);
    return true;
  },
});
