import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { getCurrentUserIdOrThrow } from "../users";
import { getUniversitiesHelper } from "./search";
// Toggle a program as favorite
export const toggleFavorite = mutation({
    args: {
        programId: v.id("programs"),
    },
    returns: v.boolean(),
    handler: async (ctx, args) => {
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
    handler: async (ctx, args) => {
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
async function getFavoriteProgramsHelper(ctx) {
    const userId = await getCurrentUserIdOrThrow(ctx);
    const favorites = await ctx.db
        .query("favorites")
        .withIndex("by_user", q => q.eq("userId", userId))
        .collect();
    // Get all program objects directly
    const programs = await Promise.all(favorites.map(async (favorite) => {
        const program = await ctx.db.get(favorite.programId);
        return program;
    }));
    // Filter out any null values
    return programs.filter((program) => program !== null);
}
// Get all favorited programs for a user
export const getFavoritePrograms = query({
    args: {},
    handler: async (ctx, args) => {
        const userId = await getCurrentUserIdOrThrow(ctx);
        return getFavoriteProgramsHelper(ctx);
    },
});
// Get all program IDs that a user has favorited
export const getFavoriteProgramIds = query({
    args: {},
    returns: v.array(v.object({
        programId: v.id("programs"),
    })),
    handler: async (ctx, args) => {
        const userId = await getCurrentUserIdOrThrow(ctx);
        const favorites = await ctx.db
            .query("favorites")
            .withIndex("by_user", q => q.eq("userId", userId))
            .collect();
        return favorites.map((favorite) => ({
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
export const getFavoriteProgramsWithUniversity = query({
    args: {},
    handler: async (ctx, args) => {
        // Get all favorited programs
        const programs = await getFavoriteProgramsHelper(ctx);
        // Get universities associated with these programs
        const universityIds = programs.map(favorite => favorite.universityId);
        const universities = await getUniversitiesHelper(ctx, universityIds);
        // Attach university details to each program and filter out programs without matching university
        const programsWithUniversity = programs
            .map(program => {
            const university = universities.find(u => u._id === program.universityId);
            if (!university)
                return null;
            return {
                ...program,
                university: university,
            };
        })
            .filter((p) => p !== null);
        return programsWithUniversity;
    },
});
