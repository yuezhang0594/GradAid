// ES Module imports
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { generateApplicationDocuments } from './llmService.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create a Convex client
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  throw new Error('NEXT_PUBLIC_CONVEX_URL is not defined');
}
const convexClient = new ConvexHttpClient(convexUrl);

// Define recommender type
type Recommender = {
  name: string;
  email: string;
};

/**
 * Test the LLM service functionality
 */
async function testLlmService() {
  try {
    console.log('Starting LLM service test...');

    // Step 1: Get a user profile
    console.log('Fetching user profile...');
    const userProfile = await convexClient.query(api.userProfiles.queries.getProfile);
    if (!userProfile) {
      throw new Error('No user profile found. Please make sure you are logged in and have completed onboarding.');
    }
    console.log('User profile found:', userProfile._id);

    // Step 2: Get a program and university for testing
    console.log('Fetching programs...');
    const programIds = await convexClient.query(api.programs.search.searchPrograms, {
      query: 'Computer Science',
      filters: {
        programType: 'MS',
      }
    });
    
    if (!programIds || programIds.length === 0) {
      throw new Error('No programs found. Please make sure there are programs in the database.');
    }
    console.log(`Found ${programIds.length} programs`);
    
    // Get the first program
    const programId = programIds[0];
    console.log('Using program ID:', programId);
    
    // Get the program details
    const program = await convexClient.query(api.programs.search.getProgram, {
      programId
    });
    console.log('Program details:', program.name);
    
    // Get the university
    const universityId = program.universityId;
    console.log('Using university ID:', universityId);
    
    const university = await convexClient.query(api.programs.search.getUniversity, {
      universityId
    });
    console.log('University details:', university.name);

    // Step 3: Get real recommender data from the database
    console.log('Fetching recommender data...');
    
    // Try to get existing applications to find recommenders
    const applications = await convexClient.query(api.userProfiles.queries.getApplications);
    
    let recommenders: Recommender[] = [];
    
    // Check if there are any applications with LORs
    if (applications && applications.length > 0) {
      // Look for applications with LORs
      for (const application of applications) {
        if (application.lors && application.lors.length > 0) {
          // Extract recommender information from LORs
          const appRecommenders = application.lors.map(lor => ({
            name: lor.recommenderName,
            email: lor.recommenderEmail
          })).slice(0, 2); // Limit to 2 recommenders
          
          if (appRecommenders.length > 0) {
            recommenders = appRecommenders;
            console.log(`Found ${recommenders.length} real recommenders from existing applications`);
            break;
          }
        }
      }
    }
    
    // If no recommenders found, try to get them from another source or throw an error
    if (recommenders.length === 0) {
      // Try to get recommender information from the recommender table if it exists
      try {
        const recommenderData = await convexClient.query(api.programs.search.getRecommender, {
          documentId: applications[0]?.documents[0]?._id
        });
        
        if (recommenderData) {
          recommenders = [{
            name: recommenderData.name,
            email: recommenderData.email
          }];
          console.log('Found recommender from recommender table');
        }
      } catch (error) {
        console.log('No recommender data found in recommender table');
      }
    }
    
    // If still no recommenders found, throw an error
    if (recommenders.length === 0) {
      throw new Error('No recommender data found in the database. Please create at least one recommender before testing.');
    }

    // Step 4: Test document generation
    console.log('Testing document generation with real data...');

    // Generate documents
    const documents = await generateApplicationDocuments(
      convexClient,
      userProfile.userId as Id<"users">,
      universityId,
      programId,
      recommenders
    );

    // Verify results
    if (documents.sop) {
      console.log('SOP generation successful!');
      console.log('SOP preview:', documents.sop.substring(0, 100) + '...');
    } else {
      console.error('SOP generation failed');
    }

    if (documents.lors && documents.lors.length > 0) {
      console.log(`Generated ${documents.lors.length} letters of recommendation`);
      documents.lors.forEach((lor, index) => {
        console.log(`LOR ${index + 1} preview:`, lor.substring(0, 100) + '...');
      });
    } else {
      console.error('LOR generation failed');
    }

    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testLlmService();
