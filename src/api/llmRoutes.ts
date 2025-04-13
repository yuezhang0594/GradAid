import { llmApi } from './llmApi';

/**
 * Handler for the generate-sop API endpoint
 * 
 * @param req Request object
 * @param res Response object
 */
export async function handleGenerateSOP(req: any, res: any) {
  try {
    const data = req.body;
    
    // Validate input data
    if (!data || !data.profile || !data.university || !data.program) {
      return res.status(400).json({ error: 'Missing required data fields' });
    }
    
    // Generate SOP using the LLM model
    const sop = await llmApi.generateSOP(data);
    
    // Return the generated SOP
    return res.status(200).json({ success: true, sop });
  } catch (error: any) {
    console.error('Error generating SOP:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate SOP' });
  }
}

/**
 * Handler for the generate-lor API endpoint
 * 
 * @param req Request object
 * @param res Response object
 */
export async function handleGenerateLOR(req: any, res: any) {
  try {
    const data = req.body;
    
    // Validate input data
    if (!data || !data.profile || !data.university || !data.program || !data.recommender) {
      return res.status(400).json({ error: 'Missing required data fields' });
    }
    
    // Generate LOR using the LLM model
    const lor = await llmApi.generateLOR(data);
    
    // Return the generated LOR
    return res.status(200).json({ success: true, lor });
  } catch (error: any) {
    console.error('Error generating LOR:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate LOR' });
  }
}

// Export a function to register the routes with an Express app
export function registerLLMRoutes(app: any) {
  app.post('/api/generate-sop', handleGenerateSOP);
  app.post('/api/generate-lor', handleGenerateLOR);
}
