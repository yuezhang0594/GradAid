#!/usr/bin/env node

/**
 * Simple test script for the LLM service integration with Convex
 * This script tests the updated functions in the LLM wrapper class
 */

import { ConvexHttpClient } from 'convex/browser';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env.local
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  console.log('Loading environment variables from .env.local');
  const envLocalContent = fs.readFileSync(envLocalPath, 'utf8');
  const envVars = {};
  
  envLocalContent.split('\n').forEach(line => {
    // Skip comments and empty lines
    if (!line || line.startsWith('#')) return;
    
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim();
      // Remove quotes if present
      envVars[key.trim()] = value.replace(/^["'](.*)["']$/, '$1');
    }
  });
  
  // Set environment variables
  Object.entries(envVars).forEach(([key, value]) => {
    process.env[key] = value;
  });
}

// Create Convex client - prioritize VITE_CONVEX_URL from .env.local
const convexUrl = process.env.VITE_CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  console.error('VITE_CONVEX_URL environment variable is not defined in .env.local');
  process.exit(1);
}

console.log('Using Convex URL:', convexUrl);
const convexClient = new ConvexHttpClient(convexUrl);

/**
 * Test Convex integration using direct function names instead of references
 */
async function testConvexIntegration() {
  console.log('Starting Convex integration test...');
  
  try {
    // Test fetching user profile
    console.log('\nTesting userProfiles/queries:getProfile...');
    try {
      // Use the direct function name format that Convex expects
      const result = await convexClient.query("userProfiles/queries:getProfile");
      console.log('User profile fetch result:', result ? 'Success' : 'Failed');
    } catch (error) {
      console.error('Error fetching user profile:', error.message);
    }
    
    // Test program search
    console.log('\nTesting programs/search:searchPrograms...');
    try {
      // Use the direct function name format that Convex expects
      const result = await convexClient.query("programs/search:searchPrograms", {
        query: 'Computer Science',
        filters: {
          programType: 'MS'
        }
      });
      
      console.log('Program search result:', result ? 'Success' : 'Failed');
      
      if (result && result.length > 0) {
        console.log(`Found ${result.length} programs`);
        
        // Test fetching program
        console.log('\nTesting programs/search:getProgram...');
        const programId = result[0];
        const program = await convexClient.query("programs/search:getProgram", {
          programId
        });
        
        console.log('Program fetch result:', program ? 'Success' : 'Failed');
        
        if (program && program.universityId) {
          // Test fetching university
          console.log('\nTesting programs/search:getUniversity...');
          const universityId = program.universityId;
          const university = await convexClient.query("programs/search:getUniversity", {
            universityId
          });
          
          console.log('University fetch result:', university ? 'Success' : 'Failed');
        }
      }
    } catch (error) {
      console.error('Error with program/university tests:', error.message);
    }
    
    console.log('\nTest completed!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testConvexIntegration();
