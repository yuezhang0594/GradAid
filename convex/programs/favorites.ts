import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "../_generated/dataModel";
import { MutationCtx, QueryCtx } from "../_generated/server";

// Define types for better type safety
type Program = Doc<"programs">;
type Favorite = Doc<"favorites">;
type User = Doc<"users">;

// Helper function to get Convex user ID from Clerk user ID
async function getConvexUserId(ctx: QueryCtx | MutationCtx, clerkUserId: string): Promise<Id<"users"> | null> {
  // In Clerk's integration with Convex, the Clerk user ID is used as the Convex user ID
  return clerkUserId as Id<"users">;
}

// Toggle a program as favorite
export const toggleFavorite = mutation({
  args: {
    userId: v.string(), // Clerk user ID
    programId: v.id("programs"),
  },
  returns: v.boolean(),
  handler: async (ctx: MutationCtx, args): Promise<boolean> => {
    const { userId: clerkUserId, programId } = args;
    
    // Get Convex user ID (same as Clerk ID)
    const userId = await getConvexUserId(ctx, clerkUserId);
    if (!userId) {
      throw new Error("User not found");
    }

    // Check if this favorite already exists
    const existingFavorite = await ctx.db
      .query("favorites")
      .withIndex("by_user", q => q.eq("userId", userId))
      .filter(q => q.eq(q.field("programId"), programId))
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
    userId: v.string(), // Clerk user ID
    programId: v.id("programs"),
  },
  returns: v.boolean(),
  handler: async (ctx: QueryCtx, args): Promise<boolean> => {
    const { userId: clerkUserId, programId } = args;
    
    // Get Convex user ID (same as Clerk ID)
    const userId = await getConvexUserId(ctx, clerkUserId);
    if (!userId) {
      return false;
    }

    const favorite = await ctx.db
      .query("favorites")
      .withIndex("by_user", q => q.eq("userId", userId))
      .filter(q => q.eq(q.field("programId"), programId))
      .first();
    
    return favorite !== null;
  },
});

// Get all favorited programs for a user
export const getFavoritePrograms = query({
  args: {
    userId: v.string(), // Clerk user ID
  },
  returns: v.array(v.object({
    _id: v.id("programs"),
    name: v.string(),
    degree: v.string(),
    department: v.string(),
    requirements: v.any(),
    universityId: v.id("universities")
  })),
  handler: async (ctx: QueryCtx, args): Promise<Array<Program>> => {
    const { userId: clerkUserId } = args;
    
    // Get Convex user ID (same as Clerk ID)
    const userId = await getConvexUserId(ctx, clerkUserId);
    if (!userId) {
      return [];
    }

    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_user", q => q.eq("userId", userId))
      .collect();
    
    // Get all program objects directly
    const programs = await Promise.all(
      favorites.map(async (favorite: Favorite) => {
        const program = await ctx.db.get(favorite.programId);
        return program;
      })
    );
    
    // Filter out any null values
    return programs.filter((program: Program | null): program is Program => program !== null);
  },
});

// Get all program IDs that a user has favorited
export const getFavoriteProgramIds = query({
  args: {
    userId: v.string(), // Clerk user ID
  },
  returns: v.array(
    v.object({
      programId: v.id("programs"),
    })
  ),
  handler: async (ctx: QueryCtx, args) => {
    const { userId: clerkUserId } = args;
    
    // Get Convex user ID (same as Clerk ID)
    const userId = await getConvexUserId(ctx, clerkUserId);
    if (!userId) {
      return [];
    }

    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_user", q => q.eq("userId", userId))
      .collect();
    
    return favorites.map((favorite: Favorite) => ({
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
  handler: async (ctx: MutationCtx, args) => {
    await ctx.db.delete(args.favoriteId);
    return true;
  },
});
