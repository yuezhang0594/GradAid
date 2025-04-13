/**
 * LLM Service Test with Mock Data
 * 
 * This script tests the LLM service using mock data that matches the structure
 * of the data from the Convex database.
 * 
 * @author GradAid Team
 * @date April 2025
 */

// Import required modules
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock data based on the Convex database schema
const mockData = {
  userProfile: {
    name: "Alex Johnson",
    countryOfOrigin: "United States",
    dateOfBirth: "1998-05-15",
    currentLocation: "Boston, MA",
    nativeLanguage: "English",
    university: "Massachusetts Institute of Technology",
    major: "Computer Science",
    gpa: 3.8,
    gpaScale: 4.0,
    graduationDate: "May 2024",
    greScores: {
      verbal: 165,
      quantitative: 168,
      analyticalWriting: 5.0,
      testDate: "2023-06-10"
    },
    researchExperience: "2 years of research experience in machine learning and natural language processing, focusing on transformer models and their applications in healthcare.",
    researchInterests: ["Machine Learning", "Natural Language Processing", "Computer Vision"],
    careerObjectives: "To pursue a career in AI/ML research with a focus on developing practical applications that can benefit society.",
    targetDegree: "MS",
    targetLocations: ["California", "Massachusetts", "New York"],
    budgetRange: "$30,000-$50,000"
  },
  university: {
    name: "Stanford University",
    location: {
      city: "Stanford",
      state: "California",
      country: "United States"
    },
    ranking: 2,
    website: "https://www.stanford.edu",
    imageUrl: "https://example.com/stanford.jpg"
  },
  program: {
    name: "Computer Science MS",
    degree: "MS",
    department: "Computer Science",
    website: "https://cs.stanford.edu/academics/masters",
    deadlines: {
      fall: "December 1, 2024",
      spring: "September 15, 2024"
    },
    requirements: {
      gre: true,
      toefl: true,
      minimumGPA: 3.5,
      recommendationLetters: 3
    },
    universityId: "k17c437hx8qt3vj3avzpt52w857dgaea"
  }
};

/**
 * Mock implementation of the LLM model to generate a Statement of Purpose
 */
function generateSOP(userProfile, university, program) {
  return new Promise((resolve) => {
    console.log("Generating Statement of Purpose...");
    
    // Create a mock SOP based on the user profile, university, and program data
    const sop = `Statement of Purpose
${userProfile.name}
Application for ${program.degree} in ${program.name} at ${university.name}

Dear Admissions Committee,

I am writing to express my sincere interest in the ${program.degree} program in ${program.name} at ${university.name}. With a strong background in ${userProfile.major} from ${userProfile.university} and a GPA of ${userProfile.gpa}/${userProfile.gpaScale}, I am confident in my ability to excel in your program.

My research interests in ${userProfile.researchInterests.join(", ")} align perfectly with the strengths of your department. During my undergraduate studies, I gained ${userProfile.researchExperience}

My career objectives are ${userProfile.careerObjectives} I believe that the ${program.name} program at ${university.name}, with its renowned faculty and cutting-edge research facilities, would provide me with the ideal environment to achieve these goals.

I am particularly drawn to ${university.name} because of its strong ${program.department} department and its location in ${university.location.city}, ${university.location.state}. The university's ranking of #${university.ranking} in the nation further confirms its excellence in academic and research pursuits.

I understand that the application deadline for the fall semester is ${program.deadlines.fall}, and I am prepared to submit all required materials, including ${program.requirements.recommendationLetters} letters of recommendation, before this date.

I am excited about the possibility of joining the vibrant academic community at ${university.name} and contributing to the ongoing research in the ${program.department} department.

Thank you for considering my application.

Sincerely,
${userProfile.name}`;

    resolve(sop);
  });
}

/**
 * Mock implementation of the LLM model to generate Letters of Recommendation
 */
