import { v } from "convex/values";
import { query } from "../_generated/server";
import * as ProgramModel from "./model";


/**
 * Get a program by its ID
 * 
 * @param ctx - The query context
 * @param programId - The ID of the program to retrieve
 * @returns The program with the specified ID
 * @throws Error if the program is not found
 */
export const getProgram = query({
    args: {
        programId: v.id("programs"),
    },
    handler: async (ctx, { programId }) => {
        const program = await ctx.db.get(programId);
        if (!program) {
            throw new Error(`Program with ID ${programId} not found`);
        }
        return program;
    },
});

/**
 * Get program objects from an array of program IDs
 * 
 * @param ctx - The query context
 * @param args - Object containing an array of program IDs to retrieve
 * @returns An array of program objects corresponding to the provided IDs
 */
export const getProgramsByIds = query({
    args: {
        programIds: v.array(v.id("programs")),
    },
    handler: async (ctx, args) => {
        return await ProgramModel.getProgramsByIds(ctx, args.programIds);
    },
});