import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { ConvexHttpClient } from 'convex/browser';
import { useState } from 'react';

/**
 * Get the Convex URL from environment variables
 * Prioritizes VITE_CONVEX_URL from .env.local
 */
export function getConvexUrl(): string {
  const convexUrl = import.meta.env.VITE_CONVEX_URL || process.env.VITE_CONVEX_URL;
  if (!convexUrl) {
    throw new Error('VITE_CONVEX_URL environment variable is not defined');
  }
  return convexUrl;
}

/**
 * Create a Convex client with the correct URL
 */
export function createConvexClient(): ConvexHttpClient {
  const convexUrl = getConvexUrl();
  return new ConvexHttpClient(convexUrl);
}

/**
 * LLMWrapper class for handling interactions with the LLM model
 * This class fetches necessary data and generates SOPs and LORs
 */
export class LLMWrapper {
  private userId: Id<"users">;
  private universityId: Id<"universities">;
  private programId: Id<"programs">;
  private userProfile: any;
  private university: any;
  private program: any;
  private convexClient: ConvexHttpClient;

  constructor(
    userId: Id<"users">,
    universityId: Id<"universities">,
    programId: Id<"programs">
  ) {
    this.userId = userId;
    this.universityId = universityId;
    this.programId = programId;
    this.userProfile = null;
    this.university = null;
    this.program = null;
    this.convexClient = createConvexClient();
  }

  /**
   * Fetch all necessary data from Convex
   */
  async fetchData() {
    try {
      // Fetch user profile data using userProfiles.queries.getProfile
      // Note: getProfile automatically uses the current user's ID from the session
      // If we need to use a specific userId in the future, we can pass it as an argument
      this.userProfile = await this.convexClient.query(api.userProfiles.queries.getProfile);
      
      // Log the userId for verification
      console.log(`Fetching data for user: ${this.userId}`);

      // Fetch university data using programs.search.getUniversity
      this.university = await this.convexClient.query(api.programs.search.getUniversity, {
        universityId: this.universityId
      });

      // Fetch program data using programs.search.getProgram
      this.program = await this.convexClient.query(api.programs.search.getProgram, {
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

  /**
   * Generate a Statement of Purpose using the LLM model
   */
  async generateSOP() {
    if (!this.userProfile || !this.university || !this.program) {
      throw new Error("Data not fetched. Call fetchData() first.");
    }

    try {
      // Prepare data for the LLM model
      const userData = {
        profile: this.userProfile,
        university: this.university,
        program: this.program
      };

      // Call the Python LLM model through the backend
      const response = await fetch('/api/generate-sop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate SOP');
      }

      const result = await response.json();
      return result.sop;
    } catch (error) {
      console.error("Error generating SOP:", error);
      throw error;
    }
  }

  /**
   * Generate Letters of Recommendation using the LLM model
   * @param recommenders Array of recommender information
   */
  async generateLORs(recommenders: Array<{ name: string; email: string }>) {
    if (!this.userProfile || !this.university || !this.program) {
      throw new Error("Data not fetched. Call fetchData() first.");
    }

    if (!recommenders || recommenders.length === 0) {
      throw new Error("Recommender information is required");
    }

    try {
      const lors = [];

      // Generate an LOR for each recommender
      for (const recommender of recommenders) {
        // Prepare data for the LLM model
        const userData = {
          profile: this.userProfile,
          university: this.university,
          program: this.program,
          recommender
        };

        // Call the Python LLM model through the backend
        const response = await fetch('/api/generate-lor', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to generate LOR');
        }

        const result = await response.json();
        lors.push(result.lor);
      }

      return lors;
    } catch (error) {
      console.error("Error generating LORs:", error);
      throw error;
    }
  }
}

/**
 * Function to generate application documents (SOP and LORs) using the LLM model
 * 
 * @param userId User ID
 * @param universityId University ID
 * @param programId Program ID
 * @param recommenders Array of recommender information
 * @returns Generated SOP and LORs
 */
export async function generateApplicationDocuments(
  userId: Id<"users">,
  universityId: Id<"universities">,
  programId: Id<"programs">,
  recommenders: Array<{ name: string; email: string }>
) {
  try {
    // Create an instance of the LLMWrapper
    const llmWrapper = new LLMWrapper(userId, universityId, programId);
    
    // Fetch necessary data
    await llmWrapper.fetchData();
    
    // Generate SOP
    const sop = await llmWrapper.generateSOP();
    
    // Generate LORs (up to 2)
    const validRecommenders = recommenders.slice(0, 2);
    const lors = await llmWrapper.generateLORs(validRecommenders);
    
    return {
      sop,
      lors
    };
  } catch (error) {
    console.error("Error in generateApplicationDocuments:", error);
    throw error;
  }
}

/**
 * React hook to generate Statement of Purpose
 */
export function useGenerateSOP() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [sop, setSOP] = useState<string | null>(null);

  const generateSOP = async (
    userId: Id<"users">,
    universityId: Id<"universities">,
    programId: Id<"programs">
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Create an instance of the LLMWrapper
      const llmWrapper = new LLMWrapper(userId, universityId, programId);
      
      // Fetch necessary data
      await llmWrapper.fetchData();
      
      // Generate SOP
      const generatedSOP = await llmWrapper.generateSOP();
      
      setSOP(generatedSOP);
      return generatedSOP;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generateSOP,
    isLoading,
    error,
    sop
  };
}

/**
 * React hook to generate Letters of Recommendation
 */
export function useGenerateLORs() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lors, setLORs] = useState<string[] | null>(null);

  const generateLORs = async (
    userId: Id<"users">,
    universityId: Id<"universities">,
    programId: Id<"programs">,
    recommenders: Array<{ name: string; email: string }>
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Create an instance of the LLMWrapper
      const llmWrapper = new LLMWrapper(userId, universityId, programId);
      
      // Fetch necessary data
      await llmWrapper.fetchData();
      
      // Generate LORs
      const generatedLORs = await llmWrapper.generateLORs(recommenders);
      
      setLORs(generatedLORs);
      return generatedLORs;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generateLORs,
    isLoading,
    error,
    lors
  };
}

/**
 * React hook to generate application documents
 */
export function useGenerateDocuments() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [documents, setDocuments] = useState<{
    sop: string | null;
    lors: string[] | null;
  }>({ sop: null, lors: null });

  const generateDocuments = async (
    userId: Id<"users">,
    universityId: Id<"universities">,
    programId: Id<"programs">,
    recommenders: Array<{ name: string; email: string }>
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await generateApplicationDocuments(
        userId,
        universityId,
        programId,
        recommenders
      );
      
      setDocuments(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generateDocuments,
    isLoading,
    error,
    documents
  };
}
