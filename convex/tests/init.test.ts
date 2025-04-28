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
import { api, internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";

describe("Database Initialization", () => {
  const t = convexTest(schema);
  
  // Test user data
  const clerkId = `clerk-init-test-${Date.now()}-${Math.random()}`;
  let testUserId: Id<"users">;
  let userProfileId: Id<"userProfiles">;

  beforeAll(async () => {
    // Create a test user and profile for testing profile preservation
    [testUserId, userProfileId] = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {
        name: "Init Test User",
        email: `init-test-${Date.now()}@example.com`,
        clerkId: clerkId,
      });
      
      const profileId = await ctx.db.insert("userProfiles", {
        userId: userId,
        // Required fields
        countryOfOrigin: "Test Country",
        dateOfBirth: new Date().toISOString(),
        currentLocation: "Test Location",
        nativeLanguage: "English",
        educationLevel: "Bachelor's",
        major: "Computer Science",
        university: "Test University",
        gpa: 3.8,
        gpaScale: 4.0,
        graduationDate: new Date().toISOString(),
        targetDegree: "Master's",
        intendedField: "Computer Science",
        researchInterests: ["AI", "Machine Learning"],
        careerObjectives: "Research",
        targetLocations: ["USA", "UK"],
        expectedStartDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        onboardingCompleted: true,
      });
      
      // Create an AI credits record for the user
      await ctx.db.insert("aiCredits", {
        userId: userId,
        totalCredits: 500,
        usedCredits: 0,
        resetDate: new Date().toISOString(),
      });
      
      // Create a user activity record
      await ctx.db.insert("userActivity", {
        userId: userId,
        type: "document_edit",
        description: "Test activity",
        timestamp: new Date().toISOString(),
        metadata: {},
      });
      
      return [userId, profileId];
    });
  });

  afterAll(async () => {
    // Clean up all test data after tests finish
    await t.run(async (ctx) => {
      // Clean up user data
      const users = await ctx.db.query("users").collect();
      await Promise.all(users.map((user) => ctx.db.delete(user._id)));
      
      // Clean up any remaining userProfiles
      const profiles = await ctx.db.query("userProfiles").collect();
      await Promise.all(profiles.map((profile) => ctx.db.delete(profile._id)));
      
      // Clean up any remaining aiCredits
      const credits = await ctx.db.query("aiCredits").collect();
      await Promise.all(credits.map((credit) => ctx.db.delete(credit._id)));
      
      // Clean up any remaining userActivity
      const activities = await ctx.db.query("userActivity").collect();
      await Promise.all(activities.map((activity) => ctx.db.delete(activity._id)));
    });
  });
  
  beforeEach(async () => {
    // Add some test data before each test to ensure there's something to clear
    await t.run(async (ctx) => {
      // Add a university
      const uniId = await ctx.db.insert("universities", {
        name: "Test University",
        location: { city: "Test City", state: "TS", country: "Test Country" },
        website: "http://testuni.edu",
        ranking: 999,
        imageUrl: "http://example.com/image.jpg",
      });
      
      // Add a program
      const progId = await ctx.db.insert("programs", {
        universityId: uniId,
        name: "Test Program",
        degree: "M.S.",
        department: "Test Department",
        requirements: {
          minimumGPA: 3.0,
          gre: true,
          toefl: true,
          recommendationLetters: 3,
        },
        deadlines: {
          fall: "December 15",
          spring: "August 15",
        },
      });
      
      // Add an application
      await ctx.db.insert("applications", {
        userId: testUserId,
        universityId: uniId,
        programId: progId,
        status: "draft",
        deadline: new Date().toISOString(),
        priority: "medium",
        lastUpdated: new Date().toISOString(),
      });
      
      // Add a favorite
      await ctx.db.insert("favorites", {
        userId: testUserId,
        programId: progId,
      });
    });
  });

  afterEach(async () => {
    // Ensure all test data is removed after each test
    vi.clearAllMocks();
  });

  describe("Database Reset", () => {
    test("should clear application data while preserving user profiles by default", async () => {
      // Run the init function with default keepProfileData=true
      await t.mutation(internal.init.default, {});
      
      // Check that applications, universities, programs, and favorites are cleared
      const universities = await t.run(async (ctx) => {
        return await ctx.db.query("universities").collect();
      });
      
      const programs = await t.run(async (ctx) => {
        return await ctx.db.query("programs").collect();
      });
      
      const applications = await t.run(async (ctx) => {
        return await ctx.db.query("applications").collect();
      });
      
      const favorites = await t.run(async (ctx) => {
        return await ctx.db.query("favorites").collect();
      });
      
      // These should be empty because they are cleared by default
      expect(applications.length).toBe(0);
      expect(favorites.length).toBe(0);
      
      // These should have been re-populated by the seed function
      expect(universities.length).toBeGreaterThan(0);
      expect(programs.length).toBeGreaterThan(0);
      
      // User data should be preserved
      const userProfiles = await t.run(async (ctx) => {
        return await ctx.db.query("userProfiles").collect();
      });
      
      const aiCredits = await t.run(async (ctx) => {
        return await ctx.db.query("aiCredits").collect();
      });
      
      const userActivities = await t.run(async (ctx) => {
        return await ctx.db.query("userActivity").collect();
      });
      
      // Verify user data is still there
      expect(userProfiles.length).toBeGreaterThan(0);
      expect(aiCredits.length).toBeGreaterThan(0);
      expect(userActivities.length).toBeGreaterThan(0);
      
      // Verify the specific test user profile still exists
      const testProfile = userProfiles.find(profile => profile._id === userProfileId);
      expect(testProfile).toBeDefined();
    });
    
    test("should clear all data including user profiles when keepProfileData=false", async () => {
      // Run the init function with keepProfileData=false
      await t.mutation(internal.init.default, { keepProfileData: false });
      
      // User data should be cleared
      const userProfiles = await t.run(async (ctx) => {
        return await ctx.db.query("userProfiles").collect();
      });
      
      const aiCredits = await t.run(async (ctx) => {
        return await ctx.db.query("aiCredits").collect();
      });
      
      const userActivities = await t.run(async (ctx) => {
        return await ctx.db.query("userActivity").collect();
      });
      
      // Verify user data is cleared
      expect(userProfiles.length).toBe(0);
      expect(aiCredits.length).toBe(0);
      expect(userActivities.length).toBe(0);
    });
  });

  describe("Database Seeding", () => {
    test("should seed the database with predefined universities", async () => {
      // Run the init function
      await t.mutation(internal.init.default, {});
      
      // Get all universities
      const universities = await t.run(async (ctx) => {
        return await ctx.db.query("universities").collect();
      });
      
      // Verify expected universities are present
      const expectedUniversities = [
        "Stanford University",
        "Massachusetts Institute of Technology",
        "Harvard University",
        "Princeton University",
        "University of California Berkeley"
      ];
      
      // Check if each expected university exists
      for (const uniName of expectedUniversities) {
        const found = universities.some(u => u.name === uniName);
        expect(found).toBe(true);
      }
      
      // Verify university data structure
      const stanford = universities.find(u => u.name === "Stanford University");
      expect(stanford).toBeDefined();
      expect(stanford?.location.city).toBe("Stanford");
      expect(stanford?.location.state).toBe("California");
      expect(stanford?.location.country).toBe("USA");
      expect(stanford?.website).toBe("https://www.stanford.edu");
      expect(stanford?.imageUrl).toBe("https://storage.googleapis.com/gradaid-images/stanford.jpg");
    });
    
    test("should seed the database with predefined programs linked to universities", async () => {
      // Run the init function
      await t.mutation(internal.init.default, {});
      
      // Get all programs
      const programs = await t.run(async (ctx) => {
        return await ctx.db.query("programs").collect();
      });
      
      // Verify programs exist
      expect(programs.length).toBeGreaterThan(0);
      
      // Get all universities to check program references
      const universities = await t.run(async (ctx) => {
        return await ctx.db.query("universities").collect();
      });
      
      // Get a specific university
      const mit = universities.find(u => u.name === "Massachusetts Institute of Technology");
      expect(mit).toBeDefined();
      
      if (mit) {
        // Find programs linked to MIT
        const mitPrograms = programs.filter(p => p.universityId === mit._id);
        expect(mitPrograms.length).toBeGreaterThan(0);
        
        // Check if specific program exists
        const aiProgram = mitPrograms.find(p => 
          p.name === "Artificial Intelligence" && 
          p.degree === "M.S."
        );
        
        expect(aiProgram).toBeDefined();
        if (aiProgram) {
          expect(aiProgram.department).toBe("School of Engineering");
          expect(aiProgram.requirements.gre).toBe(true);
          expect(aiProgram.requirements.toefl).toBe(true);
          expect(aiProgram.requirements.recommendationLetters).toBe(3);
          expect(aiProgram.deadlines.fall).toBe("December 15");
        }
      }
    });
    
    test("should create multiple program types for some universities", async () => {
      // Run the init function
      await t.mutation(internal.init.default, {});
      
      // Get all universities and programs
      const [universities, programs] = await t.run(async (ctx) => {
        const unis = await ctx.db.query("universities").collect();
        const progs = await ctx.db.query("programs").collect();
        return [unis, progs];
      });
      
      // Find Stanford University
      const stanford = universities.find(u => u.name === "Stanford University");
      expect(stanford).toBeDefined();
      
      if (stanford) {
        // Find programs for Stanford
        const stanfordPrograms = programs.filter(p => p.universityId === stanford._id);
        
        // Stanford should have multiple programs
        expect(stanfordPrograms.length).toBeGreaterThan(1);
        
        // Check for both MS and PhD programs
        const msProgram = stanfordPrograms.find(p => p.degree === "M.S.");
        const phdProgram = stanfordPrograms.find(p => p.degree === "Ph.D.");
        
        expect(msProgram).toBeDefined();
        expect(phdProgram).toBeDefined();
      }
    });
    
    test("should create programs with correct detailed requirements", async () => {
      // Run the init function
      await t.mutation(internal.init.default, {});
      
      // Get all programs
      const programs = await t.run(async (ctx) => {
        return await ctx.db.query("programs").collect();
      });
      
      // Find programs with specific requirements
      const programsWithGRE = programs.filter(p => p.requirements.gre === true);
      const programsWithoutGRE = programs.filter(p => p.requirements.gre === false);
      
      // Verify both types exist
      expect(programsWithGRE.length).toBeGreaterThan(0);
      expect(programsWithoutGRE.length).toBeGreaterThan(0);
      
      // Check deadlines format
      const program = programs[0];
      if (program.deadlines.fall) {
        // Deadlines should be in a human-readable format
        expect(typeof program.deadlines.fall).toBe("string");
        expect(program.deadlines.fall.includes("ember")).toBe(true); // December/November/September
      }
    });
  });

  describe("Idempotency", () => {
    test("should be idempotent - running twice should result in same state", async () => {
      // Run init the first time
      await t.mutation(internal.init.default, {});
      
      // Get counts after first run
      const [universitiesCount1, programsCount1] = await t.run(async (ctx) => {
        const unis = await ctx.db.query("universities").collect();
        const progs = await ctx.db.query("programs").collect();
        return [unis.length, progs.length];
      });
      
      // Run init a second time
      await t.mutation(internal.init.default, {});
      
      // Get counts after second run
      const [universitiesCount2, programsCount2] = await t.run(async (ctx) => {
        const unis = await ctx.db.query("universities").collect();
        const progs = await ctx.db.query("programs").collect();
        return [unis.length, progs.length];
      });
      
      // Counts should be the same
      expect(universitiesCount1).toBe(universitiesCount2);
      expect(programsCount1).toBe(programsCount2);
    });
  });
});
