/**
 * LLM Service Demo
 * 
 * This file demonstrates how to use the LLM service to generate Statements of Purpose (SOPs)
 * and Letters of Recommendation (LORs) for graduate school applications.
 * 
 * The LLM service uses a combination of user profile data, university information, and program
 * details to generate personalized application documents using an AI model.
 * 
 * @author GradAid Team
 * @date April 2025
 */

import { ConvexReactClient } from "convex/react";
// Import only what we use to avoid lint errors
import { Id } from "../../convex/_generated/dataModel";
import { generateApplicationDocuments } from "../lib/llmService";

/**
 * Demo class showing different ways to use the LLM service
 */
class LlmServiceDemo {
  /**
   * Example 1: Direct usage of generateApplicationDocuments
   * 
   * This method demonstrates how to use the generateApplicationDocuments function directly
   * to generate both an SOP and LORs in a single call.
   * 
   * @param convexClient - The Convex client instance
   * @param userId - The user's ID
   * @param universityId - The target university's ID
   * @param programId - The target program's ID
   * @param recommenders - Array of recommender information
   * @returns An object containing the generated SOP and LORs
   */
  static async generateDocumentsDirectly(
    convexClient: ConvexReactClient,
    userId: Id<"users">,
    universityId: Id<"universities">,
    programId: Id<"programs">,
    recommenders: Array<{ name: string; email: string }>
  ) {
    try {
      console.log("Generating application documents directly...");
      
      // Call the generateApplicationDocuments function
      const result = await generateApplicationDocuments(
        convexClient,
        userId,
        universityId,
        programId,
        recommenders
      );
      
      console.log("Documents generated successfully!");
      console.log(`SOP length: ${result.sop.length} characters`);
      console.log(`Number of LORs generated: ${result.lors.length}`);
      
      return result;
    } catch (error) {
      console.error("Error generating documents:", error);
      throw error;
    }
  }
  
  /**
   * Example 2: Using the useGenerateDocuments hook in a React component
   * 
   * This is a code snippet showing how to use the useGenerateDocuments hook
   * in a React component. This is not a complete function but demonstrates
   * the pattern for using the hook.
   */
  static reactComponentExample() {
    // This is pseudo-code for demonstration purposes
    return `
    // Inside your React component:
    import { useConvex } from "convex/react";
    import { useGenerateDocuments } from "../lib/llmService";
    
    function ApplicationDocumentsGenerator() {
      const convex = useConvex();
      const generateDocuments = useGenerateDocuments();
      const [isLoading, setIsLoading] = useState(false);
      const [documents, setDocuments] = useState(null);
      const [error, setError] = useState(null);
      
      // Example recommenders
      const recommenders = [
        { name: "Dr. Jane Smith", email: "jane.smith@university.edu" },
        { name: "Prof. John Doe", email: "john.doe@university.edu" }
      ];
      
      const handleGenerateDocuments = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
          // Example IDs - in a real app, these would come from your application state
          const userId = "user_123" as unknown as Id<"users">;
          const universityId = "university_456" as unknown as Id<"universities">;
          const programId = "program_789" as unknown as Id<"programs">;
          
          const result = await generateDocuments(
            convex,
            userId,
            universityId,
            programId,
            recommenders
          );
          
          setDocuments(result);
        } catch (err) {
          setError(err.message || "Failed to generate documents");
        } finally {
          setIsLoading(false);
        }
      };
      
      return (
        <div>
          <button 
            onClick={handleGenerateDocuments}
            disabled={isLoading}
          >
            {isLoading ? "Generating..." : "Generate Documents"}
          </button>
          
          {error && <div className="error">{error}</div>}
          
          {documents && (
            <div>
              <h2>Statement of Purpose</h2>
              <div className="document">{documents.sop}</div>
              
              <h2>Letters of Recommendation</h2>
              {documents.lors.map((lor, index) => (
                <div key={index} className="document">
                  <h3>LOR for {recommenders[index]?.name}</h3>
                  {lor}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    `;
  }
  
  /**
   * Example 3: Advanced usage with custom data handling
   * 
   * This example demonstrates how to use the LLM service with custom data handling,
   * such as saving the generated documents to the database or processing them further.
   * 
   * @param convexClient - The Convex client instance
   * @param userId - The user's ID
   * @param universityId - The target university's ID
   * @param programId - The target program's ID
   */
  static async advancedUsageExample(
    convexClient: ConvexReactClient,
    userId: Id<"users">,
    universityId: Id<"universities">,
    programId: Id<"programs">
  ) {
    try {
      console.log("Advanced usage example...");
      
      // 1. Define recommenders
      const recommenders = [
        { name: "Dr. Jane Smith", email: "jane.smith@university.edu" },
        { name: "Prof. John Doe", email: "john.doe@university.edu" }
      ];
      
      // 2. Generate documents
      const { sop, lors } = await generateApplicationDocuments(
        convexClient,
        userId,
        universityId,
        programId,
        recommenders
      );
      
      // 3. Process the SOP (example: save to database)
      // In a real application, you would use a Convex mutation to save the document
      console.log("Saving SOP to database...");
      /* 
      await convexClient.mutation(api.documents.mutations.createDocument, {
        userId,
        universityId,
        programId,
        type: "sop",
        title: "Statement of Purpose",
        content: sop,
        lastEdited: new Date().toISOString()
      });
      */
      
      // 4. Process each LOR
      console.log("Processing LORs...");
      for (let i = 0; i < lors.length; i++) {
        const recommender = recommenders[i];
        console.log(`Processing LOR for ${recommender.name}...`);
        
        // Example: Save LOR to database
        /* 
        await convexClient.mutation(api.documents.mutations.createDocument, {
          userId,
          universityId,
          programId,
          type: "lor",
          title: `Letter of Recommendation - ${recommender.name}`,
          content: lors[i],
          recommenderName: recommender.name,
          recommenderEmail: recommender.email,
          lastEdited: new Date().toISOString()
        });
        */
        
        // Example: Send email notification to recommender
        /*
        await sendEmailNotification({
          to: recommender.email,
          subject: "Letter of Recommendation Draft",
          body: `Dear ${recommender.name},\n\nA draft Letter of Recommendation has been generated for your review. Please log in to the GradAid platform to review and edit the letter.\n\nBest regards,\nGradAid Team`
        });
        */
      }
      
      console.log("Advanced processing completed!");
      return { sop, lors };
    } catch (error) {
      console.error("Error in advanced usage example:", error);
      throw error;
    }
  }
  
