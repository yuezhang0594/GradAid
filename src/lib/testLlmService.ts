/**
 * Test script for the LLM service
 * This script tests the LLM wrapper class using mock data
 */

// Define mock types to avoid importing from Convex
type MockId<T extends string> = string & { __type: T };

// Mock the necessary types
interface MockUserProfile {
  _id: MockId<"userProfiles">;
  userId: MockId<"users">;
  name: string;
  countryOfOrigin: string;
  dateOfBirth: string;
  currentLocation: string;
  nativeLanguage: string;
  educationLevel: string;
  major: string;
  university: string;
  gpa: number;
  gpaScale: number;
  graduationDate: string;
  greScores?: {
    verbal: number;
    quantitative: number;
    analyticalWriting: number;
  };
  englishTest?: {
    type: string;
    score: number;
  };
  targetDegree: string;
  intendedField: string;
  researchInterests: string[];
  careerObjectives: string;
  targetLocations: string[];
  expectedStartDate: string;
}

interface MockUniversity {
  _id: MockId<"universities">;
  name: string;
  location: {
    city: string;
    state: string;
    country: string;
  };
  ranking: number;
  type: string;
}

interface MockProgram {
  _id: MockId<"programs">;
  name: string;
  degree: string;
  department: string;
  universityId: MockId<"universities">;
  requirements: {
    gre: boolean;
    toefl: boolean;
    minimumGPA: number;
    recommendationLetters: number;
  };
  deadlines: {
    fall: string;
    spring?: string;
  };
  website: string;
}

// Mock the Convex API
const mockApi = {
  userProfiles: {
    queries: {
      getProfile: 'userProfiles.queries.getProfile'
    }
  },
  programs: {
    search: {
      getUniversity: 'programs.search.getUniversity',
      getProgram: 'programs.search.getProgram'
    }
  }
};

