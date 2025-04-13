/**
 * Test script for the LLM service
 * This script tests the LLM wrapper class using mock data
 */
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
        // Simulate API calls based on the path
        if (apiPath === mockApi.userProfiles.queries.getProfile) {
            return mockUserProfile;
        }
        else if (apiPath === mockApi.programs.search.getUniversity) {
            return mockUniversity;
        }
        else if (apiPath === mockApi.programs.search.getProgram) {
            return mockProgram;
        }
        throw new Error(`Unknown API path: ${apiPath}`);
    }
};
// Mock LLMWrapper class (simplified version of the actual class)
class LLMWrapper {
    constructor(userId, universityId, programId) {
        this.userId = userId;
        this.universityId = universityId;
        this.programId = programId;
        this.userProfile = null;
        this.university = null;
        this.program = null;
    }
    async fetchData(convexClient) {
        try {
            // Fetch user profile data using userProfiles.queries.getProfile
            this.userProfile = await convexClient.query(mockApi.userProfiles.queries.getProfile);
            // Log the userId for verification
            console.log(`Fetching data for user: ${this.userId}`);
            // Fetch university data using programs.search.getUniversity
            this.university = await convexClient.query(mockApi.programs.search.getUniversity, {
                universityId: this.universityId
            });
            // Fetch program data using programs.search.getProgram
            this.program = await convexClient.query(mockApi.programs.search.getProgram, {
                programId: this.programId
            });
            return {
                userProfile: this.userProfile,
                university: this.university,
                program: this.program
            };
        }
        catch (error) {
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
    async generateLORs(recommenders) {
        if (!this.userProfile || !this.university || !this.program) {
            throw new Error("Data not fetched. Call fetchData() first.");
        }
        if (!recommenders || recommenders.length === 0) {
            throw new Error("Recommender information is required");
        }
        // Mock LOR generation
        return recommenders.map(recommender => `Letter of Recommendation for ${this.userProfile.name} from ${recommender.name} (${recommender.email}) for ${this.program.name} at ${this.university.name}...`);
    }
}
/**
 * Test the LLM wrapper class
 */
async function testLlmService() {
    try {
        console.log('Starting LLM service test...');
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
            // Test SOP generation
            console.log('\nTesting SOP generation...');
            const sop = await llmWrapper.generateSOP();
            console.log('SOP preview:', sop.substring(0, 100) + '...');
            // Test LOR generation
            console.log('\nTesting LOR generation...');
            const recommenders = [
                { name: 'Dr. John Smith', email: 'john.smith@university.edu' },
                { name: 'Prof. Jane Doe', email: 'jane.doe@university.edu' }
            ];
            const lors = await llmWrapper.generateLORs(recommenders);
            lors.forEach((lor, index) => {
                console.log(`LOR ${index + 1} preview:`, lor.substring(0, 100) + '...');
            });
        }
        else {
            console.error('\nFailed to retrieve all data.');
        }
        console.log('\nTest completed successfully!');
    }
    catch (error) {
        console.error('Test failed:', error);
    }
}
// Run the test
testLlmService();
