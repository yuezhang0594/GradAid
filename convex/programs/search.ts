import { query, QueryCtx } from "../_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "../_generated/dataModel";
import { paginationOptsValidator, PaginationResult } from "convex/server";

type Program = Doc<"programs">;
type University = Doc<"universities">;

/**
 * Search for programs based on query and filters
 */
export const searchPrograms = query({
  args: {
    query: v.optional(v.string()),
    filters: v.optional(
      v.object({
        programType: v.optional(v.union(v.literal("all"), v.string())),
        location: v.optional(v.union(v.literal("all"), v.string())),
        ranking: v.optional(v.union(v.literal("all"), v.string())),
        gre: v.optional(v.boolean()),
        toefl: v.optional(v.boolean()),
        minimumGPA: v.optional(v.number()),
      })
    ),
  },
  returns: v.array(v.id("programs")),
  handler: async (ctx, args) => {
    const { query: searchQuery, filters = {} } = args;

    // Step 1: Create the base queries with proper initialization
    let programsQuery = ctx.db.query("programs")
      .withIndex("by_university")
      .filter(q => q.gt(q.field("_id"), null)); // Ensure we have an ordered query

    let universitiesQuery = ctx.db.query("universities")
      .withIndex("by_name")
      .filter(q => q.gt(q.field("_id"), null)); // Ensure we have an ordered query

    // Step 2: Apply text search if provided
    if (searchQuery && searchQuery.trim()) {
      // Search programs first using name and department
      const searchedPrograms = await ctx.db.query("programs")
        .withSearchIndex("search_programs", (q) =>
          q.search("name", searchQuery)
        )
        .collect();

      // Then search universities
      const searchedUniversities = await ctx.db.query("universities")
        .withSearchIndex("search_name", (q) =>
          q.search("name", searchQuery)
        )
        .collect();

      // Filter base queries by search results
      if (searchedPrograms.length > 0) {
        programsQuery = programsQuery.filter(q =>
          q.or(...searchedPrograms.map(p => q.eq(q.field("_id"), p._id)))
        );
      }

      if (searchedUniversities.length > 0) {
        universitiesQuery = universitiesQuery.filter(q =>
          q.or(...searchedUniversities.map(u => q.eq(q.field("_id"), u._id)))
        );
      }
    }

    // Step 3: Apply university-level filters
    // Apply ranking filter
    if (filters.ranking && filters.ranking !== "all") {
      const [operator, value] = filters.ranking.split("_");
      const rankingValue = parseInt(value, 10);

      if (operator === "top" && !isNaN(rankingValue)) {
        universitiesQuery = universitiesQuery.filter((q) =>
          q.lte(q.field("ranking"), rankingValue)
        );
      }
    }

    // Apply location filter
    if (filters.location && filters.location !== "all") {
      const [filterCity, filterState] = filters.location.split(", ");

      universitiesQuery = universitiesQuery.filter((q) =>
        q.and(
          q.eq(q.field("location.city"), filterCity),
          q.eq(q.field("location.state"), filterState)
        )
      );
    }


    // Step 4: Apply program-level filters
    // Get matching universities
    const universities = await universitiesQuery.collect();
    if (universities.length === 0) {
      console.log("No universities found");
      return [];
    }
    // Filter programs by matching universities
    programsQuery = programsQuery.filter((q) =>
      q.or(
        ...universities.map((university) =>
          q.eq(q.field("universityId"), university._id))
      )
    );

    // Program type filter
    if (filters.programType && filters.programType !== "all") {
      programsQuery = programsQuery.filter((q) =>
        q.eq(q.field("degree"), filters.programType)
      );
    }

    // GRE requirement filter (user selects "GRE not required")
    if (filters.gre === true) {
      programsQuery = programsQuery.filter((q) =>
        q.eq(q.field("requirements.gre"), false)
      );
    }

    // TOEFL requirement filter (user selects "TOEFL not required")
    if (filters.toefl === true) {
      programsQuery = programsQuery.filter((q) =>
        q.eq(q.field("requirements.toefl"), false)
      );
    }

    // Minimum GPA filter
    if (filters.minimumGPA !== undefined) {
      programsQuery = programsQuery.filter((q) =>
        q.or(
          q.eq(q.field("requirements.minimumGPA"), null),
          q.gte(q.field("requirements.minimumGPA"), filters.minimumGPA!)
        )
      );
    }

    // Step 5: Return results
    const programs = await programsQuery.collect();
    if (programs.length === 0) {
      console.log("No programs found");
      return [];
    }
    return Promise.all(programs.map((program) => program._id));
  },
});

/**
 * Get universities associated with specific programs, with pagination
 */