function generateLORs(userProfile, university, program, recommenders) {
  return new Promise((resolve) => {
    console.log("Generating Letters of Recommendation...");
    
    // Create mock LORs for each recommender
    const lors = recommenders.map(recommender => {
      return `Letter of Recommendation
From: ${recommender.name} (${recommender.email})
For: ${userProfile.name}
Program: ${program.degree} in ${program.name} at ${university.name}

Dear Admissions Committee,

I am writing to strongly recommend ${userProfile.name} for admission to your ${program.degree} program in ${program.name} at ${university.name}.

I have known ${userProfile.name} for several years as their professor/mentor at ${userProfile.university}. During this time, I have been consistently impressed by their academic abilities, research skills, and personal qualities.

${userProfile.name} has demonstrated exceptional aptitude in ${userProfile.major}, maintaining a GPA of ${userProfile.gpa}/${userProfile.gpaScale} throughout their studies. Their performance in my courses has been outstanding, and they have shown a deep understanding of complex concepts in ${userProfile.researchInterests.join(", ")}.

Their research experience in ${userProfile.researchExperience} has prepared them well for graduate studies. They have shown remarkable initiative, creativity, and analytical thinking in their research projects.

${userProfile.name}'s career objectives of ${userProfile.careerObjectives} align perfectly with the strengths of your program. I believe they would make significant contributions to your academic community and research endeavors.

In conclusion, I give ${userProfile.name} my highest recommendation for admission to your program. They possess the academic abilities, research potential, and personal qualities necessary for success in graduate studies.

Please feel free to contact me if you require any further information.

Sincerely,
${recommender.name}
${recommender.email}`;
    });
    
    resolve(lors);
  });
}

/**
 * Main function to test the LLM service with mock data
 */
async function testLlmWithMockData() {
  try {
    console.log("=== LLM Service Test with Mock Data ===");
    
    // Example recommenders
    const recommenders = [
      { name: "Dr. Jane Smith", email: "jane.smith@university.edu" },
      { name: "Prof. John Doe", email: "john.doe@university.edu" }
    ];
    
    console.log("\nUser Profile:", JSON.stringify(mockData.userProfile, null, 2));
    console.log("\nUniversity:", JSON.stringify(mockData.university, null, 2));
    console.log("\nProgram:", JSON.stringify(mockData.program, null, 2));
    
    // Generate SOP
    console.log("\nGenerating SOP...");
    const sop = await generateSOP(mockData.userProfile, mockData.university, mockData.program);
    
    // Generate LORs
    console.log("\nGenerating LORs...");
    const lors = await generateLORs(mockData.userProfile, mockData.university, mockData.program, recommenders);
    
    console.log("\n=== Generation Successful! ===");
    
    // Save the results to files for easier viewing
    const outputDir = path.join(__dirname, 'generated_documents');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
    
    // Save SOP
    const sopPath = path.join(outputDir, 'statement_of_purpose.txt');
    fs.writeFileSync(sopPath, sop);
    console.log(`SOP saved to: ${sopPath}`);
    
    // Print a preview of the SOP
    console.log("\n=== SOP Preview (first 300 characters) ===");
    console.log(sop.substring(0, 300) + "...");
    
    // Save LORs
    for (let i = 0; i < lors.length; i++) {
      const recommender = recommenders[i];
      const lorPath = path.join(outputDir, `lor_${i + 1}_${recommender.name.replace(/\s+/g, '_')}.txt`);
      fs.writeFileSync(lorPath, lors[i]);
      console.log(`LOR for ${recommender.name} saved to: ${lorPath}`);
      
      // Print a preview of each LOR
      console.log(`\n=== LOR for ${recommender.name} Preview (first 300 characters) ===`);
      console.log(lors[i].substring(0, 300) + "...");
    }
    
    console.log("\n=== Test Completed Successfully ===");
    
    // Now let's try to call the Python LLM model if available
    console.log("\n=== Attempting to call Python LLM Model ===");
    try {
      const pythonProcess = spawn('python3', ['llm-service/model.py', '--test']);
      
      pythonProcess.stdout.on('data', (data) => {
        console.log(`Python Model Output: ${data}`);
      });
      
      pythonProcess.stderr.on('data', (data) => {
        console.error(`Python Model Error: ${data}`);
      });
      
      pythonProcess.on('close', (code) => {
        console.log(`Python process exited with code ${code}`);
      });
    } catch (error) {
      console.log("Could not call Python LLM model:", error.message);
      console.log("This is expected if the Python environment is not set up correctly.");
    }
    
    return { sop, lors };
  } catch (error) {
    console.error("Test failed with error:", error.message);
    console.error("Error stack:", error.stack);
    throw error;
  }
}

// Run the test
testLlmWithMockData()
  .then(() => {
    console.log("Test completed successfully");
    process.exit(0);
  })
  .catch(error => {
    console.error("Test failed:", error);
    process.exit(1);
  });
