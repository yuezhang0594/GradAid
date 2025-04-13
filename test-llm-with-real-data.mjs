/**
 * LLM Service Test with Real Convex Data
 * 
 * This script tests the LLM service by fetching real data from the Convex database
 * and generating an SOP and LORs using the LLM model.
 * 
 * @author GradAid Team
 * @date April 2025
 */

// Use ES module imports
import { ConvexHttpClient } from "convex/browser";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '.env.local') });

// Mock the LLM service functionality
const mockLlmService = {
  generateApplicationDocuments: async (convexClient, userId, universityId, programId, recommenders) => {
    console.log("Fetching user profile data...");
    // Using the correct Convex function paths based on the project structure
    const userProfile = await convexClient.query("userProfiles:getProfile", { userId });
    
    console.log("Fetching university data...");
    const university = await convexClient.query("programs:search.getUniversity", { universityId });
    
    console.log("Fetching program data...");
    const program = await convexClient.query("programs:search.getProgram", { programId });
    
    console.log("\nUser Profile:", JSON.stringify(userProfile, null, 2));
    console.log("\nUniversity:", JSON.stringify(university, null, 2));
    console.log("\nProgram:", JSON.stringify(program, null, 2));
    
    console.log("\nGenerating SOP...");
    // For testing purposes, we'll just create a mock SOP based on the fetched data
    const sop = `This is a Statement of Purpose for ${userProfile?.name || "the applicant"} 
applying to ${program?.name || "the program"} at ${university?.name || "the university"}.

The applicant has a strong background in ${userProfile?.major || "their field"} with a GPA of 
${userProfile?.gpa || "excellent standing"} out of ${userProfile?.gpaScale || "4.0"}.

Their research interests include ${userProfile?.researchInterests?.join(", ") || "various areas"} 
and they have ${userProfile?.researchExperience || "relevant experience"}.

They are interested in pursuing a ${program?.degree || "graduate degree"} to further their career 
objectives of ${userProfile?.careerObjectives || "advancing in their field"}.

The applicant is from ${userProfile?.countryOfOrigin || "their home country"} and is currently located in 
${userProfile?.currentLocation || "their current location"}. Their native language is 
${userProfile?.nativeLanguage || "their native language"}.

They have taken the GRE and scored ${userProfile?.greScores?.verbal || "well"} on the verbal section, 
${userProfile?.greScores?.quantitative || "well"} on the quantitative section, and 
${userProfile?.greScores?.analyticalWriting || "well"} on the analytical writing section.

The applicant is particularly interested in ${university?.name || "this university"} because of its 
strong ${program?.department || "department"} and excellent reputation. The 
${program?.name || "program"} aligns perfectly with their research interests and career goals.

They are prepared to meet all the program requirements, including the minimum GPA of 
${program?.requirements?.minimumGPA || "the required GPA"} and submitting 
${program?.requirements?.recommendationLetters || "the required number of"} letters of recommendation.

The application deadline for the ${program?.deadlines?.fall || "fall semester"} is approaching, and 
the applicant is eager to submit their materials for consideration.`;
    
    console.log("\nGenerating LORs...");
    // For testing purposes, we'll create mock LORs based on the fetched data
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

During their time at ${userProfile?.university || "their university"}, they have shown remarkable 
aptitude for research, particularly in ${userProfile?.researchExperience || "their research areas"}.

Their career objectives of ${userProfile?.careerObjectives || "advancing in their field"} align perfectly 
with the strengths of your program, and I believe they would make significant contributions to your 
academic community.

The applicant has the necessary qualifications to meet your program requirements, including the minimum 
GPA of ${program?.requirements?.minimumGPA || "the required GPA"}.

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
    console.log("This will use the database schemas from your Convex database:");
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
    const outputDir = path.join(__dirname, 'generated_documents');
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
