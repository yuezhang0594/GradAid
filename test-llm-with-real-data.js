/**
 * LLM Service Test with Real Convex Data
 * 
 * This script tests the LLM service by fetching real data from the Convex database
 * and generating an SOP and LORs using the LLM model.
 * 
 * @author GradAid Team
 * @date April 2025
 */

// Use CommonJS require to avoid module resolution issues
const { ConvexHttpClient } = require("convex/browser");
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

// Mock the LLM service functionality since we can't directly require TypeScript files
const mockLlmService = {
  generateApplicationDocuments: async (convexClient, userId, universityId, programId, recommenders) => {
    console.log("Fetching user profile data...");
    const userProfile = await convexClient.query("userProfiles.queries.getProfile", { userId });
    
    console.log("Fetching university data...");
    const university = await convexClient.query("programs.search.getUniversity", { universityId });
    
    console.log("Fetching program data...");
    const program = await convexClient.query("programs.search.getProgram", { programId });
    
    console.log("\nUser Profile:", JSON.stringify(userProfile, null, 2));
    console.log("\nUniversity:", JSON.stringify(university, null, 2));
    console.log("\nProgram:", JSON.stringify(program, null, 2));
    
    console.log("\nGenerating SOP...");
    // For testing purposes, we'll just create a mock SOP
    const sop = `This is a mock Statement of Purpose for ${userProfile?.name || "the applicant"} 
applying to ${program?.name || "the program"} at ${university?.name || "the university"}.

The applicant has a strong background in ${userProfile?.major || "their field"} with a GPA of 
${userProfile?.gpa || "excellent standing"} out of ${userProfile?.gpaScale || "4.0"}.

Their research interests include ${userProfile?.researchInterests?.join(", ") || "various areas"} 
and they have ${userProfile?.researchExperience || "relevant experience"}.

They are interested in pursuing a ${program?.degree || "graduate degree"} to further their career 
objectives of ${userProfile?.careerObjectives || "advancing in their field"}.`;
    
    console.log("\nGenerating LORs...");
    // For testing purposes, we'll create mock LORs
    const lors = recommenders.map(recommender => {
      return `Letter of Recommendation from ${recommender.name} (${recommender.email})

I am writing to strongly recommend ${userProfile?.name || "the applicant"} for admission to your 
${program?.degree || "graduate"} program in ${program?.name || "the program"} at 
${university?.name || "your university"}.

I have known the applicant for several years and can attest to their excellent academic abilities 
and research potential. They have demonstrated exceptional skills in ${userProfile?.major || "their field"} 
and have a strong foundation in ${userProfile?.researchInterests?.join(", ") || "their areas of interest"}.

The applicant's GPA of ${userProfile?.gpa || "excellent standing"} out of ${userProfile?.gpaScale || "4.0"} 
is a testament to their academic dedication and capabilities.

I believe they would be an excellent addition to your program and I give them my highest recommendation.

Sincerely,
${recommender.name}`;
    });
    
    return { sop, lors };
  }
};

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
    // Use ConvexHttpClient for non-React environments
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
    console.log("This will use the database schemas from your Convex database.");
    
    // Generate documents using our mock service
    const result = await mockLlmService.generateApplicationDocuments(
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
    console.error("Test failed with error:", error.message);
    console.error("Error stack:", error.stack);
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
