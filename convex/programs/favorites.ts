import { v } from "convex/values";
import { Doc, Id } from "../_generated/dataModel";
import { mutation, query, MutationCtx, QueryCtx } from "../_generated/server";
import { getCurrentUserIdOrThrow } from "../users";
import * as UniversityModel from "../universities/model";

// Define types for better type safety
type Program = Doc<"programs">;
type ProgramWithUniversity = Program & { university: Doc<"universities"> };
type Favorite = Doc<"favorites">;
type User = Doc<"users">;

/**
 * Toggles a program's favorite status for the current user.
 * If the program is already favorited, it will be unfavorited, and vice versa.
 * 
 * @param ctx - The mutation context
 * @param args - Object containing the program ID to toggle
 * @returns A boolean indicating if the program is now favorited (true) or unfavorited (false)
 */
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

/**
 * Checks if a program is favorited by the current user.
 * 
 * @param ctx - The query context
 * @param args - Object containing the program ID to check
 * @returns A boolean indicating if the program is favorited (true) or not (false)
 */
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

/**
 * Helper function to retrieve all programs favorited by the current user.
 * 
 * @param ctx - The query context
 * @returns A promise resolving to an array of favorited Program objects
 */
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

/**
 * Gets all programs that the current user has favorited.
 * 
 * @param ctx - The query context
 * @param args - Empty object as this function takes no arguments
 * @returns A promise resolving to an array of favorited Program objects
 */
export const getFavoritePrograms = query({
  args: {},
  handler: async (ctx: QueryCtx, args): Promise<Array<Program>> => {
    const userId = await getCurrentUserIdOrThrow(ctx);
    return getFavoriteProgramsHelper(ctx);
  },
});

/**
 * Gets all program IDs that the current user has favorited.
 * 
 * @param ctx - The query context
 * @param args - Empty object as this function takes no arguments
 * @returns An array of objects containing program IDs
 */
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

/**
 * Deletes a favorite by its ID.
 * 
 * @param ctx - The mutation context
 * @param args - Object containing the favorite ID to delete
 * @returns A boolean indicating successful deletion
 */
export const deleteFavorite = mutation({
  args: {
    favoriteId: v.id("favorites"),
  },
  returns: v.boolean(),
  handler: async (ctx: MutationCtx, args) => {
    const userId = await getCurrentUserIdOrThrow(ctx);
    const favorite = await ctx.db.get(args.favoriteId);
    if (favorite?.userId !== userId) {
      throw new Error("You do not have permission to delete this favorite.");
    }
    await ctx.db.delete(args.favoriteId);
    return true;
  },
});

/**
 * Gets all favorited programs with their associated university data.
 * 
 * @param ctx - The query context
 * @param args - Empty object as this function takes no arguments
 * @returns A promise resolving to an array of programs with attached university data
 */
export const getFavoriteProgramsWithUniversity = query({
  args: {},
  handler: async (ctx: QueryCtx, args): Promise<Array<ProgramWithUniversity>> => {
    // Get all favorited programs
    const programs = await getFavoriteProgramsHelper(ctx);
    // Get universities associated with these programs
    const universityIds = programs.map(favorite => favorite.universityId);
    const universities = await UniversityModel.getUniversitiesByIds(ctx, universityIds);

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