import { v } from "convex/values";
import { query } from "../_generated/server";
import * as ProgramModel from "./model";


/**
 * Get a program by its ID
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
 */
export const getProgramsByIds = query({
    args: {
        programIds: v.array(v.id("programs")),
    },
    handler: async (ctx, args) => {
        return await ProgramModel.getProgramsByIds(ctx, args.programIds);
    },
});