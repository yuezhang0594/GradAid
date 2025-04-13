"use strict";
/**
 * Test script for the LLM service
 * This script tests the integration with Convex functions
 */
Object.defineProperty(exports, "__esModule", { value: true });
// Import the LLM API functions
const llmApi_1 = require("./llmApi");
const browser_1 = require("convex/browser");
const api_1 = require("../../convex/_generated/api");
// Wrapper functions for the LLM API
async function generateSOP(data) {
    try {
        return await llmApi_1.llmApi.generateSOP(data);
    }
    catch (error) {
        console.error('Error generating SOP:', error);
        return 'Error generating SOP: ' + (error instanceof Error ? error.message : String(error));
    }
}
async function generateLOR(data) {
    try {
        return await llmApi_1.llmApi.generateLOR(data);
    }
    catch (error) {
        console.error('Error generating LOR:', error);
        return 'Error generating LOR: ' + (error instanceof Error ? error.message : String(error));
    }
}
// Define test function
async function testLlmService() {
    console.log('Starting LLM service test...');
    try {
        // Create Convex client
        const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
        if (!convexUrl) {
            throw new Error('NEXT_PUBLIC_CONVEX_URL environment variable is not defined');
        }
        const convexClient = new browser_1.ConvexHttpClient(convexUrl);
        // Step 1: Test direct Python model integration
        console.log('\n--- Testing Direct Python Model Integration ---');
        // Create sample data for testing
        const testData = {
            profile: {
                name: 'Test User',
                educationLevel: 'Bachelor',
                major: 'Computer Science',
                gpa: 3.8,
                researchInterests: ['Machine Learning', 'Natural Language Processing']
            },
            university: {
                name: 'Test University',
                location: { city: 'San Francisco', state: 'CA' }
            },
            program: {
                name: 'Computer Science MS',
                department: 'Computer Science',
                degree: 'MS'
            }
        };
        // Test SOP generation
        console.log('Testing SOP generation...');
        const sop = await generateSOP(testData);
        console.log('SOP generation ' + (sop && !sop.startsWith('Error') ? 'successful' : 'failed'));
        if (sop && !sop.startsWith('Error')) {
            console.log('SOP preview: ' + sop.substring(0, 100) + '...');
        }
        else {
            console.log(sop);
        }
        // Test LOR generation
        console.log('\nTesting LOR generation...');
        const recommender = {
            name: 'Dr. Test Professor',
            email: 'professor@test.edu'
        };
        const lor = await generateLOR({ ...testData, recommender });
        console.log('LOR generation ' + (lor && !lor.startsWith('Error') ? 'successful' : 'failed'));
        if (lor && !lor.startsWith('Error')) {
            console.log('LOR preview: ' + lor.substring(0, 100) + '...');
        }
        else {
            console.log(lor);
        }
        // Step 2: Test Convex integration
        console.log('\n--- Testing Convex Integration ---');
        // Test fetching user profile
        console.log('Testing userProfiles.queries.getProfile...');
        try {
            const userProfile = await convexClient.query(api_1.api.userProfiles.queries.getProfile);
            console.log('User profile fetch ' + (userProfile ? 'successful' : 'failed'));
            if (userProfile) {
                console.log('User profile ID: ' + userProfile._id);
            }
        }
        catch (error) {
            console.error('Error fetching user profile:', error);
        }
        // Test program search
        console.log('\nTesting programs.search.searchPrograms...');
        try {
            const programIds = await convexClient.query(api_1.api.programs.search.searchPrograms, {
                query: 'Computer Science',
                filters: {
                    programType: 'MS'
                }
            });
            console.log('Program search ' + (programIds && programIds.length > 0 ? 'successful' : 'failed'));
            if (programIds && programIds.length > 0) {
                console.log(`Found ${programIds.length} programs`);
                // Test fetching program
                console.log('\nTesting programs.search.getProgram...');
                const programId = programIds[0];
                const program = await convexClient.query(api_1.api.programs.search.getProgram, {
                    programId
                });
                console.log('Program fetch ' + (program ? 'successful' : 'failed'));
                if (program) {
                    console.log('Program name: ' + program.name);
                    // Test fetching university
                    console.log('\nTesting programs.search.getUniversity...');
                    const universityId = program.universityId;
                    const university = await convexClient.query(api_1.api.programs.search.getUniversity, {
                        universityId
                    });
                    console.log('University fetch ' + (university ? 'successful' : 'failed'));
                    if (university) {
                        console.log('University name: ' + university.name);
                    }
                }
            }
        }
        catch (error) {
            console.error('Error with program/university tests:', error);
        }
        console.log('\nTest completed successfully!');
    }
    catch (error) {
        console.error('Test failed:', error);
    }
}
// Run the test
testLlmService();
