import { convexTest } from "convex-test";
import {
  describe,
  test,
  expect,
  vi,
  beforeAll,
  afterAll,
} from "vitest";
import schema from "../schema";
import { Id } from "../_generated/dataModel";
import { api } from "../_generated/api";
import { AI_CREDITS_FOR_LOR, AI_CREDITS_FOR_SOP } from "../validators";

// Mock OpenAI
vi.mock("openai", () => {
  return {
    default: vi.fn(() => ({
      chat: {
        completions: {
          create: vi.fn().mockImplementation(async () => ({
            choices: [
              {
                message: {
                  content: "This is a mock generated content from LLM",
                },
              },
            ],
          })),
        },
      },
    })),
  };
});

describe("LLM Service", () => {
  const t = convexTest(schema);
  let testUserId: Id<"users">;
  let aiCreditsId: Id<"aiCredits">;

  const clerkId = `clerk-llm-test-${Date.now()}-${Math.random()}`;
  const asUser = t.withIdentity({ subject: clerkId });

  beforeAll(async () => {
    // Create test user and AI credits
    testUserId = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {
        name: "LLM Test User",
        email: `llm-test-${Date.now()}@example.com`,
        clerkId: clerkId,
      });

      // Add AI credits for the user
      await ctx.db.insert("aiCredits", {
        userId: userId,
        totalCredits: 1000,
        usedCredits: 0,
        resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });

      return userId;
    });
  });

  afterAll(async () => {
    // Clean up test data
    await t.run(async (ctx) => {
      // Clean up AI credit usage records
      const usageRecords = await ctx.db.query("aiCreditUsage")
        .withIndex("by_user", q => q.eq("userId", testUserId))
        .collect();
      await Promise.all(usageRecords.map(record => ctx.db.delete(record._id)));
      
      // Clean up AI credits
      const credits = await ctx.db.query("aiCredits")
        .withIndex("by_user", q => q.eq("userId", testUserId))
        .collect();
      await Promise.all(credits.map(credit => ctx.db.delete(credit._id)));

      // Clean up user
      await ctx.db.delete(testUserId);
    });
  });

  describe("generateSOP", () => {
    const mockProfile = {
      name: "Test Student",
      current_location: "San Francisco, CA",
      country_of_origin: "United States",
      native_language: "English",
      education_level: "Bachelor's",
      major: "Computer Science",
      current_university: "Test University",
      gpa: "3.8",
      gpa_scale: "4.0",
      gre_verbal: "160",
      gre_quant: "165",
      gre_aw: "4.5",
      english_test_type: "TOEFL",
      english_overall: "110",
      research_experience: "2 years in machine learning research",
      research_interests_str: "Machine Learning, AI Ethics",
      target_degree: "M.S.",
      intended_field: "Computer Science",
      career_objectives: "To become an AI researcher"
    };

    const mockProgram = {
      university: "Stanford University",
      name: "Computer Science",
      degree: "M.S.",
      department: "Engineering"
    };

    test("should generate SOP content and use AI credits", async () => {
      const content = await asUser.action(api.services.llm.generateSOP, {
        profile: mockProfile,
        program: mockProgram
      });

      // Should return the mock content from our mocked OpenAI
      expect(content).toBe("This is a mock generated content from LLM");

      // Check if credits were used
      const creditUsage = await t.run(async (ctx) => {
        return await ctx.db.query("aiCreditUsage")
          .withIndex("by_user", q => q.eq("userId", testUserId))
          .first();
      });

      expect(creditUsage).not.toBeNull();
      expect(creditUsage?.credits).toBe(AI_CREDITS_FOR_SOP);
      expect(creditUsage?.type).toBe("sop_request");
    });

    test("should throw if not authenticated", async () => {
      await expect(t.action(api.services.llm.generateSOP, {
        profile: mockProfile,
        program: mockProgram
      })).rejects.toThrow();
    });
  });

  describe("generateLOR", () => {
    const mockProfile = {
      name: "Test Student",
      current_location: "San Francisco, CA",
      country_of_origin: "United States",
      native_language: "English",
      major: "Computer Science",
      current_university: "Test University",
      gpa: "3.8",
      gpa_scale: "4.0",
      research_experience: "2 years in machine learning research",
      research_interests_str: "Machine Learning, AI Ethics",
      target_degree: "M.S.",
      intended_field: "Computer Science",
      career_objectives: "To become an AI researcher"
    };

    const mockUniversity = {
      name: "Stanford University"
    };

    const mockProgram = {
      name: "Computer Science",
      degree: "M.S.",
      department: "Engineering"
    };

    const mockRecommender = {
      name: "Dr. Jane Smith",
      email: "jsmith@testuniversity.edu"
    };

    test("should generate LOR content and use AI credits", async () => {
      const content = await asUser.action(api.services.llm.generateLOR, {
        profile: mockProfile,
        university: mockUniversity,
        program: mockProgram,
        recommender: mockRecommender
      });

      // Should return the mock content from our mocked OpenAI
      expect(content).toBe("This is a mock generated content from LLM");

      // Check if credits were used
      const creditUsage = await t.run(async (ctx) => {
        return await ctx.db.query("aiCreditUsage")
          .withIndex("by_user", q => q.eq("userId", testUserId))
          .filter(q => q.eq(q.field("type"), "lor_request"))
          .first();
      });

      expect(creditUsage).not.toBeNull();
      expect(creditUsage?.credits).toBe(AI_CREDITS_FOR_LOR);
      expect(creditUsage?.type).toBe("lor_request");
    });

    test("should throw if not authenticated", async () => {
      await expect(t.action(api.services.llm.generateLOR, {
        profile: mockProfile,
        university: mockUniversity,
        program: mockProgram,
        recommender: mockRecommender
      })).rejects.toThrow();
    });
  });
});
