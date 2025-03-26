import { v } from "convex/values";
import { Doc, Id } from "../_generated/dataModel";
import { mutation, query, MutationCtx, QueryCtx } from "../_generated/server";
import { getCurrentUserIdOrThrow } from "../users";
import { getUniversitiesHelper } from "./search";

// Define types for better type safety
type Program = Doc<"programs">;
type ProgramWithUniversity = Program & { university: Doc<"universities"> };
type Favorite = Doc<"favorites">;
type User = Doc<"users">;

// Toggle a program as favorite
export const toggleFavorite = mutation({
  args: {
    programId: v.id("programs"),
  },
  returns: v.boolean(),
  handler: async (ctx: MutationCtx, args): Promise<boolean> => {
    const { programId } = args;

    const userId = await getCurrentUserIdOrThrow(ctx);

    // Check if this favorite already exists
    const existingFavorite = await ctx.db
      .query("favorites")
      .withIndex("by_user", q => q.eq("userId", userId))
      .filter(q => q.eq(q.field("programId"), programId))
      .unique();

    // If it exists, remove it (toggle off)
    if (existingFavorite) {
      await ctx.db.delete(existingFavorite._id);
      return false; // No longer favorited
    }

    // Otherwise, add it (toggle on)
    await ctx.db.insert("favorites", {
      userId,
      programId,
    });

    return true; // Now favorited
  },
});

// Check if a program is favorited
export const isFavorite = query({
  args: {
    programId: v.id("programs"),
  },
  returns: v.boolean(),
  handler: async (ctx: QueryCtx, args): Promise<boolean> => {
    const { programId } = args;

    const userId = await getCurrentUserIdOrThrow(ctx);

    const favorite = await ctx.db
      .query("favorites")
      .withIndex("by_user", q => q.eq("userId", userId))
      .filter(q => q.eq(q.field("programId"), programId))
      .unique();

    return favorite !== null;
  },
});

// Helper function for getting favorited programs
async function getFavoriteProgramsHelper(
  ctx: QueryCtx,
): Promise<Array<Program>> {
  const userId = await getCurrentUserIdOrThrow(ctx);
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
}

// Get all favorited programs for a user
export const getFavoritePrograms = query({
  args: {},
  handler: async (ctx: QueryCtx, args): Promise<Array<Program>> => {
    const userId = await getCurrentUserIdOrThrow(ctx);
    return getFavoriteProgramsHelper(ctx);
  },
});

// Get all program IDs that a user has favorited
export const getFavoriteProgramIds = query({
  args: {},
  returns: v.array(
    v.object({
      programId: v.id("programs"),
    })
  ),
  handler: async (ctx: QueryCtx, args) => {
    const userId = await getCurrentUserIdOrThrow(ctx);

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

export const getFavoriteProgramsWithUniversity = query({
  args: {},
  handler: async (ctx: QueryCtx, args): Promise<Array<ProgramWithUniversity>> => {
    // Get all favorited programs
    const programs = await getFavoriteProgramsHelper(ctx);
    // Get universities associated with these programs
    const universityIds = programs.map(favorite => favorite.universityId);
    const universities = await getUniversitiesHelper(ctx, universityIds);

    // Attach university details to each program and filter out programs without matching university
    const programsWithUniversity = programs
      .map(program => {
        const university = universities.find(u => u._id === program.universityId);
        if (!university) return null;
        return {
          ...program,
          university: university,
        };
      })
      .filter((p): p is ProgramWithUniversity => p !== null);

    return programsWithUniversity;
  },
});