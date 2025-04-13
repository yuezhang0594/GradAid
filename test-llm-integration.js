#!/usr/bin/env node

/**
 * Simple test script for the LLM service integration with Convex
 * This script tests the updated functions in the LLM wrapper class
 */

import { ConvexHttpClient } from 'convex/browser';
import dotenv from 'dotenv';
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

// Create Convex client
const convexUrl = process.env.VITE_CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  console.error('VITE_CONVEX_URL or NEXT_PUBLIC_CONVEX_URL environment variable is not defined');
  process.exit(1);
}

console.log('Using Convex URL:', convexUrl);
const convexClient = new ConvexHttpClient(convexUrl);

/**
 * Test Convex integration
 */
async function testConvexIntegration() {
  console.log('Starting Convex integration test...');
  
  try {
    // Test fetching user profile
    console.log('\nTesting userProfiles.queries.getProfile...');
    try {
      const userProfile = await convexClient.query({ path: 'userProfiles/queries:getProfile' });
      console.log('User profile fetch ' + (userProfile ? 'successful' : 'failed'));
      if (userProfile) {
        console.log('User profile ID: ' + userProfile._id);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
    
    // Test program search
    console.log('\nTesting programs/search:searchPrograms...');
    try {
      const programIds = await convexClient.query({ 
        path: 'programs/search:searchPrograms',
        args: {
          query: 'Computer Science',
          filters: {
            programType: 'MS'
          }
        }
      });
      
      console.log('Program search ' + (programIds && programIds.length > 0 ? 'successful' : 'failed'));
      if (programIds && programIds.length > 0) {
        console.log(`Found ${programIds.length} programs`);
        
        // Test fetching program
        console.log('\nTesting programs/search:getProgram...');
        const programId = programIds[0];
        const program = await convexClient.query({
          path: 'programs/search:getProgram',
          args: { programId }
        });
        
        console.log('Program fetch ' + (program ? 'successful' : 'failed'));
        if (program) {
          console.log('Program name: ' + program.name);
          
          // Test fetching university
          console.log('\nTesting programs/search:getUniversity...');
          const universityId = program.universityId;
          const university = await convexClient.query({
            path: 'programs/search:getUniversity',
            args: { universityId }
          });
          
          console.log('University fetch ' + (university ? 'successful' : 'failed'));
          if (university) {
            console.log('University name: ' + university.name);
          }
        }
      }
    } catch (error) {
      console.error('Error with program/university tests:', error);
    }
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testConvexIntegration();
