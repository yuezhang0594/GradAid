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
    } else {
      // Default query with no special index - we'll apply location filter after fetching
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
    
    // Step 4: Apply client-side filtering for location and programs
    let filteredUniversities = paginationResult.page;
    
    // Apply location filter if specified (city, state format)
    if (filters.location && filters.location !== "all") {
      // Split the "city, state" format into components
      const [filterCity, filterState] = filters.location.split(", ");
      
      filteredUniversities = filteredUniversities.filter(university => 
        university.location?.city === filterCity && 
        university.location?.state === filterState
      );
    }
    
    // Apply program filters
    filteredUniversities = filteredUniversities
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
      program.requirements.minimumGPA < filters.minimumGPA) {
    return false;
  }
  
  // Program matches all filters
  return true;
}

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
    const universities = await ctx.db.query("universities").collect();
    
    // Extract all unique degree types
    const degreeTypes = new Set<string>();
    universities.forEach(university => {
      university.programs.forEach(program => {
        if (program.degree) {
          degreeTypes.add(program.degree);
        }
      });
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
