import { convexTest } from "convex-test";
import {
  describe,
  test,
  expect,
  beforeEach,
  afterEach,
  vi,
  beforeAll,
  afterAll,
} from "vitest";
import schema from "../schema";
import { api } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import * as SearchModel from "./model";

describe("Search", () => {
  const t = convexTest(schema);
  
  // Test data
  let caliUniIds: Id<"universities">[] = [];
  let nyUniIds: Id<"universities">[] = [];
  let csProgIds: Id<"programs">[] = [];
  let engProgIds: Id<"programs">[] = [];
  let mbaProgramId: Id<"programs">; 

  beforeAll(async () => {
    // Create test universities and programs
    [caliUniIds, nyUniIds, csProgIds, engProgIds, mbaProgramId] = await t.run(async (ctx) => {
      // Create California universities
      const stanford = await ctx.db.insert("universities", {
        name: "Stanford University",
        location: { city: "Stanford", state: "California", country: "USA" },
        ranking: 3,
        website: "https://stanford.edu",
        imageUrl: "https://example.com/stanford.jpg",
      });
      
      const berkeley = await ctx.db.insert("universities", {
        name: "University of California, Berkeley",
        location: { city: "Berkeley", state: "California", country: "USA" },
        ranking: 5,
        website: "https://berkeley.edu",
        imageUrl: "https://example.com/berkeley.jpg",
      });
      
      // Create New York universities
      const cornell = await ctx.db.insert("universities", {
        name: "Cornell University",
        location: { city: "Ithaca", state: "New York", country: "USA" },
        ranking: 12,
        website: "https://cornell.edu",
        imageUrl: "https://example.com/cornell.jpg",
      });
      
      const columbia = await ctx.db.insert("universities", {
        name: "Columbia University",
        location: { city: "New York", state: "New York", country: "USA" },
        ranking: 8,
        website: "https://columbia.edu",
        imageUrl: "https://example.com/columbia.jpg",
      });
      
      // Create CS programs
      const stanfordCS = await ctx.db.insert("programs", {
        universityId: stanford,
        name: "Computer Science",
        degree: "M.S.",
        department: "Computer Science",
        requirements: {
          minimumGPA: 3.5,
          gre: true,
          toefl: true,
          recommendationLetters: 3,
        },
        deadlines: {
          fall: "2023-12-01",
          spring: "2024-04-01",
        },
        website: "https://cs.stanford.edu/mscs",
      });
      
      const berkeleyCS = await ctx.db.insert("programs", {
        universityId: berkeley,
        name: "Computer Science",
        degree: "M.S.",
        department: "Electrical Engineering and Computer Science",
        requirements: {
          minimumGPA: 3.3,
          gre: false,
          toefl: true,
          recommendationLetters: 3,
        },
        deadlines: {
          fall: "2023-12-15",
          spring: "2024-05-01",
        },
        website: "https://eecs.berkeley.edu/cs",
      });
      
      const cornellCS = await ctx.db.insert("programs", {
        universityId: cornell,
        name: "Computer Science",
        degree: "Ph.D.",
        department: "Computer Science",
        requirements: {
          minimumGPA: 3.7,
          gre: true,
          toefl: true,
          recommendationLetters: 3,
        },
        deadlines: {
          fall: "2023-12-01",
        },
        website: "https://cs.cornell.edu/phd",
      });
      
      // Create Engineering programs
      const stanfordEng = await ctx.db.insert("programs", {
        universityId: stanford,
        name: "Electrical Engineering",
        degree: "M.Eng.",
        department: "Electrical Engineering",
        requirements: {
          minimumGPA: 3.4,
          gre: true,
          toefl: true,
          recommendationLetters: 3,
        },
        deadlines: {
          fall: "2023-12-01",
          spring: "2024-04-01",
        },
        website: "https://ee.stanford.edu/meng",
      });
      
      const berkeleyEng = await ctx.db.insert("programs", {
        universityId: berkeley,
        name: "Mechanical Engineering",
        degree: "M.Eng.",
        department: "Mechanical Engineering",
        requirements: {
          minimumGPA: 3.2,
          gre: false,
          toefl: true,
          recommendationLetters: 2,
        },
        deadlines: {
          fall: "2023-12-15",
        },
        website: "https://me.berkeley.edu",
      });
      
      // Create different type of program (MBA)
      const columbiaMBA = await ctx.db.insert("programs", {
        universityId: columbia,
        name: "Business Administration",
        degree: "M.B.A.",
        department: "Business School",
        requirements: {
          minimumGPA: 3.6,
          gre: false,
          toefl: true,
          recommendationLetters: 2,
        },
        deadlines: {
          fall: "2023-12-05",
          spring: "2024-03-15",
        },
        website: "https://business.columbia.edu/mba",
      });
      
      return [
        [stanford, berkeley], // California universities
        [cornell, columbia],  // New York universities
        [stanfordCS, berkeleyCS, cornellCS], // CS programs
        [stanfordEng, berkeleyEng], // Engineering programs
        columbiaMBA, // MBA program
      ];
    });
  });

  afterAll(async () => {
    // Clean up test data
    await t.run(async (ctx) => {
      // Delete all programs
      const programs = await ctx.db.query("programs").collect();
      for (const program of programs) {
        await ctx.db.delete(program._id);
      }

      // Delete all universities
      const universities = await ctx.db.query("universities").collect();
      for (const university of universities) {
        await ctx.db.delete(university._id);
      }
    });
  });

  describe("Queries", () => {
    describe("searchPrograms", () => {
      test("should return all programs when no search query or filters provided", async () => {
        const programs = await t.query(api.search.queries.searchPrograms, {});
        
        expect(programs).toHaveLength(6);
      });

      test("should filter programs by text search", async () => {
        const programs = await t.query(api.search.queries.searchPrograms, {
          search: "Computer",
        });
        
        expect(programs).toHaveLength(3);
      });

      test("should filter programs by location", async () => {
        const programs = await t.query(api.search.queries.searchPrograms, {
          filters: {
            location: { city: "Berkeley", state: "California" },
          },
        });
        
        // Should return Berkeley's programs
        expect(programs).toHaveLength(2);
      });

      test("should filter programs by program type", async () => {
        const programs = await t.query(api.search.queries.searchPrograms, {
          filters: {
            programType: "M.B.A.",
          },
        });
        
        // Should only return MBA program
        expect(programs).toHaveLength(1);
      });

      test("should filter programs by ranking", async () => {
        const programs = await t.query(api.search.queries.searchPrograms, {
          filters: {
            ranking: "top_5",
          },
        });
        
        // Should only return Stanford's programs (rank 3) and Berkeley's programs (rank 5)
        expect(programs).toHaveLength(4);
      });

      test("should filter programs by GRE requirement", async () => {
        const programs = await t.query(api.search.queries.searchPrograms, {
          filters: {
            gre: true, // GRE not required (true = filter to only programs where GRE is not required)
          },
        });
        
        // Should return Berkeley CS (gre: false), Berkeley ME (gre: false), and Columbia MBA (gre: false)
        expect(programs).toHaveLength(3);
      });

      test("should filter programs by minimum GPA", async () => {
        const programs = await t.query(api.search.queries.searchPrograms, {
          filters: {
            minimumGPA: 3.5,
          },
        });
        
        // Should return programs with minimumGPA >= 3.5
        expect(programs).toHaveLength(3); // Stanford CS, Cornell CS, Columbia MBA
      });

      test("should combine multiple filters", async () => {
        const programs = await t.query(api.search.queries.searchPrograms, {
          search: "Computer",
          filters: {
            programType: "M.S.",
            gre: false,
          },
        });
        
        // Should return Berkeley CS (Computer Science, M.S., gre: false) and Cornell CS (Computer Science, Ph.D., gre: false)
        expect(programs).toHaveLength(2);
      });

      test("should return all programs when no matches found", async () => {
        const programs = await t.query(api.search.queries.searchPrograms, {
          search: "NonexistentProgram",
        });
        
        expect(programs).toHaveLength(6);
      });
    });

    describe("getUniversitiesForPrograms", () => {
      test("should return universities for given program IDs", async () => {
        const universities = await t.query(api.search.queries.getUniversitiesForPrograms, {
          programIds: csProgIds,
        });
        
        // Should return Stanford, Berkeley, and Cornell
        expect(universities).toHaveLength(3);
        
        const universityNames = universities?.map(uni => uni.name);
        expect(universityNames).toContain("Stanford University");
        expect(universityNames).toContain("University of California, Berkeley");
        expect(universityNames).toContain("Cornell University");
      });

      test("should deduplicate universities when multiple programs belong to same university", async () => {
        // Create array with both Stanford programs
        const stanfordPrograms = [csProgIds[0], engProgIds[0]];
        
        const universities = await t.query(api.search.queries.getUniversitiesForPrograms, {
          programIds: stanfordPrograms,
        });
        
        // Should only return Stanford once
        expect(universities).toHaveLength(1);
        expect(universities?.[0]).toMatchObject({ name: "Stanford University" });
      });

      test("should return null when no program IDs provided", async () => {
        const universities = await t.query(api.search.queries.getUniversitiesForPrograms, {
          programIds: [],
        });
        
        expect(universities).toBeNull();
      });
    });

    describe("getUniqueLocations", () => {
      test("should return all unique city and state combinations", async () => {
        const locations = await t.query(api.search.queries.getUniqueLocations, {});
        
        expect(locations).toHaveLength(4); // Stanford, Berkeley, Ithaca, New York
        
        // Check for specific locations
        expect(locations).toContainEqual({ city: "Stanford", state: "California" });
        expect(locations).toContainEqual({ city: "Berkeley", state: "California" });
        expect(locations).toContainEqual({ city: "Ithaca", state: "New York" });
        expect(locations).toContainEqual({ city: "New York", state: "New York" });
      });
    });

    describe("getUniqueDegreeTypes", () => {
      test("should return all unique degree types with labels", async () => {
        const degreeTypes = await t.query(api.search.queries.getUniqueDegreeTypes, {});
        
        expect(degreeTypes).toHaveLength(4); // M.S., Ph.D., M.Eng., M.B.A.
        
        // Check that each entry has value and label
        for (const degree of degreeTypes) {
          expect(degree).toHaveProperty("value");
          expect(degree).toHaveProperty("label");
        }
        
        // Check that specific degrees are included
        const degreeValues = degreeTypes.map(d => d.value);
        expect(degreeValues).toContain("M.S.");
        expect(degreeValues).toContain("Ph.D.");
        expect(degreeValues).toContain("M.Eng.");
        expect(degreeValues).toContain("M.B.A.");
      });

      test("should order degree types by frequency", async () => {
        const degreeTypes = await t.query(api.search.queries.getUniqueDegreeTypes, {});
        
        // M.S. should be first since it has the most programs (2)
        expect(degreeTypes[0].value).toBe("M.S.");
      });
    });
  });

  describe("Model", () => {
    describe("applyTextSearch", () => {
      test("should not filter results when search is empty", async () => {
        const result = await t.run(async (ctx) => {
          const { programsQuery, universitiesQuery } = await SearchModel.createBaseQueries(ctx);
          const searchResult = await SearchModel.applyTextSearch(ctx, "", programsQuery, universitiesQuery);
          
          // Execute the queries and return the counts
          const programs = await searchResult.programsQuery.collect();
          const universities = await searchResult.universitiesQuery.collect();
          
          return { 
            programCount: programs.length,
            universityCount: universities.length
          };
        });
        
        // The empty search should return all programs and universities
        expect(result.programCount).toBe(6);
        expect(result.universityCount).toBe(4);
      });

      test("should filter results based on search text", async () => {
        const result = await t.run(async (ctx) => {
          const { programsQuery, universitiesQuery } = await SearchModel.createBaseQueries(ctx);
          const searchResult = await SearchModel.applyTextSearch(ctx, "Computer", programsQuery, universitiesQuery);
          
          // Execute the queries and collect the results
          const programs = await searchResult.programsQuery.collect();
          const matchingPrograms = programs.filter(p => p.name.includes("Computer"));
          
          return { 
            programCount: programs.length,
            matchingProgramCount: matchingPrograms.length,
            programNames: programs.map(p => p.name)
          };
        });
        
        // Should filter down to only Computer Science programs
        expect(result.programCount).toBe(3);
        expect(result.matchingProgramCount).toBe(3);
        expect(result.programNames).toContain("Computer Science");
      });
    });

    describe("applyUniversityFilters", () => {
      test("should filter universities by ranking", async () => {
        const result = await t.run(async (ctx) => {
          const { universitiesQuery } = await SearchModel.createBaseQueries(ctx);
          const filteredQuery = SearchModel.applyUniversityFilters(
            universitiesQuery,
            { ranking: "top_5" }
          );
          return await filteredQuery.collect();
        });
        
        // Should return universities with ranking <= 5
        expect(result).toHaveLength(2); // Stanford (3) and Berkeley (5)
        expect(result.map(u => u.name)).toContain("Stanford University");
        expect(result.map(u => u.name)).toContain("University of California, Berkeley");
      });

      test("should filter universities by location state", async () => {
        const result = await t.run(async (ctx) => {
          const { universitiesQuery } = await SearchModel.createBaseQueries(ctx);
          const filteredQuery = SearchModel.applyUniversityFilters(
            universitiesQuery,
            { location: { city: "all", state: "New York" } }
          );
          return await filteredQuery.collect();
        });
        
        // Should return New York universities
        expect(result).toHaveLength(2);
        expect(result.map(u => u.name)).toContain("Cornell University");
        expect(result.map(u => u.name)).toContain("Columbia University");
      });

      test("should filter universities by city and state", async () => {
        const result = await t.run(async (ctx) => {
          const { universitiesQuery } = await SearchModel.createBaseQueries(ctx);
          const filteredQuery = SearchModel.applyUniversityFilters(
            universitiesQuery,
            { location: { city: "New York", state: "New York" } }
          );
          return await filteredQuery.collect();
        });
        
        // Should return only Columbia
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe("Columbia University");
      });
    });

    describe("applyProgramFilters", () => {
      test("should filter programs by degree type", async () => {
        const universities = await t.run(async (ctx) => {
          return await ctx.db.query("universities").collect();
        });
        
        const result = await t.run(async (ctx) => {
          const { programsQuery } = await SearchModel.createBaseQueries(ctx);
          const filteredQuery = SearchModel.applyProgramFilters(
            programsQuery,
            universities,
            { programType: "Ph.D." }
          );
          return await filteredQuery.collect();
        });
        
        // Should return only Ph.D. programs
        expect(result).toHaveLength(1);
        expect(result[0].degree).toBe("Ph.D.");
        expect(result[0].name).toBe("Computer Science");
      });

      test("should filter programs by GRE requirement", async () => {
        const universities = await t.run(async (ctx) => {
          return await ctx.db.query("universities").collect();
        });
        
        const result = await t.run(async (ctx) => {
          const { programsQuery } = await SearchModel.createBaseQueries(ctx);
          const filteredQuery = SearchModel.applyProgramFilters(
            programsQuery,
            universities,
            { gre: true } // GRE not required
          );
          return await filteredQuery.collect();
        });
        
        // Should return programs where GRE is not required
        expect(result).toHaveLength(3);
        result.forEach(program => {
          expect(program.requirements.gre).toBe(false);
        });
      });

      test("should filter programs by minimum GPA", async () => {
        const universities = await t.run(async (ctx) => {
          return await ctx.db.query("universities").collect();
        });
        
        const result = await t.run(async (ctx) => {
          const { programsQuery } = await SearchModel.createBaseQueries(ctx);
          const filteredQuery = SearchModel.applyProgramFilters(
            programsQuery,
            universities,
            { minimumGPA: 3.5 }
          );
          return await filteredQuery.collect();
        });
        
        // Should return programs with GPA >= 3.5
        expect(result.length).toBeGreaterThan(0);
        result.forEach(program => {
          if (program.requirements.minimumGPA !== undefined) {
            expect(program.requirements.minimumGPA).toBeGreaterThanOrEqual(3.5);
          }
        });
      });

      test("should return empty array when no universities provided", async () => {
        const result = await t.run(async (ctx) => {
          const { programsQuery } = await SearchModel.createBaseQueries(ctx);
          const filteredQuery = SearchModel.applyProgramFilters(
            programsQuery,
            [],
            {}
          );
          return await filteredQuery.collect();
        });
        
        expect(result).toEqual([]);
      });
    });

    describe("getSearchResults", () => {
      test("should return program IDs from filtered query", async () => {
        const result = await t.run(async (ctx) => {
          const { programsQuery } = await SearchModel.createBaseQueries(ctx);
          const filtered = programsQuery.filter(q => 
            q.eq(q.field("degree"), "M.S.")
          );
          return await SearchModel.getSearchResults(ctx, filtered);
        });
        
        // Should return IDs of M.S. programs
        expect(result).toHaveLength(2);
        expect(result).toContain(csProgIds[0]);
        expect(result).toContain(csProgIds[1]);
      });
    });

    describe("extractUniqueUniversityIds", () => {
      test("should extract unique university IDs from programs", async () => {
        // Get all programs
        const programs = await t.run(async (ctx) => {
          return await ctx.db.query("programs").collect();
        });
        
        const result = await SearchModel.extractUniqueUniversityIds(programs);
        
        // Should return 4 unique university IDs
        expect(result).toHaveLength(4); // Stanford, Berkeley, Cornell, Columbia
      });

      test("should return empty array for empty input", async () => {
        const result = await SearchModel.extractUniqueUniversityIds([]);
        expect(result).toEqual([]);
      });
    });

    describe("getUniqueLocations", () => {
      test("should return unique city and state combinations", async () => {
        const universities = await t.run(async (ctx) => {
          return await ctx.db.query("universities").collect();
        });
        
        const result = await t.run(async (ctx) => {
          return await SearchModel.getUniqueLocations(ctx, universities);
        });
        
        // Should return 4 unique locations
        expect(result).toHaveLength(4);
        expect(result).toContainEqual({ city: "Stanford", state: "California" });
        expect(result).toContainEqual({ city: "Berkeley", state: "California" });
        expect(result).toContainEqual({ city: "Ithaca", state: "New York" });
        expect(result).toContainEqual({ city: "New York", state: "New York" });
      });

      test("should handle empty input", async () => {
        const result = await t.run(async (ctx) => {
          return await SearchModel.getUniqueLocations(ctx, []);
        });
        
        expect(result).toEqual([]);
      });
    });

    describe("getUniqueDegreeTypes", () => {
      test("should return unique degree types with labels and sorted by frequency", async () => {
        const result = await t.run(async (ctx) => {
          return await SearchModel.getUniqueDegreeTypes(ctx);
        });
        
        // Check for correct structure
        expect(result.length).toBeGreaterThan(0);
        result.forEach(degree => {
          expect(degree).toHaveProperty("value");
          expect(degree).toHaveProperty("label");
          expect(typeof degree.value).toBe("string");
          expect(typeof degree.label).toBe("string");
        });
        
        // M.S. should be first (most frequent)
        expect(result[0].value).toBe("M.S.");
      });
    });
  });
});
