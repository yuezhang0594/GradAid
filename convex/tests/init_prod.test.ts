import { convexTest } from "convex-test";
import { describe, test, expect, beforeEach, afterAll, vi } from "vitest";
import schema from "../schema";
import { internal } from "../_generated/api";

// Use vi.hoisted to define mocks that need to be referenced in vi.mock() calls
const mockData = vi.hoisted(() => {
  const universities = [
    {
      name: "Test University",
      location: { city: "Test City", state: "TS", country: "Test Country" },
      website: "http://testuniversity.edu",
      ranking: 42,
    },
    {
      name: "Another University",
      location: { city: "Another City", state: "AS", country: "Another Country" },
      website: "http://anotheruniversity.edu",
    },
  ];

  const programs = [
    {
      universityId: "Test University", // This will be replaced with actual ID
      name: "Computer Science",
      degree: "M.S.",
      department: "Computer Science",
      requirements: {
        minimumGPA: 3.0,
        gre: true,
        toefl: true,
        recommendationLetters: 3,
      },
      deadlines: {
        fall: "2023-12-15",
        spring: "2023-05-01",
      },
      website: "http://testuniversity.edu/cs",
    },
    {
      universityId: "Test University", // This will be replaced with actual ID
      name: "Electrical Engineering",
      degree: "Ph.D.",
      department: "Electrical Engineering",
      requirements: {
        minimumGPA: 3.5,
        gre: true,
        toefl: true,
        recommendationLetters: 3,
      },
      deadlines: {
        fall: "2023-12-01",
      },
      website: "http://testuniversity.edu/ee",
    },
    {
      universityId: "Another University", // This will be replaced with actual ID
      name: "Business Administration",
      degree: "M.B.A.",
      department: "Business School",
      requirements: {
        gre: false,
        toefl: true,
      },
      deadlines: {
        fall: "2023-01-15",
        spring: "2023-09-15",
      },
    },
    // Program with skipped degree that should be filtered out
    {
      universityId: "Another University", // This will be replaced with actual ID
      name: "Master of Arts in Education",
      degree: "M.A.Ed.", // This degree should be skipped
      department: "Education",
      requirements: {},
      deadlines: {},
    },
  ];

  return { universities, programs };
});

// Mock data modules
vi.mock("../data/universities.json", () => {
  return { default: mockData.universities };
});

vi.mock("../data/programs.json", () => {
  return { default: mockData.programs };
});

