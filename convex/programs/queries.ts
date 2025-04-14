import { query } from "../_generated/server";
import { v } from "convex/values";

export const list = query({
    args: {
        universityId: v.optional(v.id("universities")),
    },
    handler: async (ctx, args) => {
        let programsQuery = ctx.db.query("programs");

        // Filter by university if provided
        if (args.universityId) {
            programsQuery = programsQuery.filter((q) =>
                q.eq(q.field("universityId"), args.universityId)
            );
        }

        // Get all programs
        const programs = await programsQuery
            .withIndex("by_degree")
            .order("asc")
            .collect();

        // If we have programs, fetch their university names to include in the results
        if (programs.length > 0) {
            // Get unique university IDs
            const universityIds = [...new Set(programs.map(p => p.universityId))];

            // Fetch universities in a single batch
            const universities = await Promise.all(
                universityIds.map(id => ctx.db.get(id))
            );

            // Create a map of university ID to university object
            const universityMap = new Map();
            universities.forEach(univ => {
                if (univ) universityMap.set(univ._id, univ);
            });

            // Attach university name to each program
            return programs.map(program => ({
                ...program,
                universityName: universityMap.get(program.universityId)?.name || "Unknown University"
            }));
        }

        return programs;
    },
});

export const getById = query({
    args: {
        programId: v.id("programs")
    },
    handler: async (ctx, args) => {
        const program = await ctx.db.get(args.programId);
        if (!program) return null;

        // Get the university information
        const university = await ctx.db.get(program.universityId);

        return {
            ...program,
            universityName: university?.name || "Unknown University"
        };
    },
});