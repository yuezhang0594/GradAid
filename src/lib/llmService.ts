import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { useQuery } from 'convex/react';

/**
 * LLMWrapper class for handling interactions with the LLM model
 * This class fetches necessary data and generates SOPs and LORs
 */
class LLMWrapper {
  private userId: Id<"users">;
  private universityId: Id<"universities">;
  private programId: Id<"programs">;
  private userProfile: any;
  private university: any;
  private program: any;

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
  }

  /**
   * Fetch all necessary data from Convex
   */
  async fetchData(convexClient: any) {
    try {
      // Fetch user profile data
      this.userProfile = await convexClient.query(api.userProfiles.queries.getProfileById, {
        userId: this.userId
      });

      // Fetch university data
      this.university = await convexClient.query(api.programs.search.getUniversity, {
        universityId: this.universityId
      });

      // Fetch program data
      this.program = await convexClient.query(api.programs.search.getProgram, {
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
  convexClient: any,
  userId: Id<"users">,
  universityId: Id<"universities">,
  programId: Id<"programs">,
  recommenders: Array<{ name: string; email: string }>
) {
  try {
    // Create an instance of the LLMWrapper
    const llmWrapper = new LLMWrapper(userId, universityId, programId);
    
    // Fetch necessary data
    await llmWrapper.fetchData(convexClient);
    
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
 * React hook to generate application documents
 */
export function useGenerateDocuments() {
  return async (
    convexClient: any,
    userId: Id<"users">,
    universityId: Id<"universities">,
    programId: Id<"programs">,
    recommenders: Array<{ name: string; email: string }>
  ) => {
    return generateApplicationDocuments(
      convexClient,
      userId,
      universityId,
      programId,
      recommenders
    );
  };
}
