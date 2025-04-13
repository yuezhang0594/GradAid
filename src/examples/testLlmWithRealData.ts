/**
 * LLM Service Test with Real Convex Data
 * 
 * This script tests the LLM service by fetching real data from the Convex database
 * and generating an SOP and LORs using the LLM model.
 * 
 * @author GradAid Team
 * @date April 2025
 */

// Use require instead of import to avoid ESM module resolution issues
const { ConvexHttpClient } = require("convex/browser");
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { generateApplicationDocuments } = require("../lib/llmService");

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

/**
 * Main test function that fetches data and generates documents
 */
async function testLlmWithRealData() {
  try {
    console.log("=== LLM Service Test with Real Convex Data ===");
    
    // Initialize Convex client
    const convexUrl = process.env.VITE_CONVEX_URL;
    if (!convexUrl) {
      throw new Error("VITE_CONVEX_URL environment variable is not set");
    }
    
    console.log(`Connecting to Convex at: ${convexUrl}`);
    // Use ConvexHttpClient instead of ConvexReactClient for non-React environments
    const convexClient = new ConvexHttpClient(convexUrl);
    
    // Using the real IDs provided by the user
    const userId = 'k973jewf57h9sk1qmeyj25as717dhrgk';
    const universityId = 'k17c437hx8qt3vj3avzpt52w857dgaea';
    const programId = 'jx74z330xc4qfh7pg2hsmtsgqh7dgzw6';
    
    console.log("Using the following IDs for testing:");
    console.log(`- User ID: ${userId}`);
    console.log(`- University ID: ${universityId}`);
    console.log(`- Program ID: ${programId}`);
    
    // Example recommenders
    const recommenders = [
      { name: "Dr. Jane Smith", email: "jane.smith@university.edu" },
      { name: "Prof. John Doe", email: "john.doe@university.edu" }
    ];
    
    console.log("\nFetching data and generating documents...");
    console.log("This will use the following database schemas:");
    console.log(`
userProfiles: {
  budgetRange: string,
  careerObjectives: string,
  countryOfOrigin: string,
  createdAt: string,
  currentLocation: string,
  dateOfBirth: string,
  educationLevel: string,
  expectedStartDate: string,
  gpa: float64,
  gpaScale: float64,
  graduationDate: string,
  greScores: {
    analyticalWriting: float64,
    quantitative: float64,
    testDate: string,
    verbal: float64,
  },
  intendedField: string,
  major: string,
  nativeLanguage: string,
  onboardingCompleted: boolean,
  researchExperience: string,
  researchInterests: array(string),
  targetDegree: string,
  targetLocations: array(string),
  university: string,
  updatedAt: string,
  userId: id("users"),
}

universities: {
  imageUrl: string,
  location: {
    city: string,
    country: string,
    state: string,
  },
  name: string,
  ranking: float64,
  website: string,
}

programs: {
  deadlines: {
    fall: string,
    spring: optional(string),
  },
  degree: string,
  department: string,
  name: string,
  requirements: {
    gre: boolean,
    minimumGPA: float64,
    recommendationLetters: float64,
    toefl: boolean,
  },
  universityId: id("universities"),
  website: string,
}
`);
    
    // Generate documents
    const result = await generateApplicationDocuments(
      convexClient,
      userId,
      universityId,
      programId,
      recommenders
    );
    
    console.log("\n=== Generation Successful! ===");
    
    // Save the results to files for easier viewing
    const outputDir = path.join(process.cwd(), 'generated_documents');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
    
    // Save SOP
    const sopPath = path.join(outputDir, 'statement_of_purpose.txt');
    fs.writeFileSync(sopPath, result.sop);
    console.log(`SOP saved to: ${sopPath}`);
    
    // Print a preview of the SOP
    console.log("\n=== SOP Preview (first 300 characters) ===");
    console.log(result.sop.substring(0, 300) + "...");
    
    // Save LORs
    for (let i = 0; i < result.lors.length; i++) {
      const recommender = recommenders[i];
      const lorPath = path.join(outputDir, `lor_${i + 1}_${recommender.name.replace(/\s+/g, '_')}.txt`);
      fs.writeFileSync(lorPath, result.lors[i]);
      console.log(`LOR for ${recommender.name} saved to: ${lorPath}`);
      
      // Print a preview of each LOR
      console.log(`\n=== LOR for ${recommender.name} Preview (first 300 characters) ===`);
      console.log(result.lors[i].substring(0, 300) + "...");
    }
    
    console.log("\n=== Test Completed Successfully ===");
    return result;
  } catch (error) {
    // Type assertion for the caught error
    const err = error;
    console.error("Test failed with error:", err.message);
    console.error("Error stack:", err.stack);
    throw error;
  }
}

// Run the test
testLlmWithRealData()
  .then(() => {
    console.log("Test completed successfully");
    process.exit(0);
  })
  .catch(error => {
    console.error("Test failed:", error);
    process.exit(1);
  });
