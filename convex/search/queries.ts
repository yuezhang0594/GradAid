import { query } from "../_generated/server";
import { v } from "convex/values";
import { Doc } from "../_generated/dataModel";
import * as Search from "./model";
import * as ProgramModel from "../programs/model";
import * as UniversityModel from "../universities/model";
import { searchFilterValidator } from "../validators";

export type Program = Doc<"programs">;
export type University = Doc<"universities">;

/**
 * Search for programs based on query and filters
 * 
 * @param ctx - The Convex query context
 * @param args - Search parameters
 * @param args.search - Optional search query string for text search
 * @param args.filters - Optional filters to narrow down search results
 * @returns An array of program IDs matching the search criteria
 */
export const searchPrograms = query({
  args: {
    search: v.optional(v.string()),
    filters: v.optional(searchFilterValidator),
  },
  returns: v.array(v.id("programs")),
  handler: async (ctx, args) => {
    const { search: searchQuery, filters = {} } = args;

    const { programsQuery, universitiesQuery } = await Search.createBaseQueries(ctx);

    const searchResult = await Search.applyTextSearch(
      ctx,
      searchQuery,
      programsQuery,
      universitiesQuery
    );

    const filteredUniversitiesQuery = Search.applyUniversityFilters(
      searchResult.universitiesQuery,
      filters
    );

    const universities = await filteredUniversitiesQuery.collect();
    if (universities.length === 0) {
      return [];
    }

    const filteredProgramsQuery = Search.applyProgramFilters(
      searchResult.programsQuery,
      universities,
      filters
    );

    return await Search.getSearchResults(ctx, filteredProgramsQuery);
  },
});

/**
 * Get universities associated with specific programs
 * 
 * @param ctx - The Convex query context
 * @param args - Query parameters
 * @param args.programIds - Array of program IDs to find universities for
 * @returns Universities data for the provided programs or null if no programs found
 */
export const getUniversitiesForPrograms = query({
  args: {
    programIds: v.array(v.id("programs")) || undefined,
  },
  handler: async (ctx, args) => {
    const { programIds } = args;
    if (!programIds || programIds.length === 0) {
      // Return null if no program IDs provided
      return null;
    }
    // Null values filtered out in the model
    const programs = await ProgramModel.getProgramsByIds(ctx, programIds);
    const uniqueUniversityIds = await Search.extractUniqueUniversityIds(programs);

    if (uniqueUniversityIds.length === 0) {
      // Return empty result if no universities found
      return null;
    }

    return await UniversityModel.getUniversitiesByIds(ctx, Array.from(uniqueUniversityIds));
  },
});

/**
 * Get a list of unique city and state combinations where US universities are located
 * 
 * @param ctx - The Convex query context
 * @returns Array of objects containing unique city and state combinations
 */
export const getUniqueLocations = query({
  args: {},
  returns: v.array(v.object({ city: v.string(), state: v.string() })),
  handler: async (ctx) => {
    const universities = await ctx.db.query("universities").collect();
    return Search.getUniqueLocations(ctx, universities);
  },
});

/**
 * Get a list of unique degree types from all university programs
 * 
 * @param ctx - The Convex query context
 * @returns Array of objects containing degree type values and their readable labels
 */
export const getUniqueDegreeTypes = query({
  args: {},
  returns: v.array(v.object({ value: v.string(), label: v.string() })),
  handler: async (ctx) => {
    return await Search.getUniqueDegreeTypes(ctx);
  },
});
