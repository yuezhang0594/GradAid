/**
 * Mock test for the LLM wrapper class
 * This script tests the functionality of the LLM wrapper class with mock Convex data
 */

// Import the LLM wrapper class
import { LLMWrapper } from './llmService.js';

// Mock Convex client and data
const mockUserProfile = {
  _id: "user123",
  userId: "auth123",
  name: "John Doe",
  countryOfOrigin: "United States",
  dateOfBirth: "1998-05-15",
  currentLocation: "San Francisco, CA",
  nativeLanguage: "English",
  educationLevel: "Bachelor",
  major: "Computer Science",
  university: "Stanford University",
  gpa: 3.8,
  gpaScale: 4.0,
  graduationDate: "2024-05-15",
  greScores: {
    verbal: 165,
    quantitative: 168,
    analyticalWriting: 5.0
  },
  englishTest: {
    type: "TOEFL",
    score: 110
  },
  targetDegree: "MS",
  intendedField: "Computer Science",
  researchInterests: ["Machine Learning", "Natural Language Processing"],
  careerObjectives: "AI/ML research with practical applications focus",
  targetLocations: ["California", "Massachusetts", "New York"],
  expectedStartDate: "2024-09-01"
};

const mockUniversity = {
  _id: "univ456",
  name: "University of California, Berkeley",
  location: {
    city: "Berkeley",
    state: "CA",
    country: "United States"
  },
  ranking: 4,
  type: "public"
};

const mockProgram = {
  _id: "prog789",
  name: "Master of Science in Computer Science",
  degree: "MS",
  department: "Computer Science",
  universityId: "univ456",
  requirements: {
    gre: true,
    toefl: true,
    minimumGPA: 3.5,
    recommendationLetters: 3
  },
  deadlines: {
    fall: "2024-12-15",
    spring: "2024-09-15"
  },
  website: "https://cs.berkeley.edu/grad"
};

// Mock Convex client
const mockConvexClient = {
  query: async (apiPath, args) => {
    // Simulate API calls
    if (typeof apiPath === 'object' && apiPath.path) {
      const path = apiPath.path;
      if (path === 'userProfiles/queries:getProfile') {
        return mockUserProfile;
      } else if (path === 'programs/search:getUniversity') {
        return mockUniversity;
      } else if (path === 'programs/search:getProgram') {
        return mockProgram;
      }
    } else {
      // Handle the case where apiPath is the actual API object
      const pathStr = String(apiPath);
      if (pathStr.includes('userProfiles.queries.getProfile')) {
        return mockUserProfile;
      } else if (pathStr.includes('programs.search.getUniversity')) {
        return mockUniversity;
      } else if (pathStr.includes('programs.search.getProgram')) {
        return mockProgram;
      }
    }
    throw new Error(`Unknown API path: ${apiPath}`);
  }
};

// Run the test
async function runTest() {
  try {
    console.log('Testing LLM wrapper class with mock data...');
    
    // Create an instance of the LLM wrapper
    const llmWrapper = new LLMWrapper("auth123", "univ456", "prog789");
    
    // Test fetchData method
    console.log('\nTesting fetchData method...');
    const data = await llmWrapper.fetchData(mockConvexClient);
    
    // Verify the data
    console.log('User profile:', data.userProfile ? 'Retrieved' : 'Not retrieved');
    console.log('University:', data.university ? 'Retrieved' : 'Not retrieved');
    console.log('Program:', data.program ? 'Retrieved' : 'Not retrieved');
    
    if (data.userProfile && data.university && data.program) {
      console.log('\nAll data retrieved successfully!');
      console.log('User profile name:', data.userProfile.name);
      console.log('University name:', data.university.name);
      console.log('Program name:', data.program.name);
    } else {
      console.error('\nFailed to retrieve all data.');
    }
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

runTest();