  /**
   * Example 4: Error handling best practices
   * 
   * This example demonstrates best practices for error handling when using the LLM service.
   * 
   * @param convexClient - The Convex client instance
   * @param userId - The user's ID
   * @param universityId - The target university's ID
   * @param programId - The target program's ID
   */
  static async errorHandlingExample(
    convexClient: ConvexReactClient,
    userId: Id<"users">,
    universityId: Id<"universities">,
    programId: Id<"programs">
  ) {
    try {
      console.log("Error handling example...");
      
      // 1. Validate input parameters
      if (!userId || !universityId || !programId) {
        throw new Error("Missing required parameters");
      }
      
      // 2. Define recommenders with validation
      const recommenders = [
        { name: "Dr. Jane Smith", email: "jane.smith@university.edu" }
      ];
      
      // Validate recommender information
      for (const recommender of recommenders) {
        if (!recommender.name || !recommender.email) {
          throw new Error("Recommender must have both name and email");
        }
        
        // Simple email validation
        if (!recommender.email.includes('@') || !recommender.email.includes('.')) {
          throw new Error(`Invalid email format for recommender: ${recommender.name}`);
        }
      }
      
      // 3. Set up timeout and retry logic
      const maxRetries = 3;
      let retryCount = 0;
      let lastError: Error | null = null;
      
      while (retryCount < maxRetries) {
        try {
          // Attempt to generate documents with timeout
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error("Document generation timed out")), 60000);
          });
          
          const documentPromise = generateApplicationDocuments(
            convexClient,
            userId,
            universityId,
            programId,
            recommenders
          );
          
          // Race between the document generation and timeout
          const result = await Promise.race([documentPromise, timeoutPromise]) as {
            sop: string;
            lors: string[];
          };
          
          console.log("Documents generated successfully!");
          return result;
        } catch (error) {
          // Type assertion for the caught error
          const err = error as Error;
          lastError = err;
          retryCount++;
          
          // Log the retry attempt
          console.warn(`Attempt ${retryCount}/${maxRetries} failed: ${err.message}`);
          
          // Wait before retrying (exponential backoff)
          if (retryCount < maxRetries) {
            const backoffTime = Math.pow(2, retryCount) * 1000; // 2s, 4s, 8s
            console.log(`Retrying in ${backoffTime / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, backoffTime));
          }
        }
      }
      
      // If we've exhausted all retries, throw the last error
      throw new Error(`Failed after ${maxRetries} attempts. Last error: ${lastError?.message}`);
    } catch (error) {
      console.error("Error in error handling example:", error);
      
      // Type assertion to treat error as Error
      const err = error as Error;
      
      // Categorize errors for better user feedback
      if (err.message.includes("timed out")) {
        // Handle timeout errors
        console.error("The request timed out. Please try again later.");
      } else if (err.message.includes("API key")) {
        // Handle authentication errors
        console.error("API authentication error. Please check your API key configuration.");
      } else {
        // Handle other errors
        console.error("An unexpected error occurred:", err.message);
      }
      
      throw error;
    }
  }
}

/**
 * Example usage of the demo class
 * 
 * This function shows how to call the demo methods in a real application.
 * Note: This is for demonstration purposes and should not be executed directly.
 */
async function runDemo() {
  // Initialize Convex client
  const convexClient = new ConvexReactClient(process.env.CONVEX_URL as string);
  
  // Example IDs (these would be real IDs in your application)
  const userId = "user_123" as unknown as Id<"users">;
  const universityId = "university_456" as unknown as Id<"universities">;
  const programId = "program_789" as unknown as Id<"programs">;
  
  // Example recommenders
  const recommenders = [
    { name: "Dr. Jane Smith", email: "jane.smith@university.edu" },
    { name: "Prof. John Doe", email: "john.doe@university.edu" }
  ];
  
  try {
    // Example 1: Direct usage
    const directResult = await LlmServiceDemo.generateDocumentsDirectly(
      convexClient,
      userId,
      universityId,
      programId,
      recommenders
    );
    
    console.log("Direct usage result:", directResult);
    
    // Example 3: Advanced usage
    const advancedResult = await LlmServiceDemo.advancedUsageExample(
      convexClient,
      userId,
      universityId,
      programId
    );
    
    console.log("Advanced usage result:", advancedResult);
    
    // Example 4: Error handling
    const errorHandlingResult = await LlmServiceDemo.errorHandlingExample(
      convexClient,
      userId,
      universityId,
      programId
    );
    
    console.log("Error handling result:", errorHandlingResult);
  } catch (error) {
    // Type assertion for the caught error
    const err = error as Error;
    console.error("Demo execution failed:", err.message);
  }
}

// Export the demo class and example function
export { LlmServiceDemo, runDemo };