export const getUniversitiesForPrograms = query({
  args: {
    programIds: v.array(v.id("programs")) || undefined,
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const { programIds, paginationOpts } = args;
    if (!programIds || programIds.length === 0) {
      // Return null if no program IDs provided
      return null;
    }

    // Step 1: Get all the programs
    const programs = await Promise.all(
      programIds.map(programId => ctx.db.get(programId))
    );

    // Filter out any null values (in case some IDs were invalid)
    const validPrograms = programs.filter((p): p is Program => p !== null);

    // Step 2: Extract unique university IDs
    const uniqueUniversityIds = new Set<Id<"universities">>();
    validPrograms.forEach(program => {
      if (program.universityId) {
        uniqueUniversityIds.add(program.universityId);
      }
    });

    if (uniqueUniversityIds.size === 0) {
      // Return empty result if no universities found
      return null;
    }

    // Step 3: Query universities with pagination
    const universitiesQuery = ctx.db
      .query("universities")
      .filter(q =>
        q.or(...Array.from(uniqueUniversityIds).map(id =>
          q.eq(q.field("_id"), id)
        ))
      );

    // Apply pagination and return results
    return await universitiesQuery.paginate(paginationOpts);
  },
});

/**
 * Get a list of unique city and state combinations where US universities are located
 */
export const getUniqueLocations = query({
  args: {},
  returns: v.array(v.string()),
  handler: async (ctx) => {
    const universities = await ctx.db.query("universities").collect();

    // Extract all unique city-state combinations
    const locations = new Set<string>();
    universities.forEach(university => {
      if (university.location?.city && university.location?.state) {
        locations.add(`${university.location.city}, ${university.location.state}`);
      }
    });

    return Array.from(locations).sort();
  },
});

/**
 * Get a list of unique degree types from all university programs
 */
export const getUniqueDegreeTypes = query({
  args: {},
  returns: v.array(v.object({ value: v.string(), label: v.string() })),
  handler: async (ctx) => {
    const programs = await ctx.db.query("programs").collect();

    // Extract all unique degree types
    const degreeTypes = new Set<string>();
    programs.forEach(program => {
      if (program.degree) {
        degreeTypes.add(program.degree);
      }
    });

    // Map degree codes to readable labels
    const degreeLabels: Record<string, string> = {
      'MS': 'Master of Science (MS)',
      'MA': 'Master of Arts (MA)',
      'PhD': 'Doctor of Philosophy (PhD)',
      'MBA': 'Master of Business Admin (MBA)',
      'MFA': 'Master of Fine Arts (MFA)',
      'MEng': 'Master of Engineering (MEng)',
      'MCS': 'Master of Computer Science (MCS)',
      'MSE': 'Master of Science in Engineering (MSE)',
      'MFin': 'Master in Finance (MFin)',
      // Add other degree types as needed
    };

    // Convert to array of objects with value and label
    return Array.from(degreeTypes).map(degreeType => ({
      value: degreeType,
      label: degreeLabels[degreeType] || degreeType
    })).sort((a, b) => a.label.localeCompare(b.label));
  },
});


export async function getProgramsByUniversityId(ctx: QueryCtx, universityId: Id<'universities'>): Promise<Program[]> {
  const programs = await ctx.db.query('programs')
    .filter(q => q.eq(q.field('universityId'), universityId))
    .collect();
  return programs;
}

export async function getUniversityIdByProgramID(ctx: QueryCtx, programId: Id<'programs'>): Promise<Id<'universities'> | null> {
  const program = await ctx.db.get(programId);
  return program?.universityId || null;

}

export async function getUniversityById(ctx: QueryCtx, universityId: Id<'universities'>): Promise<University | null> {
  return await ctx.db.get(universityId);
}

/**
 * Get program objects from an array of program IDs
 */
export const getProgramsByIds = query({
  args: {
    programIds: v.array(v.id("programs")),
  },
  handler: async (ctx, args) => {
    const { programIds } = args;

    if (!programIds || programIds.length === 0) {
      return [];
    }

    // Query all programs with the given IDs
    const programs = await Promise.all(
      programIds.map(id => ctx.db.get(id))
    );

    // Filter out any null values
    return programs.filter(program => program !== null);
  },
});

/**
 * Get a university by its ID
 */
export const getUniversity = query({
  args: {
    universityId: v.id("universities"),
  },
  handler: async (ctx, { universityId }) => {
    const university = await ctx.db.get(universityId);
    if (!university) {
      throw new Error(`University with ID ${universityId} not found`);
    }
    return university;
  },
});

// Helper function to get universities by IDs
export async function getUniversitiesHelper(
  ctx: QueryCtx, 
  universityIds: Id<"universities">[]
): Promise<Array<Doc<"universities">>> {
  if (universityIds.length === 0) {
    return [];
  }
  
  return await ctx.db
    .query("universities")
    .filter(q => 
      q.or(...universityIds.map(id => q.eq(q.field("_id"), id)))
    )
    .collect();
}

export const getUniversities = query({
  args: { universityIds: v.array(v.id("universities")) },
  handler: async (ctx, args) => {
    const { universityIds } = args;
    return await getUniversitiesHelper(ctx, universityIds);
  },
});