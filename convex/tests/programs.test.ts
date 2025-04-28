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
import { Id } from "../_generated/dataModel";
import * as ProgramModel from "../programs/model";
import { api } from "../_generated/api";

describe("Programs", () => {
  const t = convexTest(schema);
  let testUserId: Id<"users">;
  let otherUserId: Id<"users">;
  let universityId: Id<"universities">;
  let otherUniversityId: Id<"universities">;
  let nonExistentUniversityId: Id<"universities">;
  let programId: Id<"programs">;
  let otherProgramId: Id<"programs">;
  let nonExistentProgramId: Id<"programs">;
  let favoriteId: Id<"favorites">;

  const clerkId = `clerk-program-test-${Date.now()}-${Math.random()}`;
  const otherClerkId = `clerk-other-program-${Date.now()}-${Math.random()}`;
  const asUser = t.withIdentity({ subject: clerkId });
  const asOtherUser = t.withIdentity({ subject: otherClerkId });

  beforeAll(async () => {
    // Create users and universities
    [
      testUserId,
      otherUserId,
      universityId,
      otherUniversityId,
      nonExistentUniversityId,
    ] = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {
        name: "Program Test User",
        email: `program-test-${Date.now()}@example.com`,
        clerkId: clerkId,
      });
      const otherId = await ctx.db.insert("users", {
        name: "Other Program User",
        email: `other-program-${Date.now()}@example.com`,
        clerkId: otherClerkId,
      });
      const uniId = await ctx.db.insert("universities", {
        name: "Program University",
        location: { city: "Program City", state: "PC", country: "USA" },
        website: "http://programuni.edu",
      });
      const otherUniId = await ctx.db.insert("universities", {
        name: "Other Program University",
        location: { city: "Other City", state: "OC", country: "USA" },
        website: "http://otherprogramuni.edu",
      });
      const deletedUniId = await ctx.db.insert("universities", {
        name: "Deleted University",
        location: { city: "Deleted City", state: "DC", country: "USA" },
        website: "http://deleteduni.edu",
      });
      // Delete the university to create a non-existent university id
      await ctx.db.delete(deletedUniId);
      return [userId, otherId, uniId, otherUniId, deletedUniId];
    });

    // Create programs
    [programId, otherProgramId, nonExistentProgramId] = await t.run(
      async (ctx) => {
        const progId = await ctx.db.insert("programs", {
          universityId: universityId,
          name: "Computer Science Program",
          degree: "M.S.",
          department: "Computer Science",
          requirements: {
            minimumGPA: 3.0,
            gre: true,
            toefl: true,
            recommendationLetters: 3,
          },
          deadlines: {
            fall: "2024-01-15",
            spring: "2023-09-15",
          },
          website: "http://cs.programuni.edu",
        });
        const otherProgId = await ctx.db.insert("programs", {
          universityId: otherUniversityId,
          name: "Data Science Program",
          degree: "Ph.D.",
          department: "Data Science",
          requirements: {
            minimumGPA: 3.5,
            gre: true,
            toefl: true,
            recommendationLetters: 3,
          },
          deadlines: {
            fall: "2024-01-01",
          },
          website: "http://ds.otherprogramuni.edu",
        });
        const deletedProgId = await ctx.db.insert("programs", {
          universityId: universityId,
          name: "Deleted Program",
          degree: "M.S.",
          department: "Deleted Department",
          requirements: {},
          deadlines: {},
        });
        // Delete the program to create a non-existent program id
        await ctx.db.delete(deletedProgId);
        return [progId, otherProgId, deletedProgId];
      }
    );
  });

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date());
  });

  afterEach(async () => {
    vi.useRealTimers();
    vi.clearAllMocks();

    // Clean up favorites table
    await t.run(async (ctx) => {
      const favorites = await ctx.db.query("favorites").collect();
      await Promise.all(
        favorites.map((favorite) => ctx.db.delete(favorite._id))
      );
    });
  });

  afterAll(async () => {
    // Clean up the rest of the data after all tests are done
    await t.run(async (ctx) => {
      // Clean up programs
      const programs = await ctx.db.query("programs").collect();
      await Promise.all(programs.map((program) => ctx.db.delete(program._id)));

      // Clean up universities
      const universities = await ctx.db.query("universities").collect();
      await Promise.all(universities.map((uni) => ctx.db.delete(uni._id)));

      // Clean up users
      const users = await ctx.db.query("users").collect();
      await Promise.all(users.map((user) => ctx.db.delete(user._id)));
    });
  });

  describe("Queries", () => {
    describe("getProgram", () => {
      test("should return program if it exists", async () => {
        const program = await asUser.query(api.programs.queries.getProgram, {
          programId: programId,
        });

        expect(program).not.toBeNull();
        expect(program._id).toBe(programId);
        expect(program.name).toBe("Computer Science Program");
        expect(program.degree).toBe("M.S.");
        expect(program.department).toBe("Computer Science");
        expect(program.universityId).toBe(universityId);
      });

      test("should throw if program ID does not exist", async () => {
        await expect(
          asUser.query(api.programs.queries.getProgram, {
            programId: nonExistentProgramId,
          })
        ).rejects.toThrow();
      });

      test("should return program even when not authenticated", async () => {
        // Public data should be accessible without authentication
        const program = await t.query(api.programs.queries.getProgram, {
          programId: programId,
        });

        expect(program).not.toBeNull();
        expect(program._id).toBe(programId);
      });
    });

    describe("getProgramsByIds", () => {
      test("should return programs for valid IDs", async () => {
        const programs = await asUser.query(
          api.programs.queries.getProgramsByIds,
          {
            programIds: [programId, otherProgramId],
          }
        );

        expect(programs).not.toBeNull();
        expect(programs.length).toBe(2);
        expect(programs[0]._id).toBe(programId);
        expect(programs[1]._id).toBe(otherProgramId);
      });

      test("should return empty array for empty ID list", async () => {
        const programs = await asUser.query(
          api.programs.queries.getProgramsByIds,
          {
            programIds: [],
          }
        );

        expect(programs).toEqual([]);
      });

      test("should ignore non-existent IDs", async () => {
        const programs = await asUser.query(
          api.programs.queries.getProgramsByIds,
          {
            programIds: [programId, nonExistentProgramId],
          }
        );

        expect(programs.length).toBe(1);
        expect(programs[0]._id).toBe(programId);
      });

      test("should return programs even when not authenticated", async () => {
        // Public data should be accessible without authentication
        const programs = await t.query(api.programs.queries.getProgramsByIds, {
          programIds: [programId],
        });

        expect(programs).not.toBeNull();
        expect(programs.length).toBe(1);
      });
    });
  });

  describe("Mutations", () => {
    describe("create", () => {
      test("should create a new program when authenticated", async () => {
        const programData = {
          universityId: universityId,
          name: "New Test Program",
          degree: "M.Eng.",
          department: "Engineering",
          website: "http://eng.programuni.edu",
          requirements: {
            minimumGPA: 3.2,
            gre: true,
            toefl: false,
            recommendationLetters: 2,
          },
          deadlines: {
            fall: "2024-02-01",
            spring: null,
          },
        };

        const newProgramId = await asUser.mutation(
          api.programs.mutations.create,
          programData
        );

        expect(newProgramId).not.toBeNull();

        // Verify program created correctly
        const newProgram = await t.run(async (ctx) => {
          return await ctx.db.get(newProgramId);
        });

        expect(newProgram).not.toBeNull();
        expect(newProgram?.name).toBe("New Test Program");
        expect(newProgram?.degree).toBe("M.Eng.");
        expect(newProgram?.department).toBe("Engineering");
        expect(newProgram?.universityId).toBe(universityId);
        expect(newProgram?.requirements.minimumGPA).toBe(3.2);
        expect(newProgram?.deadlines.fall).toBe("2024-02-01");
        expect(newProgram?.deadlines.spring).toBeUndefined();
      });

      test("should throw when trying to create a program without authentication", async () => {
        const programData = {
          universityId: universityId,
          name: "Unauthorized Program",
          degree: "M.S.",
          department: "Unauthorized",
          website: "http://unauth.edu",
          requirements: {
            minimumGPA: 3.0,
          },
          deadlines: {},
        };

        await expect(
          t.mutation(api.programs.mutations.create, programData)
        ).rejects.toThrow(); // Authentication error
      });

      test("should throw when university does not exist", async () => {
        const programData = {
          universityId: nonExistentUniversityId,
          name: "Invalid University Program",
          degree: "M.S.",
          department: "Test",
          requirements: {},
          deadlines: {},
        };

        await expect(
          asUser.mutation(api.programs.mutations.create, programData)
        ).rejects.toThrow("University not found");
      });
    });
  });

  describe("Favorites", () => {
    describe("toggleFavorite", () => {
      test("should add program to favorites when not favorited", async () => {
        const result = await asUser.mutation(
          api.programs.favorites.toggleFavorite,
          {
            programId: programId,
          }
        );

        expect(result).toBe(true); // Now favorited

        // Verify favorite was added to database
        const favorites = await t.run(async (ctx) => {
          return await ctx.db
            .query("favorites")
            .withIndex("by_user", (q) => q.eq("userId", testUserId))
            .filter((q) => q.eq(q.field("programId"), programId))
            .collect();
        });

        expect(favorites.length).toBe(1);
        expect(favorites[0].userId).toBe(testUserId);
        expect(favorites[0].programId).toBe(programId);

        // Save favorite ID for later tests
        favoriteId = favorites[0]._id;
      });

      test("should remove program from favorites when already favorited", async () => {
        // First add to favorites
        await asUser.mutation(api.programs.favorites.toggleFavorite, {
          programId: programId,
        });

        // Then toggle again to remove
        const result = await asUser.mutation(
          api.programs.favorites.toggleFavorite,
          {
            programId: programId,
          }
        );

        expect(result).toBe(false); // No longer favorited

        // Verify favorite was removed from database
        const favorites = await t.run(async (ctx) => {
          return await ctx.db
            .query("favorites")
            .withIndex("by_user", (q) => q.eq("userId", testUserId))
            .filter((q) => q.eq(q.field("programId"), programId))
            .collect();
        });

        expect(favorites.length).toBe(0);
      });

      test("should throw when not authenticated", async () => {
        await expect(
          t.mutation(api.programs.favorites.toggleFavorite, {
            programId: programId,
          })
        ).rejects.toThrow(); // Authentication error
      });
    });

    describe("isFavorite", () => {
      test("should return true when program is favorited", async () => {
        // First add to favorites
        await asUser.mutation(api.programs.favorites.toggleFavorite, {
          programId: programId,
        });

        const isFav = await asUser.query(api.programs.favorites.isFavorite, {
          programId: programId,
        });

        expect(isFav).toBe(true);
      });

      test("should return false when program is not favorited", async () => {
        const isFav = await asUser.query(api.programs.favorites.isFavorite, {
          programId: otherProgramId, // Not favorited by user
        });

        expect(isFav).toBe(false);
      });

      test("should throw when not authenticated", async () => {
        await expect(
          t.query(api.programs.favorites.isFavorite, {
            programId: programId,
          })
        ).rejects.toThrow(); // Authentication error
      });
    });

    describe("getFavoritePrograms", () => {
      test("should return all programs favorited by user", async () => {
        // Add both programs to favorites
        await asUser.mutation(api.programs.favorites.toggleFavorite, {
          programId: programId,
        });
        await asUser.mutation(api.programs.favorites.toggleFavorite, {
          programId: otherProgramId,
        });

        const favoritePrograms = await asUser.query(
          api.programs.favorites.getFavoritePrograms
        );

        expect(favoritePrograms.length).toBe(2);
        const programIds = favoritePrograms.map((p) => p._id);
        expect(programIds).toContain(programId);
        expect(programIds).toContain(otherProgramId);
      });

      test("should return empty array when user has no favorites", async () => {
        // Make sure no favorites exist for user
        await t.run(async (ctx) => {
          const favorites = await ctx.db
            .query("favorites")
            .withIndex("by_user", (q) => q.eq("userId", testUserId))
            .collect();
          await Promise.all(favorites.map((fav) => ctx.db.delete(fav._id)));
        });

        const favoritePrograms = await asUser.query(
          api.programs.favorites.getFavoritePrograms
        );

        expect(favoritePrograms).toEqual([]);
      });

      test("should throw when not authenticated", async () => {
        await expect(
          t.query(api.programs.favorites.getFavoritePrograms)
        ).rejects.toThrow(); // Authentication error
      });
    });

    describe("getFavoriteProgramIds", () => {
      test("should return IDs of all programs favorited by user", async () => {
        // Add both programs to favorites
        await asUser.mutation(api.programs.favorites.toggleFavorite, {
          programId: programId,
        });
        await asUser.mutation(api.programs.favorites.toggleFavorite, {
          programId: otherProgramId,
        });

        const favoriteProgramIds = await asUser.query(
          api.programs.favorites.getFavoriteProgramIds
        );

        expect(favoriteProgramIds.length).toBe(2);
        const programIds = favoriteProgramIds.map((p) => p.programId);
        expect(programIds).toContain(programId);
        expect(programIds).toContain(otherProgramId);
      });

      test("should return empty array when user has no favorites", async () => {
        // Make sure no favorites exist for user
        await t.run(async (ctx) => {
          const favorites = await ctx.db
            .query("favorites")
            .withIndex("by_user", (q) => q.eq("userId", testUserId))
            .collect();
          await Promise.all(favorites.map((fav) => ctx.db.delete(fav._id)));
        });

        const favoriteProgramIds = await asUser.query(
          api.programs.favorites.getFavoriteProgramIds
        );

        expect(favoriteProgramIds).toEqual([]);
      });

      test("should throw when not authenticated", async () => {
        await expect(
          t.query(api.programs.favorites.getFavoriteProgramIds)
        ).rejects.toThrow(); // Authentication error
      });
    });

    describe("getFavoriteProgramsWithUniversity", () => {
      test("should return programs with university data", async () => {
        // Add program to favorites
        await asUser.mutation(api.programs.favorites.toggleFavorite, {
          programId: programId,
        });

        const programsWithUniversity = await asUser.query(
          api.programs.favorites.getFavoriteProgramsWithUniversity
        );

        expect(programsWithUniversity.length).toBe(1);
        expect(programsWithUniversity[0]._id).toBe(programId);
        expect(programsWithUniversity[0].university).toBeDefined();
        expect(programsWithUniversity[0].university._id).toBe(universityId);
        expect(programsWithUniversity[0].university.name).toBe(
          "Program University"
        );
      });

      test("should return empty array when user has no favorites", async () => {
        // Make sure no favorites exist for user
        await t.run(async (ctx) => {
          const favorites = await ctx.db
            .query("favorites")
            .withIndex("by_user", (q) => q.eq("userId", testUserId))
            .collect();
          await Promise.all(favorites.map((fav) => ctx.db.delete(fav._id)));
        });

        const programsWithUniversity = await asUser.query(
          api.programs.favorites.getFavoriteProgramsWithUniversity
        );

        expect(programsWithUniversity).toEqual([]);
      });

      test("should filter out programs with missing university data", async () => {
        // Create program with non-existent university ID
        const orphanProgramId = await t.run(async (ctx) => {
          // This is just for testing - normally validation would prevent this
          return await ctx.db.insert("programs", {
            universityId: nonExistentUniversityId,
            name: "Orphan Program",
            degree: "M.S.",
            department: "Orphan Department",
            requirements: {},
            deadlines: {},
          });
        });

        // Add both regular and orphan program to favorites
        await asUser.mutation(api.programs.favorites.toggleFavorite, {
          programId: programId,
        });
        await asUser.mutation(api.programs.favorites.toggleFavorite, {
          programId: orphanProgramId,
        });

        const programsWithUniversity = await asUser.query(
          api.programs.favorites.getFavoriteProgramsWithUniversity
        );

        // Only the program with a valid university should be returned
        expect(programsWithUniversity.length).toBe(1);
        expect(programsWithUniversity[0]._id).toBe(programId);

        // Clean up orphan program
        await t.run(async (ctx) => {
          await ctx.db.delete(orphanProgramId);
        });
      });

      test("should throw when not authenticated", async () => {
        await expect(
          t.query(api.programs.favorites.getFavoriteProgramsWithUniversity)
        ).rejects.toThrow(); // Authentication error
      });
    });

    describe("deleteFavorite", () => {
      test("should delete favorite by ID", async () => {
        // First add to favorites and get the ID
        await asUser.mutation(api.programs.favorites.toggleFavorite, {
          programId: programId,
        });

        const favorites = await t.run(async (ctx) => {
          return await ctx.db
            .query("favorites")
            .withIndex("by_user", (q) => q.eq("userId", testUserId))
            .filter((q) => q.eq(q.field("programId"), programId))
            .collect();
        });

        expect(favorites.length).toBe(1);
        const favoriteId = favorites[0]._id;

        // Delete the favorite
        const result = await asUser.mutation(
          api.programs.favorites.deleteFavorite,
          {
            favoriteId: favoriteId,
          }
        );

        expect(result).toBe(true);

        // Verify it was deleted
        const remainingFavorites = await t.run(async (ctx) => {
          return await ctx.db.get(favoriteId);
        });

        expect(remainingFavorites).toBeNull();
      });

      test("should throw when not authenticated", async () => {
        // First create a favorite
        await asUser.mutation(api.programs.favorites.toggleFavorite, {
          programId: programId,
        });

        const favorites = await t.run(async (ctx) => {
          return await ctx.db
            .query("favorites")
            .withIndex("by_user", (q) => q.eq("userId", testUserId))
            .filter((q) => q.eq(q.field("programId"), programId))
            .collect();
        });

        const favoriteId = favorites[0]._id;

        await expect(
          t.mutation(api.programs.favorites.deleteFavorite, {
            favoriteId: favoriteId,
          })
        ).rejects.toThrow(); // Authentication error
      });
    });
  });

  describe("Model", () => {
    describe("getProgramsByIds", () => {
      test("should return programs matching the given IDs", async () => {
        const programs = await asUser.run(async (ctx) => {
          return await ProgramModel.getProgramsByIds(ctx, [
            programId,
            otherProgramId,
          ]);
        });

        expect(programs.length).toBe(2);
        expect(programs[0]._id).toBe(programId);
        expect(programs[1]._id).toBe(otherProgramId);
      });

      test("should return empty array when given empty array", async () => {
        const programs = await asUser.run(async (ctx) => {
          return await ProgramModel.getProgramsByIds(ctx, []);
        });

        expect(programs).toEqual([]);
      });

      test("should filter out non-existent program IDs", async () => {
        const programs = await asUser.run(async (ctx) => {
          return await ProgramModel.getProgramsByIds(ctx, [
            programId,
            nonExistentProgramId,
          ]);
        });

        expect(programs.length).toBe(1);
        expect(programs[0]._id).toBe(programId);
      });
    });

    describe("getProgramsByUniversityId", () => {
      test("should return all programs for a university", async () => {
        // Create a second program for the same university
        const secondProgramId = await t.run(async (ctx) => {
          return await ctx.db.insert("programs", {
            universityId: universityId,
            name: "Second Program",
            degree: "M.A.",
            department: "Fine Arts",
            requirements: {},
            deadlines: {},
          });
        });

        const programs = await asUser.run(async (ctx) => {
          return await ProgramModel.getProgramsByUniversityId(
            ctx,
            universityId
          );
        });

        expect(programs.length).toBe(3);
        const programNames = programs.map((p) => p.name);
        expect(programNames).toContain("Computer Science Program");
        expect(programNames).toContain("Second Program");

        // Clean up
        await t.run(async (ctx) => {
          await ctx.db.delete(secondProgramId);
        });
      });

      test("should return empty array when university has no programs", async () => {
        // Create a new university with no programs
        const emptyUniversityId = await t.run(async (ctx) => {
          return await ctx.db.insert("universities", {
            name: "Empty University",
            location: { city: "Empty City", state: "EC", country: "USA" },
            website: "http://empty.edu",
          });
        });

        const programs = await asUser.run(async (ctx) => {
          return await ProgramModel.getProgramsByUniversityId(
            ctx,
            emptyUniversityId
          );
        });

        expect(programs).toEqual([]);

        // Clean up
        await t.run(async (ctx) => {
          await ctx.db.delete(emptyUniversityId);
        });
      });

      test("should return empty array for non-existent university ID", async () => {
        const programs = await asUser.run(async (ctx) => {
          return await ProgramModel.getProgramsByUniversityId(
            ctx,
            nonExistentUniversityId
          );
        });

        expect(programs).toEqual([]);
      });
    });
  });
});
