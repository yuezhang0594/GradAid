import { internalMutation } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { WithoutSystemFields } from "convex/server";
import { v } from "convex/values";
import universities from "./universities.json";

type University = Doc<"universities">
type UniversityInput = WithoutSystemFields<University>

type Program = Doc<"programs">
type ProgramInput = WithoutSystemFields<Program>

export default internalMutation({
    args: {},
    handler: async (ctx, args) => {
        const tablesToClear = [
            "universities",
            "programs",
        ] as const;

        for (const table of tablesToClear) {
            await ctx.db
                .query(table)
                .collect()
                .then(existingData => {
                    return Promise.all(
                        existingData.map(item =>
                            ctx.db.delete(item._id)
                        )
                    );
                });
        }

         universities.map((university) => ({
            ranking: university.ranking,
            name: university.name,
            location: university.location,
            website: university.website
        })).forEach(async (university) => {
            await ctx.db.insert("universities", university);
        });
    }
});