// Mock data
const mockUserProfile: MockUserProfile = {
  _id: "user123" as MockId<"userProfiles">,
  userId: "auth123" as MockId<"users">,
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

const mockUniversity: MockUniversity = {
  _id: "univ456" as MockId<"universities">,
  name: "University of California, Berkeley",
  location: {
    city: "Berkeley",
    state: "CA",
    country: "United States"
  },
  ranking: 4,
  type: "public"
};

const mockProgram: MockProgram = {
  _id: "prog789" as MockId<"programs">,
  name: "Master of Science in Computer Science",
  degree: "MS",
  department: "Computer Science",
  universityId: "univ456" as MockId<"universities">,
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

// Mock environment variables
(global as any).import = {
  meta: {
    env: {
      VITE_CONVEX_URL: 'https://dynamic-horse-288.convex.cloud'
    }
  }
};

// Mock ConvexHttpClient
class MockConvexHttpClient {
  query(apiPath: string, args?: any) {
    // Simulate API calls based on the path
    if (apiPath === mockApi.userProfiles.queries.getProfile || 
        String(apiPath).includes('userProfiles.queries.getProfile')) {
      return Promise.resolve(mockUserProfile);
    } else if (apiPath === mockApi.programs.search.getUniversity || 
               String(apiPath).includes('programs.search.getUniversity')) {
      return Promise.resolve(mockUniversity);
    } else if (apiPath === mockApi.programs.search.getProgram || 
               String(apiPath).includes('programs.search.getProgram')) {
      return Promise.resolve(mockProgram);
    }
    return Promise.reject(new Error(`Unknown API path: ${apiPath}`));
  }
}

// Mock the getConvexUrl and createConvexClient functions
function getConvexUrl(): string {
  return 'https://dynamic-horse-288.convex.cloud';
}

function createConvexClient(): any {
  return new MockConvexHttpClient();
}

// Mock LLMWrapper class (simplified version of the actual class)
class LLMWrapper {
  private userId: MockId<"users">;
  private universityId: MockId<"universities">;
  private programId: MockId<"programs">;
  private userProfile: any;
  private university: any;
  private program: any;
  private convexClient: any;

  constructor(
    userId: MockId<"users">,
    universityId: MockId<"universities">,
    programId: MockId<"programs">
  ) {
    this.userId = userId;
    this.universityId = universityId;
    this.programId = programId;
    this.userProfile = null;
    this.university = null;
    this.program = null;
    this.convexClient = createConvexClient();
  }

  async fetchData() {
    try {
      // Fetch user profile data using userProfiles.queries.getProfile
      this.userProfile = await this.convexClient.query(mockApi.userProfiles.queries.getProfile);
      
      // Log the userId for verification
      console.log(`Fetching data for user: ${this.userId}`);

      // Fetch university data using programs.search.getUniversity
      this.university = await this.convexClient.query(mockApi.programs.search.getUniversity, {
        universityId: this.universityId
      });

      // Fetch program data using programs.search.getProgram
      this.program = await this.convexClient.query(mockApi.programs.search.getProgram, {
        programId: this.programId
      });

      return {
        userProfile: this.userProfile,
        university: this.university,
        program: this.program
      };
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
  }

  async generateSOP() {
    if (!this.userProfile || !this.university || !this.program) {
      throw new Error("Data not fetched. Call fetchData() first.");
    }

    // Mock SOP generation
    return `Statement of Purpose for ${this.userProfile.name} applying to ${this.program.name} at ${this.university.name}...`;
  }

  async generateLORs(recommenders: Array<{ name: string; email: string }>) {
    if (!this.userProfile || !this.university || !this.program) {
      throw new Error("Data not fetched. Call fetchData() first.");
    }

    if (!recommenders || recommenders.length === 0) {
      throw new Error("Recommender information is required");
    }

    // Mock LOR generation
    return recommenders.map(recommender => 
      `Letter of Recommendation for ${this.userProfile.name} from ${recommender.name} (${recommender.email}) for ${this.program.name} at ${this.university.name}...`
    );
  }
}

// Define recommender type
type Recommender = {
  name: string;
  email: string;
};

/**
 * Test the LLM wrapper class
 */
async function testLlmService() {
  try {
    console.log('Starting LLM service test...');
    
    // Create an instance of the LLM wrapper
    const llmWrapper = new LLMWrapper(
      "auth123" as MockId<"users">,
      "univ456" as MockId<"universities">,
      "prog789" as MockId<"programs">
    );
    
    // Test fetchData method
    console.log('\nTesting fetchData method...');
    const data = await llmWrapper.fetchData();
    
    // Verify the data
    console.log('User profile:', data.userProfile ? 'Retrieved' : 'Not retrieved');
    console.log('University:', data.university ? 'Retrieved' : 'Not retrieved');
    console.log('Program:', data.program ? 'Retrieved' : 'Not retrieved');
    
    if (data.userProfile && data.university && data.program) {
      console.log('\nAll data retrieved successfully!');
      console.log('User profile name:', data.userProfile.name);
      console.log('University name:', data.university.name);
      console.log('Program name:', data.program.name);
      
      // Test SOP generation
      console.log('\nTesting SOP generation...');
      const sop = await llmWrapper.generateSOP();
      console.log('SOP preview:', sop.substring(0, 100) + '...');
      
      // Test LOR generation
      console.log('\nTesting LOR generation...');
      const recommenders: Recommender[] = [
        { name: 'Dr. John Smith', email: 'john.smith@university.edu' },
        { name: 'Prof. Jane Doe', email: 'jane.doe@university.edu' }
      ];
      const lors = await llmWrapper.generateLORs(recommenders);
      lors.forEach((lor, index) => {
        console.log(`LOR ${index + 1} preview:`, lor.substring(0, 100) + '...');
      });
    } else {
      console.error('\nFailed to retrieve all data.');
    }
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testLlmService();
