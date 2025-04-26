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
 * Get universities associated with specific programs, with pagination
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
 */
export const getUniqueDegreeTypes = query({
  args: {},
  returns: v.array(v.object({ value: v.string(), label: v.string() })),
  handler: async (ctx) => {
    return await Search.getUniqueDegreeTypes(ctx);
  },
});
