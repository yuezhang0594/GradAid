import { Id, Doc } from "../_generated/dataModel";
import { QueryCtx } from "../_generated/server";
import { University } from "../search/queries";

/**
 * Retrieves multiple university documents by their IDs
 * 
 * @param ctx - The database query context
 * @param universityIds - Array of university IDs to retrieve
 * @returns Promise resolving to an array of university documents that match the provided IDs
 * @remarks If an empty array of IDs is provided, an empty array is returned
 */
export async function getUniversitiesByIds(
  ctx: QueryCtx,
  universityIds: Id<"universities">[]
): Promise<Array<Doc<"universities">>> {
  if (universityIds.length === 0) {
    return [];
  }

  return await ctx.db
    .query("universities")
    .filter(q => q.or(...universityIds.map(id => q.eq(q.field("_id"), id)))
    )
    .collect();
}

/**
 * Retrieves a university by its unique identifier.
 * 
 * @param ctx - The query context for database operations
 * @param universityId - The unique identifier of the university to retrieve
 * @returns A Promise that resolves to the University object if found, or null if not found
 */
export async function getUniversityById(ctx: QueryCtx, universityId: Id<'universities'>): Promise<University | null> {
  return await ctx.db.get(universityId);
}
/**
 * Retrieves the university ID associated with a specific program.
 * 
 * @param ctx - The query context used for database operations
 * @param programId - The ID of the program to look up
 * @returns A Promise that resolves to the university ID associated with the program, or null if the program doesn't exist or has no university association
 */
export async function getUniversityIdByProgramID(ctx: QueryCtx, programId: Id<'programs'>): Promise<Id<'universities'> | null> {
  const program = await ctx.db.get(programId);
  return program?.universityId || null;

}

