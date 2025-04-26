import { Id, Doc } from "../_generated/dataModel";
import { QueryCtx } from "../_generated/server";
import { University } from "../search/queries";


// Helper function to get universities by IDs


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

export async function getUniversityById(ctx: QueryCtx, universityId: Id<'universities'>): Promise<University | null> {
  return await ctx.db.get(universityId);
}
export async function getUniversityIdByProgramID(ctx: QueryCtx, programId: Id<'programs'>): Promise<Id<'universities'> | null> {
  const program = await ctx.db.get(programId);
  return program?.universityId || null;

}

