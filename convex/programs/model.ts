import { Doc, Id } from "../_generated/dataModel";
import { QueryCtx } from "../_generated/server";

type Program = Doc<"programs">;

export async function getProgramsByIds(
  ctx: QueryCtx,
  programIds: Id<"programs">[]
): Promise<Program[]> {
  if (!programIds || programIds.length === 0) {
    return [];
  }

  // Query all programs with the given IDs
  const programs = await Promise.all(
    programIds.map(id => ctx.db.get(id))
  );

  // Filter out any null values
  return programs.filter(program => program !== null) as Program[];
}

export async function getProgramsByUniversityId(ctx: QueryCtx, universityId: Id<'universities'>): Promise<Program[]> {
  const programs = await ctx.db.query('programs')
    .filter(q => q.eq(q.field('universityId'), universityId))
    .collect();
  return programs;
}
