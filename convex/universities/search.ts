import { query } from "../_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";

/**
 * Search for universities and programs based on query and filters
 */
export const searchUniversities = query({
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
    paginationOpts: v.optional(paginationOptsValidator),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const { query: searchQuery, filters = {}, paginationOpts = { numItems: 10, cursor: null } } = args;
    
    // Step 1: Start with the appropriate base query using the most selective index
    let universitiesQuery;
    
    // Choose the most efficient index based on provided filters
    if (searchQuery && searchQuery.trim()) {
      // If we have a search query, use the search index
      universitiesQuery = ctx.db.query("universities").withSearchIndex("search_name", (q) => 
        q.search("name", searchQuery)
      );
    } else if (filters.location && filters.location !== "all") {
      // If we have a location filter without search, use the location index
      universitiesQuery = ctx.db.query("universities").withIndex("by_country", (q) => 
        q.eq("location.country", filters.location as string)
      );
    } else {
      // Default query with no special index
      universitiesQuery = ctx.db.query("universities");
    }
    
    // Step 2: Apply database-level filters that can use indexes
    // Apply ranking filter if specified
    if (filters.ranking && filters.ranking !== "all") {
      const [operator, value] = filters.ranking.split("_");
      const rankingValue = parseInt(value, 10);
      
      if (operator === "top" && !isNaN(rankingValue)) {
        universitiesQuery = universitiesQuery.filter((q) => 
          q.lte(q.field("ranking"), rankingValue)
        );
      }
    }
    
    // Step 3: Fetch paginated results
    const paginationResult = await universitiesQuery.paginate(paginationOpts);
    
    // Step 4: Apply program-specific filters
    const filteredUniversities = paginationResult.page
      .map(university => {
        // Apply program filters if needed
        if (!hasProgramFilters(filters)) {
          return university; // No program filtering needed
        }
        
        // Filter programs based on criteria
        const filteredPrograms = university.programs.filter(program => 
          isProgramMatchingFilters(program, filters)
        );
        
        // Return university with filtered programs
        return {
          ...university,
          programs: filteredPrograms
        };
      })
      // Filter out universities with no matching programs
      .filter(university => university.programs && university.programs.length > 0);
    
    // Return paginated results
    return {
      results: filteredUniversities,
      continueCursor: paginationResult.continueCursor,
      isDone: !paginationResult.continueCursor
    };
  },
});

/**
 * Helper function to check if any program-specific filters are being applied
 */
function hasProgramFilters(filters: any): boolean {
  return (
    (filters.programType && filters.programType !== "all") ||
    filters.gre !== undefined ||
    filters.toefl !== undefined ||
    filters.minimumGPA !== undefined
  );
}

/**
 * Helper function to determine if a program matches all the specified filters
 */
function isProgramMatchingFilters(program: any, filters: any): boolean {
  // Program type filter
  if (filters.programType && filters.programType !== "all" && 
      program.degree !== filters.programType) {
    return false;
  }
  
  // GRE requirement filter
  if (filters.gre !== undefined && 
      program.requirements.greRequired !== filters.gre) {
    return false;
  }
  
  // TOEFL requirement filter
  if (filters.toefl !== undefined && 
      program.requirements.toefl !== filters.toefl) {
    return false;
  }
  
  // Minimum GPA filter
  if (filters.minimumGPA !== undefined && 
      program.requirements.minimumGPA > filters.minimumGPA) {
    return false;
  }
  
  // Program matches all filters
  return true;
}

/**
 * Get a list of unique countries where universities are located
 */
export const getUniqueLocations = query({
    args: {},
    returns: v.array(v.string()),
    handler: async (ctx) => {
      const universities = await ctx.db.query("universities").collect();
      
      // Extract all unique countries
      const locations = new Set<string>();
      universities.forEach(university => {
        if (university.location?.country) {
          locations.add(university.location.country);
        }
      });
      
      return Array.from(locations).sort();
    },
  });
  