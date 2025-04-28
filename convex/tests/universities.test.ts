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
import * as UniversityModel from "../universities/model";
import { api } from "../_generated/api";

describe("Universities", () => {
  const t = convexTest(schema);
  let testUserId: Id<"users">;
  let universityId1: Id<"universities">;
  let universityId2: Id<"universities">;
  let universityId3: Id<"universities">;
    let nonExistentUniId: Id<"universities">;
  let programId1: Id<"programs">;
  let programId2: Id<"programs">;
  let programId3: Id<"programs">;
  let nonExistentProgId: Id<"programs">;

  const clerkId = `clerk-uni-test-${Date.now()}-${Math.random()}`;
  const asUser = t.withIdentity({ subject: clerkId });

  beforeAll(async () => {
    // Create users, universities, and programs for testing
    [
      testUserId,
      universityId1,
      universityId2,
      universityId3,
      nonExistentUniId,
      programId1,
      programId2,
      programId3,
      nonExistentProgId,
    ] = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {
        name: "University Test User",
        email: `uni-test-${Date.now()}@example.com`,
        clerkId: clerkId,
      });

      // Create universities
      const uniId1 = await ctx.db.insert("universities", {
        name: "Harvard University",
        location: { city: "Cambridge", state: "MA", country: "USA" },
        ranking: 5,
        website: "http://harvard.edu",
        imageUrl: "http://example.com/harvard.jpg",
      });

      const uniId2 = await ctx.db.insert("universities", {
        name: "Yale University",
        location: { city: "New Haven", state: "CT", country: "USA" },
        ranking: 8,
        website: "http://yale.edu",
        imageUrl: "http://example.com/yale.jpg",
      });

      const uniId3 = await ctx.db.insert("universities", {
        name: "Cambridge University",
        location: { city: "Cambridge", state: "", country: "UK" },
        ranking: 3,
        website: "http://cam.ac.uk",
        imageUrl: "http://example.com/cambridge.jpg",
      });

      const deletedUniId = await ctx.db.insert("universities", {
        name: "Deleted University",
        location: { city: "Deleted City", state: "Deleted State", country: "Deleted Country" },
        ranking: 10,
        website: "http://deleted.edu",
        imageUrl: "http://example.com/deleted.jpg",
      });
      await ctx.db.delete(deletedUniId);

      // Create programs for universities
      const progId1 = await ctx.db.insert("programs", {
        universityId: uniId1,
        name: "Law",
        degree: "J.D.",
        department: "Law School",
        requirements: {
          minimumGPA: 3.8,
          recommendationLetters: 3,
        },
        deadlines: { fall: "2023-12-01" },
        website: "http://harvard.edu/law",
      });

      const progId2 = await ctx.db.insert("programs", {
        universityId: uniId1,
        name: "Business",
        degree: "M.B.A.",
        department: "Business School",
        requirements: {
          minimumGPA: 3.6,
          recommendationLetters: 2,
        },
        deadlines: { fall: "2024-01-05" },
        website: "http://harvard.edu/business",
      });

      const progId3 = await ctx.db.insert("programs", {
        universityId: uniId2,
        name: "Computer Science",
        degree: "M.S.",
        department: "Engineering",
        requirements: {
          minimumGPA: 3.5,
          gre: true,
          recommendationLetters: 3,
        },
        deadlines: { fall: "2023-12-15" },
        website: "http://yale.edu/cs",
      });

      const deletedProgId = await ctx.db.insert("programs", {
        universityId: uniId3,
        name: "Non-Existent Program",
        degree: "Ph.D.",
        department: "Non-Existent Department",
        requirements: {
          minimumGPA: 4.0,
          gre: true,
          recommendationLetters: 2,
        },
        deadlines: { fall: "2024-01-01" },
        website: "http://nonexistent.edu",
      });
      await ctx.db.delete(deletedProgId);

      return [userId, uniId1, uniId2, uniId3, deletedUniId, progId1, progId2, progId3, deletedProgId];
    });
  });

  afterAll(async () => {
    // Clean up the data after all tests are done
    await t.run(async (ctx) => {
      // Delete programs
      const progs = await ctx.db.query("programs").collect();
      await Promise.all(progs.map((prog) => ctx.db.delete(prog._id)));

      // Delete universities
      const unis = await ctx.db.query("universities").collect();
      await Promise.all(unis.map((uni) => ctx.db.delete(uni._id)));

      // Delete users
      const users = await ctx.db.query("users").collect();
      await Promise.all(users.map((user) => ctx.db.delete(user._id)));
    });
  });

  describe("Queries", () => {
    describe("getUniversity", () => {
      test("should return university by ID", async () => {
        const university = await asUser.query(api.universities.queries.getUniversity, {
          universityId: universityId1,
        });

        expect(university).not.toBeNull();
        expect(university._id).toBe(universityId1);
        expect(university.name).toBe("Harvard University");
      });

      test("should throw if university ID does not exist", async () => {
        await expect(
          asUser.query(api.universities.queries.getUniversity, {
            universityId: nonExistentUniId,
          })
        ).rejects.toThrow(`University with ID ${nonExistentUniId} not found`);
      });

      test("should allow unauthenticated access", async () => {
        const university = await t.query(api.universities.queries.getUniversity, {
          universityId: universityId2,
        });

        expect(university).not.toBeNull();
        expect(university._id).toBe(universityId2);
        expect(university.name).toBe("Yale University");
      });
    });

    describe("getUniversities", () => {
      test("should return multiple universities by IDs", async () => {
        const universities = await asUser.query(api.universities.queries.getUniversities, {
          universityIds: [universityId1, universityId3],
        });

        expect(universities.length).toBe(2);
        expect(universities[0]._id).toBe(universityId1);
        expect(universities[1]._id).toBe(universityId3);
      });

      test("should return empty array if no IDs are provided", async () => {
        const universities = await asUser.query(api.universities.queries.getUniversities, {
          universityIds: [],
        });

        expect(universities).toEqual([]);
      });

      test("should allow unauthenticated access", async () => {
        const universities = await t.query(api.universities.queries.getUniversities, {
          universityIds: [universityId2],
        });

        expect(universities.length).toBe(1);
        expect(universities[0].name).toBe("Yale University");
      });
    });

    describe("list", () => {
      test("should return all universities sorted by name", async () => {
        const universities = await asUser.query(api.universities.queries.list, {});

        expect(universities.length).toBe(3);
        
        // Check that universities are ordered alphabetically by name
        expect(universities[0].name).toBe("Cambridge University");
        expect(universities[1].name).toBe("Harvard University");
        expect(universities[2].name).toBe("Yale University");
      });

      test("should allow unauthenticated access", async () => {
        const universities = await t.query(api.universities.queries.list, {});

        expect(universities.length).toBe(3);
        expect(universities[0].name).toBe("Cambridge University");
      });
    });
  });

  describe("Model", () => {
    describe("getUniversitiesByIds", () => {
      test("should return universities matching provided IDs", async () => {
        const universities = await t.run(async (ctx) => {
          return await UniversityModel.getUniversitiesByIds(ctx, [
            universityId1,
            universityId2,
          ]);
        });

        expect(universities.length).toBe(2);
        expect(universities[0]._id).toBe(universityId1);
        expect(universities[1]._id).toBe(universityId2);
      });

      test("should return universities in the order they were requested", async () => {
        // Request in different order than they were created
        const universities = await t.run(async (ctx) => {
          return await UniversityModel.getUniversitiesByIds(ctx, [
            universityId2,
            universityId1,
            universityId3,
          ]);
        });

        expect(universities.length).toBe(3);
        expect(universities[0]._id).toBe(universityId1);
        expect(universities[1]._id).toBe(universityId2);
        expect(universities[2]._id).toBe(universityId3);
      });

      test("should return empty array if no IDs provided", async () => {
        const universities = await t.run(async (ctx) => {
          return await UniversityModel.getUniversitiesByIds(ctx, []);
        });

        expect(universities).toEqual([]);
      });

      test("should return only found universities if some IDs don't exist", async () => {
        const universities = await t.run(async (ctx) => {
          return await UniversityModel.getUniversitiesByIds(ctx, [
            universityId1,
            nonExistentUniId,
            universityId2,
          ]);
        });

        expect(universities.length).toBe(2);
        expect(universities[0]._id).toBe(universityId1);
        expect(universities[1]._id).toBe(universityId2);
      });
    });

    describe("getUniversityById", () => {
      test("should return university when it exists", async () => {
        const university = await t.run(async (ctx) => {
          return await UniversityModel.getUniversityById(ctx, universityId1);
        });

        expect(university).not.toBeNull();
        expect(university?._id).toBe(universityId1);
        expect(university?.name).toBe("Harvard University");
      });

      test("should return null when university doesn't exist", async () => {
        const university = await t.run(async (ctx) => {
          return await UniversityModel.getUniversityById(ctx, nonExistentUniId);
        });

        expect(university).toBeNull();
      });
    });

    describe("getUniversityIdByProgramID", () => {
      test("should return university ID for a program", async () => {
        const universityId = await t.run(async (ctx) => {
          return await UniversityModel.getUniversityIdByProgramID(ctx, programId1);
        });

        expect(universityId).toBe(universityId1);
      });

      test("should return null for non-existent program", async () => {
        const universityId = await t.run(async (ctx) => {
          return await UniversityModel.getUniversityIdByProgramID(ctx, nonExistentProgId);
        });

        expect(universityId).toBeNull();
      });

      test("should return correct university ID for programs at different universities", async () => {
        const uniIdForProg1 = await t.run(async (ctx) => {
          return await UniversityModel.getUniversityIdByProgramID(ctx, programId1);
        });
        
        const uniIdForProg3 = await t.run(async (ctx) => {
          return await UniversityModel.getUniversityIdByProgramID(ctx, programId3);
        });

        expect(uniIdForProg1).toBe(universityId1);
        expect(uniIdForProg3).toBe(universityId2);
      });
    });
  });
});