describe("Initialize Production Database", () => {
  const t = convexTest(schema);

  beforeEach(async () => {
    // Clean up tables before each test
    await t.run(async (ctx) => {
      const universities = await ctx.db.query("universities").collect();
      await Promise.all(universities.map((uni) => ctx.db.delete(uni._id)));

      const programs = await ctx.db.query("programs").collect();
      await Promise.all(programs.map((prog) => ctx.db.delete(prog._id)));
    });
  });

  afterAll(async () => {
    // Final cleanup
    await t.run(async (ctx) => {
      const universities = await ctx.db.query("universities").collect();
      await Promise.all(universities.map((uni) => ctx.db.delete(uni._id)));

      const programs = await ctx.db.query("programs").collect();
      await Promise.all(programs.map((prog) => ctx.db.delete(prog._id)));
    });
  });

  test("should clear existing data in universities and programs tables", async () => {
    // Insert some initial data
    await t.run(async (ctx) => {
      await ctx.db.insert("universities", {
        name: "Existing University",
        location: { city: "Old City", state: "OC", country: "Old Country" },
        website: "http://existing.edu",
      });
      
      const uniId = await ctx.db.insert("universities", {
        name: "Another Existing University",
        location: { city: "Another Old City", state: "AOC", country: "Another Old Country" },
        website: "http://anotherexisting.edu",
      });
      
      await ctx.db.insert("programs", {
        universityId: uniId,
        name: "Existing Program",
        degree: "M.S.",
        department: "Existing Department",
        requirements: {},
        deadlines: {},
      });
    });

    // Verify initial data exists
    const initialUniversities = await t.run(async (ctx) => {
      return await ctx.db.query("universities").collect();
    });
    const initialPrograms = await t.run(async (ctx) => {
      return await ctx.db.query("programs").collect();
    });
    
    expect(initialUniversities.length).toBeGreaterThan(0);
    expect(initialPrograms.length).toBeGreaterThan(0);

    // Run init_prod
    await t.mutation(internal.init_prod.default, {});

    // Check that old data was cleared and new data was added
    const universities = await t.run(async (ctx) => {
      return await ctx.db.query("universities").collect();
    });
    
    // Should have exactly the number of universities in our mock data
    expect(universities.length).toBe(mockData.universities.length);
    
    // Verify none of the existing universities remain
    const existingUniversityNames = ["Existing University", "Another Existing University"];
    universities.forEach(uni => {
      expect(existingUniversityNames.includes(uni.name)).toBe(false);
    });
  });

  test("should insert universities with correct data", async () => {
    await t.mutation(internal.init_prod.default, {});

    const universities = await t.run(async (ctx) => {
      return await ctx.db.query("universities").collect();
    });

    expect(universities.length).toBe(mockData.universities.length);
    
    // Check that all mock universities were inserted correctly
    for (const mockUni of mockData.universities) {
      const insertedUni = universities.find(uni => uni.name === mockUni.name);
      expect(insertedUni).toBeDefined();
      expect(insertedUni?.location.city).toBe(mockUni.location.city);
      expect(insertedUni?.location.state).toBe(mockUni.location.state);
      expect(insertedUni?.location.country).toBe(mockUni.location.country);
      expect(insertedUni?.website).toBe(mockUni.website);
      if (mockUni.ranking) {
        expect(insertedUni?.ranking).toBe(mockUni.ranking);
      }
    }
  });

  test("should insert programs with correct university references", async () => {
    await t.mutation(internal.init_prod.default, {});

    const universities = await t.run(async (ctx) => {
      return await ctx.db.query("universities").collect();
    });
    
    const universityMap = new Map();
    universities.forEach(uni => {
      universityMap.set(uni.name, uni._id);
    });

    const programs = await t.run(async (ctx) => {
      return await ctx.db.query("programs").collect();
    });
    
    // We expect one less program because M.A.Ed. should be filtered out
    const nonSkippedPrograms = mockData.programs.filter(p => p.degree !== "M.A.Ed.");
    expect(programs.length).toBe(nonSkippedPrograms.length);
    
    // Check programs have correct references to universities
    for (const program of programs) {
      const matchingUni = universities.find(uni => uni._id === program.universityId);
      expect(matchingUni).toBeDefined();
      
      // Find the original mock program to compare properties
      const mockProgramName = program.name;
      const mockProgram = mockData.programs.find(p => p.name === mockProgramName);
      expect(mockProgram).toBeDefined();
      
      // The university name in mock data should match the referenced university name
      const uniName = matchingUni?.name;
      const originalUniName = mockProgram?.universityId;
      expect(uniName).toBe(originalUniName);
      
      // Other program properties
      expect(program.degree).toBe(mockProgram?.degree);
      expect(program.department).toBe(mockProgram?.department);
      
      // Check deadlines
      if (mockProgram?.deadlines.fall) {
        expect(program.deadlines.fall).toBe(mockProgram.deadlines.fall);
      }
      if (mockProgram?.deadlines.spring) {
        expect(program.deadlines.spring).toBe(mockProgram.deadlines.spring);
      }
    }
  });

  test("should filter out programs with skipped degree types", async () => {
    await t.mutation(internal.init_prod.default, {});

    const programs = await t.run(async (ctx) => {
      return await ctx.db.query("programs").collect();
    });
    
    // Check that filtered degrees don't appear
    const filteredDegreeProgram = programs.find(p => p.degree === "M.A.Ed.");
    expect(filteredDegreeProgram).toBeUndefined();
    
    // Double check the total count
    const expectedCount = mockData.programs.filter(p => p.degree !== "M.A.Ed.").length;
    expect(programs.length).toBe(expectedCount);
  });

  test("should set default minimumGPA for programs where it's not specified", async () => {
    await t.mutation(internal.init_prod.default, {});

    const programs = await t.run(async (ctx) => {
      return await ctx.db.query("programs").collect();
    });
    
    // Find the Business Administration program which doesn't have minimumGPA in mock data
    const businessProgram = programs.find(p => 
      p.name === "Business Administration" && p.degree === "M.B.A.");
    
    expect(businessProgram).toBeDefined();
    expect(businessProgram?.requirements.minimumGPA).toBe(2.5);
  });

  test("should return null if university not found for a program", async () => {
    // Create custom mock data with a program referencing a non-existent university
    const customPrograms = [
      ...mockData.programs,
      {
        universityId: "Non-Existent University",
        name: "Program With Invalid University",
        degree: "M.S.",
        department: "Test Department",
        requirements: {},
        deadlines: {},
      }
    ];
    
    // Override the mock for this test using vi.doMock
    vi.doMock("../data/programs.json", () => {
      return { default: customPrograms };
    });
    
    // Expect initialization to fail
    await expect(t.mutation(internal.init_prod.default, {}))
      .resolves
      .toBeNull();
  });
});
