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
import { api } from "../_generated/api";

describe("UserProfiles", () => {
  const t = convexTest(schema);
  let testUserId: Id<"users">;
  let otherUserId: Id<"users">;
  let testProfileId: Id<"userProfiles">;

  // Generate unique Clerk IDs for each test run
  const clerkId = `clerk-user-profile-test-${Date.now()}-${Math.random()}`;
  const otherClerkId = `clerk-other-profile-${Date.now()}-${Math.random()}`;
  
  // Create identities for testing
  const asUser = t.withIdentity({ subject: clerkId });
  const asOtherUser = t.withIdentity({ subject: otherClerkId });

  beforeAll(async () => {
    // Create test users
    [testUserId, otherUserId] = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {
        name: "Profile Test User",
        email: `profile-test-${Date.now()}@example.com`,
        clerkId: clerkId,
      });
      const otherId = await ctx.db.insert("users", {
        name: "Other Profile User",
        email: `other-profile-${Date.now()}@example.com`,
        clerkId: otherClerkId,
      });
      return [userId, otherId];
    });
  });

  afterAll(async () => {
    // Clean up all test data
    await t.run(async (ctx) => {
      // Delete user profiles
      const profiles = await ctx.db.query("userProfiles").collect();
      await Promise.all(profiles.map((profile) => ctx.db.delete(profile._id)));

      // Delete users
      const users = await ctx.db.query("users").collect();
      await Promise.all(users.map((user) => ctx.db.delete(user._id)));
    });
  });

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date());
    
    // Reset testProfileId before each test
    testProfileId = undefined as unknown as Id<"userProfiles">;
  });

  afterEach(async () => {
    vi.useRealTimers();
    vi.clearAllMocks();

    // Delete test profile if it exists
    if (testProfileId) {
      await t.run(async (ctx) => {
        try {
          await ctx.db.delete(testProfileId);
        } catch (e) {
          // Ignore errors if profile was already deleted
        }
      });
    }

    // Delete all userProfiles created during the test
    await t.run(async (ctx) => {
      const profiles = await ctx.db
        .query("userProfiles")
        .filter((q) => q.eq(q.field("userId"), testUserId))
        .collect();
      
      await Promise.all(profiles.map((profile) => ctx.db.delete(profile._id)));
    });
  });

  describe("Queries", () => {
    describe("getProfile", () => {
      test("should return profile when it exists", async () => {
        // Create a profile for the user
        testProfileId = await t.run(async (ctx) => {
          return await ctx.db.insert("userProfiles", {
            userId: testUserId,
            countryOfOrigin: "United States",
            dateOfBirth: "1990-01-01",
            currentLocation: "Boston, MA",
            nativeLanguage: "English",
            educationLevel: "Bachelor's",
            major: "Computer Science",
            university: "MIT",
            gpa: 3.8,
            gpaScale: 4.0,
            graduationDate: "2022-05-15",
            targetDegree: "Ph.D.",
            intendedField: "Machine Learning",
            researchInterests: ["AI", "Computer Vision"],
            careerObjectives: "Become a research scientist",
            targetLocations: ["US", "Canada"],
            expectedStartDate: "2023-09-01",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            onboardingCompleted: true,
          });
        });

        const profile = await asUser.query(api.userProfiles.queries.getProfile, {});

        expect(profile).not.toBeNull();
        expect(profile!._id).toBe(testProfileId);
        expect(profile!.userId).toBe(testUserId);
        expect(profile!.countryOfOrigin).toBe("United States");
        expect(profile!.major).toBe("Computer Science");
        expect(profile!.onboardingCompleted).toBe(true);
      });

      test("should return null when profile doesn't exist", async () => {
        const profile = await asUser.query(api.userProfiles.queries.getProfile, {});
        expect(profile).toBeNull();
      });

      test("should throw if not authenticated", async () => {
        await expect(
          t.query(api.userProfiles.queries.getProfile, {})
        ).rejects.toThrow(); // Auth error
      });
    });

    describe("checkOnboardingStatus", () => {
      test("should return 'personal-info' as currentStep when no profile exists", async () => {
        const result = await asUser.query(api.userProfiles.queries.checkOnboardingStatus, {});

        expect(result).toEqual({
          isComplete: false,
          currentStep: "personal-info",
        });
      });

      test("should return 'education' when only personal info exists", async () => {
        testProfileId = await t.run(async (ctx) => {
          return await ctx.db.insert("userProfiles", {
            userId: testUserId,
            countryOfOrigin: "United States",
            dateOfBirth: "1990-01-01",
            currentLocation: "Boston, MA",
            nativeLanguage: "English",
            // Missing education info
            educationLevel: "",
            major: "",
            university: "",
            gpa: 0,
            gpaScale: 4.0,
            graduationDate: "",
            // Missing career goals
            targetDegree: "",
            intendedField: "",
            researchInterests: [],
            careerObjectives: "",
            targetLocations: [],
            expectedStartDate: "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            onboardingCompleted: false,
          });
        });

        const result = await asUser.query(api.userProfiles.queries.checkOnboardingStatus, {});

        expect(result).toEqual({
          isComplete: false,
          currentStep: "education",
        });
      });

      test("should return 'test-scores' when personal info and education exist", async () => {
        testProfileId = await t.run(async (ctx) => {
          return await ctx.db.insert("userProfiles", {
            userId: testUserId,
            // Personal info
            countryOfOrigin: "United States",
            dateOfBirth: "1990-01-01",
            currentLocation: "Boston, MA",
            nativeLanguage: "English",
            // Education info
            educationLevel: "Bachelor's",
            major: "Computer Science",
            university: "MIT",
            gpa: 3.8,
            gpaScale: 4.0,
            graduationDate: "2022-05-15",
            // Missing test scores (optional but expect step)
            greScores: undefined,
            englishTest: undefined,
            // Missing career goals
            targetDegree: "",
            intendedField: "",
            researchInterests: [],
            careerObjectives: "",
            targetLocations: [],
            expectedStartDate: "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            onboardingCompleted: false,
          });
        });

        const result = await asUser.query(api.userProfiles.queries.checkOnboardingStatus, {});

        expect(result).toEqual({
          isComplete: false,
          currentStep: "test-scores",
        });
      });

      test("should return 'career-goals' when personal, education, and test scores exist", async () => {
        testProfileId = await t.run(async (ctx) => {
          return await ctx.db.insert("userProfiles", {
            userId: testUserId,
            // Personal info
            countryOfOrigin: "United States",
            dateOfBirth: "1990-01-01",
            currentLocation: "Boston, MA",
            nativeLanguage: "English",
            // Education info
            educationLevel: "Bachelor's",
            major: "Computer Science",
            university: "MIT",
            gpa: 3.8,
            gpaScale: 4.0,
            graduationDate: "2022-05-15",
            // Test scores
            greScores: {
              verbal: 165,
              quantitative: 170,
              analyticalWriting: 5.0,
              testDate: "2021-11-01"
            },
            // Missing career goals
            targetDegree: "",
            intendedField: "",
            researchInterests: [],
            careerObjectives: "",
            targetLocations: [],
            expectedStartDate: "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            onboardingCompleted: false,
          });
        });

        const result = await asUser.query(api.userProfiles.queries.checkOnboardingStatus, {});

        expect(result).toEqual({
          isComplete: false,
          currentStep: "career-goals",
        });
      });

      test("should return 'complete' when all required info exists", async () => {
        testProfileId = await t.run(async (ctx) => {
          return await ctx.db.insert("userProfiles", {
            userId: testUserId,
            // Personal info
            countryOfOrigin: "United States",
            dateOfBirth: "1990-01-01",
            currentLocation: "Boston, MA",
            nativeLanguage: "English",
            // Education info
            educationLevel: "Bachelor's",
            major: "Computer Science",
            university: "MIT",
            gpa: 3.8,
            gpaScale: 4.0,
            graduationDate: "2022-05-15",
            // Test scores (could be undefined but we're including)
            greScores: {
              verbal: 165,
              quantitative: 170,
              analyticalWriting: 5.0,
              testDate: "2021-11-01"
            },
            // Career goals
            targetDegree: "Ph.D.",
            intendedField: "Machine Learning",
            researchInterests: ["AI", "NLP"],
            careerObjectives: "Become a researcher",
            targetLocations: ["US", "Canada"],
            expectedStartDate: "2023-09-01",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            onboardingCompleted: true,
          });
        });

        const result = await asUser.query(api.userProfiles.queries.checkOnboardingStatus, {});

        expect(result).toEqual({
          isComplete: true,
          currentStep: "complete",
        });
      });

      test("should throw if not authenticated", async () => {
        await expect(
          t.query(api.userProfiles.queries.checkOnboardingStatus, {})
        ).rejects.toThrow(); // Auth error
      });
    });
  });

  describe("Mutations", () => {
    describe("savePersonalInfo", () => {
      const personalInfo = {
        countryOfOrigin: "Canada",
        dateOfBirth: "1995-03-15",
        currentLocation: "Toronto, ON",
        nativeLanguage: "French",
      };

      test("should create new profile when none exists", async () => {
        const result = await asUser.mutation(
          api.userProfiles.mutations.savePersonalInfo,
          personalInfo
        );

        expect(result).toEqual({ currentStep: "education" });

        // Verify profile was created
        const profile = await t.run(async (ctx) => {
          return await ctx.db
            .query("userProfiles")
            .filter((q) => q.eq(q.field("userId"), testUserId))
            .first();
        });

        expect(profile).not.toBeNull();
        expect(profile!.countryOfOrigin).toBe(personalInfo.countryOfOrigin);
        expect(profile!.dateOfBirth).toBe(personalInfo.dateOfBirth);
        expect(profile!.currentLocation).toBe(personalInfo.currentLocation);
        expect(profile!.nativeLanguage).toBe(personalInfo.nativeLanguage);
        expect(profile!.onboardingCompleted).toBe(false);
      });

      test("should update existing profile when one exists", async () => {
        // Create an initial profile
        testProfileId = await t.run(async (ctx) => {
          return await ctx.db.insert("userProfiles", {
            userId: testUserId,
            countryOfOrigin: "United States",
            dateOfBirth: "1990-01-01",
            currentLocation: "Boston, MA",
            nativeLanguage: "English",
            educationLevel: "Bachelor's",
            major: "Computer Science",
            university: "MIT",
            gpa: 3.8,
            gpaScale: 4.0,
            graduationDate: "2022-05-15",
            targetDegree: "Ph.D.",
            intendedField: "Machine Learning",
            researchInterests: ["AI"],
            careerObjectives: "Research",
            targetLocations: ["US"],
            expectedStartDate: "2023-09-01",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            onboardingCompleted: false,
          });
        });

        // Update personal info
        const result = await asUser.mutation(
          api.userProfiles.mutations.savePersonalInfo,
          personalInfo
        );

        expect(result).toEqual({ currentStep: "education" });

        // Verify profile was updated
        const profile = await t.run(async (ctx) => {
          return await ctx.db.get(testProfileId);
        });
        expect(profile).not.toBeNull();
        expect(profile!.countryOfOrigin).toBe(personalInfo.countryOfOrigin);
        expect(profile!.dateOfBirth).toBe(personalInfo.dateOfBirth);
        expect(profile!.currentLocation).toBe(personalInfo.currentLocation);
        expect(profile!.nativeLanguage).toBe(personalInfo.nativeLanguage);
        // Should not change other fields
        expect(profile!.educationLevel).toBe("Bachelor's");
        expect(profile!.major).toBe("Computer Science");
      });

      test("should throw if not authenticated", async () => {
        await expect(
          t.mutation(api.userProfiles.mutations.savePersonalInfo, personalInfo)
        ).rejects.toThrow(); // Auth error
      });
    });

    describe("saveEducation", () => {
      const educationInfo = {
        educationLevel: "Master's",
        major: "Data Science",
        university: "Stanford University",
        gpa: 3.9,
        gpaScale: 4.0,
        graduationDate: "2022-06-01",
        researchExperience: "Worked on ML research project",
      };

      test("should update profile with education info", async () => {
        // First create a profile with personal info
        testProfileId = await t.run(async (ctx) => {
          return await ctx.db.insert("userProfiles", {
            userId: testUserId,
            countryOfOrigin: "United States",
            dateOfBirth: "1990-01-01",
            currentLocation: "Boston, MA",
            nativeLanguage: "English",
            // Default values for required fields
            educationLevel: "",
            major: "",
            university: "",
            gpa: 0,
            gpaScale: 4.0,
            graduationDate: "",
            targetDegree: "",
            intendedField: "",
            researchInterests: [],
            careerObjectives: "",
            targetLocations: [],
            expectedStartDate: "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            onboardingCompleted: false,
          });
        });

        const result = await asUser.mutation(
          api.userProfiles.mutations.saveEducation,
          educationInfo
        );

        expect(result).toEqual({ currentStep: "test-scores" });

        // Verify profile was updated
        const profile = await t.run(async (ctx) => {
          return await ctx.db.get(testProfileId);
        });

        expect(profile).not.toBeNull();
        expect(profile!.educationLevel).toBe(educationInfo.educationLevel);
        expect(profile!.major).toBe(educationInfo.major);
        expect(profile!.university).toBe(educationInfo.university);
        expect(profile!.gpa).toBe(educationInfo.gpa);
        expect(profile!.gpaScale).toBe(educationInfo.gpaScale);
        expect(profile!.graduationDate).toBe(educationInfo.graduationDate);
        expect(profile!.researchExperience).toBe(educationInfo.researchExperience);
      });

      test("should throw if profile doesn't exist", async () => {
        await expect(
          asUser.mutation(api.userProfiles.mutations.saveEducation, educationInfo)
        ).rejects.toThrow("Personal information must be saved first");
      });

      test("should throw if not authenticated", async () => {
        await expect(
          t.mutation(api.userProfiles.mutations.saveEducation, educationInfo)
        ).rejects.toThrow(); // Auth error
      });
    });

    describe("saveTestScores", () => {
      const testScores = {
        greScores: {
          verbal: 168,
          quantitative: 170,
          analyticalWriting: 5.5,
          testDate: "2022-01-15",
        },
        englishTest: {
          type: "TOEFL" as const,
          overallScore: 112,
          sectionScores: {
            reading: 29,
            listening: 28,
            speaking: 27,
            writing: 28,
          },
          testDate: "2022-02-01",
        },
      };

      test("should update profile with test scores", async () => {
        // First create a profile with personal and education info
        testProfileId = await t.run(async (ctx) => {
          return await ctx.db.insert("userProfiles", {
            userId: testUserId,
            countryOfOrigin: "United States",
            dateOfBirth: "1990-01-01",
            currentLocation: "Boston, MA",
            nativeLanguage: "English",
            educationLevel: "Bachelor's",
            major: "Computer Science",
            university: "MIT",
            gpa: 3.8,
            gpaScale: 4.0,
            graduationDate: "2022-05-15",
            targetDegree: "",
            intendedField: "",
            researchInterests: [],
            careerObjectives: "",
            targetLocations: [],
            expectedStartDate: "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            onboardingCompleted: false,
          });
        });

        const result = await asUser.mutation(
          api.userProfiles.mutations.saveTestScores,
          testScores
        );

        expect(result).toEqual({ currentStep: "career-goals" });

        // Verify profile was updated
        const profile = await t.run(async (ctx) => {
          return await ctx.db.get(testProfileId);
        });
        expect(profile).not.toBeNull();
        expect(profile!.greScores).toEqual(testScores.greScores);
        expect(profile!.englishTest).toEqual(testScores.englishTest);
      });

      test("should handle saving partial test score data", async () => {
        // First create a profile with personal and education info
        testProfileId = await t.run(async (ctx) => {
          return await ctx.db.insert("userProfiles", {
            userId: testUserId,
            countryOfOrigin: "United States",
            dateOfBirth: "1990-01-01",
            currentLocation: "Boston, MA",
            nativeLanguage: "English",
            educationLevel: "Bachelor's",
            major: "Computer Science",
            university: "MIT",
            gpa: 3.8,
            gpaScale: 4.0,
            graduationDate: "2022-05-15",
            targetDegree: "",
            intendedField: "",
            researchInterests: [],
            careerObjectives: "",
            targetLocations: [],
            expectedStartDate: "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            onboardingCompleted: false,
          });
        });

        // Only provide GRE scores
        const partialScores = {
          greScores: {
            verbal: 165,
            quantitative: 167,
            analyticalWriting: 5.0,
            testDate: "2022-01-10",
          },
        };

        const result = await asUser.mutation(
          api.userProfiles.mutations.saveTestScores,
          partialScores
        );

        expect(result).toEqual({ currentStep: "career-goals" });

        // Verify profile was updated
        const profile = await t.run(async (ctx) => {
          return await ctx.db.get(testProfileId);
        });

        expect(profile).not.toBeNull();
        expect(profile!.greScores).toEqual(partialScores.greScores);
        expect(profile!.englishTest).toBeUndefined();
      });

      test("should throw if profile doesn't exist", async () => {
        await expect(
          asUser.mutation(api.userProfiles.mutations.saveTestScores, testScores)
        ).rejects.toThrow("Personal information must be saved first");
      });

      test("should throw if not authenticated", async () => {
        await expect(
          t.mutation(api.userProfiles.mutations.saveTestScores, testScores)
        ).rejects.toThrow(); // Auth error
      });
    });

    describe("saveCareerGoals", () => {
      const careerGoals = {
        targetDegree: "Ph.D.",
        intendedField: "Artificial Intelligence",
        researchInterests: ["Deep Learning", "Natural Language Processing"],
        careerObjectives: "Become a leading researcher in AI",
        targetLocations: ["United States", "United Kingdom", "Canada"],
        expectedStartDate: "2023-09-01",
        budgetRange: "$30,000 - $50,000 per year",
      };

      test("should update profile with career goals and complete onboarding", async () => {
        // First create a profile with personal, education, and test info
        testProfileId = await t.run(async (ctx) => {
          return await ctx.db.insert("userProfiles", {
            userId: testUserId,
            countryOfOrigin: "United States",
            dateOfBirth: "1990-01-01",
            currentLocation: "Boston, MA",
            nativeLanguage: "English",
            educationLevel: "Bachelor's",
            major: "Computer Science",
            university: "MIT",
            gpa: 3.8,
            gpaScale: 4.0,
            graduationDate: "2022-05-15",
            greScores: {
              verbal: 165,
              quantitative: 170,
              analyticalWriting: 5.0,
              testDate: "2021-11-01"
            },
            targetDegree: "",
            intendedField: "",
            researchInterests: [],
            careerObjectives: "",
            targetLocations: [],
            expectedStartDate: "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            onboardingCompleted: false,
          });
        });

        const result = await asUser.mutation(
          api.userProfiles.mutations.saveCareerGoals,
          careerGoals
        );

        expect(result).toEqual({ currentStep: "complete" });

        // Verify profile was updated
        const profile = await t.run(async (ctx) => {
          return await ctx.db.get(testProfileId);
        });

        expect(profile).not.toBeNull();
        expect(profile!.targetDegree).toBe(careerGoals.targetDegree);
        expect(profile!.intendedField).toBe(careerGoals.intendedField);
        expect(profile!.researchInterests).toEqual(careerGoals.researchInterests);
        expect(profile!.careerObjectives).toBe(careerGoals.careerObjectives);
        expect(profile!.targetLocations).toEqual(careerGoals.targetLocations);
        expect(profile!.expectedStartDate).toBe(careerGoals.expectedStartDate);
        expect(profile!.budgetRange).toBe(careerGoals.budgetRange);
        expect(profile!.onboardingCompleted).toBe(true);
      });

      test("should handle career goals without optional budget range", async () => {
        // First create a profile with personal, education, and test info
        testProfileId = await t.run(async (ctx) => {
          return await ctx.db.insert("userProfiles", {
            userId: testUserId,
            countryOfOrigin: "United States",
            dateOfBirth: "1990-01-01",
            currentLocation: "Boston, MA",
            nativeLanguage: "English",
            educationLevel: "Bachelor's",
            major: "Computer Science",
            university: "MIT",
            gpa: 3.8,
            gpaScale: 4.0,
            graduationDate: "2022-05-15",
            greScores: {
              verbal: 165,
              quantitative: 170,
              analyticalWriting: 5.0,
              testDate: "2021-11-01"
            },
            targetDegree: "",
            intendedField: "",
            researchInterests: [],
            careerObjectives: "",
            targetLocations: [],
            expectedStartDate: "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            onboardingCompleted: false,
          });
        });

        // Career goals without budget range
        const partialCareerGoals = {
          targetDegree: "Ph.D.",
          intendedField: "AI",
          researchInterests: ["ML"],
          careerObjectives: "Research",
          targetLocations: ["US"],
          expectedStartDate: "2023-09-01",
        };

        const result = await asUser.mutation(
          api.userProfiles.mutations.saveCareerGoals,
          partialCareerGoals
        );

        expect(result).toEqual({ currentStep: "complete" });

        // Verify profile was updated
        const profile = await t.run(async (ctx) => {
          return await ctx.db.get(testProfileId);
        });

        expect(profile).not.toBeNull();
        expect(profile!.targetDegree).toBe(partialCareerGoals.targetDegree);
        expect(profile!.budgetRange).toBeUndefined();
        expect(profile!.onboardingCompleted).toBe(true);
      });

      test("should throw if profile doesn't exist", async () => {
        await expect(
          asUser.mutation(api.userProfiles.mutations.saveCareerGoals, careerGoals)
        ).rejects.toThrow("Personal information must be saved first");
      });

      test("should throw if not authenticated", async () => {
        await expect(
          t.mutation(api.userProfiles.mutations.saveCareerGoals, careerGoals)
        ).rejects.toThrow(); // Auth error
      });
    });
  });

  describe("Full Onboarding Flow", () => {
    test("should allow completing the entire profile flow", async () => {
      // Step 1: Save personal info
      await asUser.mutation(
        api.userProfiles.mutations.savePersonalInfo,
        {
          countryOfOrigin: "Germany",
          dateOfBirth: "1992-08-20",
          currentLocation: "Berlin",
          nativeLanguage: "German",
        }
      );

      // Check onboarding status - should be at education step
      let status = await asUser.query(api.userProfiles.queries.checkOnboardingStatus, {});
      expect(status.currentStep).toBe("education");
      expect(status.isComplete).toBe(false);

      // Step 2: Save education info
      await asUser.mutation(
        api.userProfiles.mutations.saveEducation,
        {
          educationLevel: "Bachelor's",
          major: "Physics",
          university: "Technical University of Berlin",
          gpa: 1.3, // German grade system
          gpaScale: 1.0, // German grade system (1.0 is the best)
          graduationDate: "2021-07-15",
          researchExperience: "Quantum computing research lab assistant",
        }
      );

      // Check onboarding status - should be at test scores step
      status = await asUser.query(api.userProfiles.queries.checkOnboardingStatus, {});
      expect(status.currentStep).toBe("test-scores");
      expect(status.isComplete).toBe(false);

      // Step 3: Save test scores
      await asUser.mutation(
        api.userProfiles.mutations.saveTestScores,
        {
          greScores: {
            verbal: 162,
            quantitative: 169,
            analyticalWriting: 4.5,
            testDate: "2022-03-10",
          },
          englishTest: {
            type: "TOEFL" as const,
            overallScore: 105,
            sectionScores: {
              reading: 28,
              listening: 27,
              speaking: 25,
              writing: 25,
            },
            testDate: "2022-02-15",
          },
        }
      );

      // Check onboarding status - should be at career goals step
      status = await asUser.query(api.userProfiles.queries.checkOnboardingStatus, {});
      expect(status.currentStep).toBe("career-goals");
      expect(status.isComplete).toBe(false);

      // Step 4: Save career goals and complete onboarding
      await asUser.mutation(
        api.userProfiles.mutations.saveCareerGoals,
        {
          targetDegree: "Ph.D.",
          intendedField: "Quantum Computing",
          researchInterests: ["Quantum Algorithms", "Quantum Machine Learning"],
          careerObjectives: "Lead quantum computing research group",
          targetLocations: ["US", "Germany", "Switzerland"],
          expectedStartDate: "2023-09-01",
          budgetRange: "€20,000 - €30,000 per year",
        }
      );

      // Check final onboarding status - should be complete
      status = await asUser.query(api.userProfiles.queries.checkOnboardingStatus, {});
      expect(status.currentStep).toBe("complete");
      expect(status.isComplete).toBe(true);

      // Get the complete profile
      const profile = await asUser.query(api.userProfiles.queries.getProfile, {});
      
      expect(profile).not.toBeNull();
      expect(profile!.countryOfOrigin).toBe("Germany");
      expect(profile!.university).toBe("Technical University of Berlin");
      expect(profile!.greScores?.quantitative).toBe(169);
      expect(profile!.englishTest?.type).toBe("TOEFL");
      expect(profile!.intendedField).toBe("Quantum Computing");
      expect(profile!.onboardingCompleted).toBe(true);
    });
  });
});
