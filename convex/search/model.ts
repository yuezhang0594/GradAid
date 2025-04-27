import { QueryCtx } from "../_generated/server";
import { Doc, Id, DataModel } from "../_generated/dataModel";
import { degreeLabels, SearchFilters } from "../validators";
import { NamedTableInfo, Query } from "convex/server";

type Program = Doc<"programs">;
type University = Doc<"universities">;

/**
 * Create base queries for programs and universities
 * 
 * @param ctx - The Convex query context
 * @returns Object containing base queries for programs and universities
 */
export async function createBaseQueries(ctx: QueryCtx) {
    const programsQuery = ctx.db.query("programs")
        .withIndex("by_university")

    const universitiesQuery = ctx.db.query("universities")
        .withIndex("by_name")

    return { programsQuery, universitiesQuery };
}

/**
 * Apply text search to both program and university queries
 * 
 * @param ctx - The Convex query context
 * @param searchQuery - The user's search text input
 * @param programsQuery - Base query for programs
 * @param universitiesQuery - Base query for universities
 * @returns Updated queries filtered by search results
 */
export async function applyTextSearch(
    ctx: QueryCtx,
    searchQuery: string | undefined,
    programsQuery: Query<NamedTableInfo<DataModel, "programs">>,
    universitiesQuery: Query<NamedTableInfo<DataModel, "universities">>
) {
    if (!searchQuery || !searchQuery.trim()) {
        return { programsQuery, universitiesQuery };
    }

    // Search programs using name and department
    const searchedPrograms = await ctx.db.query("programs")
        .withSearchIndex("search_programs", (q) =>
            q.search("name", searchQuery)
        )
        .collect();

    // Search universities by name
    const searchedUniversities = await ctx.db.query("universities")
        .withSearchIndex("search_name", (q) =>
            q.search("name", searchQuery)
        )
        .collect();

    // Filter queries by search results
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

    return { programsQuery, universitiesQuery };
}

/**
 * Apply university-level filters (ranking, location)
 * 
 * @param universitiesQuery - Base query for universities
 * @param filters - Filter criteria for university properties
 * @returns Updated university query with filters applied
 */
export function applyUniversityFilters(
    universitiesQuery: Query<NamedTableInfo<DataModel, "universities">>,
    filters: SearchFilters
) {
    let query = universitiesQuery;

    // Apply ranking filter
    if (filters.ranking && filters.ranking !== "all") {
        const [operator, value] = filters.ranking.split("_");
        const rankingValue = parseInt(value, 10);

        if (operator === "top" && !isNaN(rankingValue)) {
            query = query.filter((q) =>
                q.lte(q.field("ranking"), rankingValue)
            );
        }
    }

    // Apply location filter
    if (filters.location && filters.location.state !== "all") {
        const { city: filterCity, state: filterState } = filters.location;
        if (filterCity && filterCity !== "all") {
            query = query.filter((q) =>
                q.and(
                    q.eq(q.field("location.city"), filterCity),
                    q.eq(q.field("location.state"), filterState)
                )
            );
        } else {
            query = query.filter((q) =>
                q.eq(q.field("location.state"), filterState)
            );
        }
    }

    return query;
}

/**
 * Apply program-level filters based on university results
 * 
 * @param programsQuery - Base query for programs
 * @param universities - Array of universities to filter programs by
 * @param filters - Filter criteria for program properties
 * @returns Updated program query with filters applied
 */
export function applyProgramFilters(
    programsQuery: Query<NamedTableInfo<DataModel, "programs">>,
    universities: University[],
    filters: SearchFilters
) {
    if (universities.length === 0) {
        return programsQuery;
    }

    // Filter programs by matching universities
    let query = programsQuery.filter((q) =>
        q.or(
            ...universities.map((university) =>
                q.eq(q.field("universityId"), university._id))
        )
    );

    // Program type filter
    if (filters.programType && filters.programType !== "all") {
        query = query.filter((q) =>
            q.eq(q.field("degree"), filters.programType)
        );
    }

    // GRE requirement filter (user selects "GRE not required")
    if (filters.gre === true) {
        query = query.filter((q) =>
            q.eq(q.field("requirements.gre"), false)
        );
    }

    // TOEFL requirement filter (user selects "TOEFL not required")
    if (filters.toefl === true) {
        query = query.filter((q) =>
            q.eq(q.field("requirements.toefl"), false)
        );
    }

    // Minimum GPA filter
    if (filters.minimumGPA !== undefined) {
        const minimumGPA = filters.minimumGPA;
        query = query.filter((q) =>
            q.or(
                q.eq(q.field("requirements.minimumGPA"), undefined),
                q.gte(q.field("requirements.minimumGPA"), minimumGPA)
            )
        );
    }

    return query;
}

/**
 * Get the final search results
 * 
 * @param ctx - The Convex query context
 * @param programsQuery - Filtered query for programs
 * @returns Array of program IDs matching the search criteria
 */
export async function getSearchResults(
    ctx: QueryCtx,
    programsQuery: Query<NamedTableInfo<DataModel, "programs">>
): Promise<Array<Id<"programs">>> {
    const programs = await programsQuery.collect();
    return programs.map(program => program._id);
}

/**
 * Extract unique university IDs from a list of programs
 * 
 * @param programs - Array of program documents
 * @returns Array of unique university IDs associated with the programs
 */
export async function extractUniqueUniversityIds(
    programs: Doc<"programs">[]
): Promise<Id<"universities">[]> {
    if (!programs || programs.length === 0) {
        return [];
    }

    const uniqueUniversityIds = new Set<Id<"universities">>();

    for (const program of programs) {
        if (program.universityId) {
            uniqueUniversityIds.add(program.universityId);
        }
    }

    return Array.from(uniqueUniversityIds);
}

/**
 * Get unique city and state combinations from universities
 * 
 * @param ctx - The Convex query context
 * @param universities - Array of university documents
 * @returns Array of objects containing unique city and state combinations
 */
export async function getUniqueLocations(
    ctx: QueryCtx,
    universities: Doc<"universities">[]
): Promise<{ city: string; state: string }[]> {
    const uniqueLocations = new Set<string>();

    for (const university of universities) {
        if (university.location) {
            const { city, state } = university.location;
            uniqueLocations.add(`${city},${state}`);
        }
    }

    return Array.from(uniqueLocations).map(location => {
        const [city, state] = location.split(",");
        return { city, state };
    });
}

/**
 * Get unique degree types with formatted labels, sorted by frequency
 * 
 * @param ctx - The Convex query context
 * @returns Array of objects containing degree type values and their readable labels,
 *          sorted by frequency (highest first)
 */
export async function getUniqueDegreeTypes(
    ctx: QueryCtx
): Promise<Array<{ value: string; label: string }>> {
    const programs = await ctx.db.query("programs").collect();
  
    // Count the frequency of each degree type
    const degreeCounts = new Map<string, number>();
    programs.forEach(program => {
      if (program.degree) {
        degreeCounts.set(program.degree, (degreeCounts.get(program.degree) || 0) + 1);
      }
    });

    // Convert map to array of objects with value and count
    const degreeFrequency = Array.from(degreeCounts.entries())
      .map(([degreeType, count]) => ({
        value: degreeType,
        count: count
      }));

    // Sort by frequency in descending order
    degreeFrequency.sort((a, b) => b.count - a.count);

    // Map to the final format with labels
    return degreeFrequency.map(item => ({
      value: item.value,
      label: degreeLabels[item.value] || item.value
    }));
}
