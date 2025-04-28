import { Doc, Id } from "../_generated/dataModel";
import { QueryCtx } from "../_generated/server";

type Program = Doc<"programs">;

/**
 * Retrieves multiple programs by their IDs in a single query.
 * 
 * @param ctx - The query context
 * @param programIds - Array of program IDs to retrieve
 * @returns A promise resolving to an array of Program objects
 */
export async function getProgramsByIds(
  ctx: QueryCtx,
  programIds: Id<"programs">[]
): Promise<Program[]> {
  if (!programIds || programIds.length === 0) {
    return [];
  }

  // Fetch all programs using a single query instead of individual gets
  const programs = await ctx.db
    .query("programs")
    .filter(q => q.or(...programIds.map(id => q.eq(q.field("_id"), id))))
    .collect();

  // Filter out any null values (though filter should prevent this)
  return programs.filter(program => program !== null) as Program[];
}

/**
 * Retrieves all programs associated with a specific university.
 * 
 * @param ctx - The query context
 * @param universityId - The ID of the university to find programs for
 * @returns A promise resolving to an array of programs at the specified university
 */
export async function getProgramsByUniversityId(ctx: QueryCtx, universityId: Id<'universities'>): Promise<Program[]> {
  const programs = await ctx.db.query('programs')
    .filter(q => q.eq(q.field('universityId'), universityId))
    .collect();
  return programs;
}
