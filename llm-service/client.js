/**
 * Client module for the LLM microservice
 * This can be imported into the main GradAid application to interact with the LLM service
 */

/**
 * Base URL for the LLM service
 * In production, this would be the deployed URL of your microservice
 */
const LLM_SERVICE_URL = process.env.LLM_SERVICE_URL || 'http://localhost:5000';

/**
 * Generate a Statement of Purpose using the LLM service
 * 
 * @param {Object} userData - User data for SOP generation
 * @param {Object} userData.profile - User profile data
 * @param {Object} userData.university - University data
 * @param {Object} userData.program - Program data
 * @returns {Promise<Object>} - The generated SOP
 */
async function generateSOP(userData) {
  try {
    const response = await fetch(`${LLM_SERVICE_URL}/generate/sop`, {
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

    return await response.json();
  } catch (error) {
    console.error('Error generating SOP:', error);
    throw error;
  }
}

/**
 * Generate a Letter of Recommendation using the LLM service
 * 
 * @param {Object} userData - User data for LOR generation
 * @param {Object} userData.profile - User profile data
 * @param {Object} userData.university - University data
 * @param {Object} userData.program - Program data
 * @param {Object} userData.recommender - Recommender information
 * @returns {Promise<Object>} - The generated LOR
 */
async function generateLOR(userData) {
  try {
    const response = await fetch(`${LLM_SERVICE_URL}/generate/lor`, {
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

    return await response.json();
  } catch (error) {
    console.error('Error generating LOR:', error);
    throw error;
  }
}

/**
 * Review a document using the LLM service
 * 
 * @param {string} documentType - Type of document ('sop' or 'lor')
 * @param {string} content - Document content to review
 * @returns {Promise<Object>} - Feedback on the document
 */
async function reviewDocument(documentType, content) {
  try {
    const response = await fetch(`${LLM_SERVICE_URL}/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: documentType,
        content,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to review document');
    }

    return await response.json();
  } catch (error) {
    console.error('Error reviewing document:', error);
    throw error;
  }
}

/**
 * Check if the LLM service is healthy
 * 
 * @returns {Promise<Object>} - Service health information
 */
async function checkServiceHealth() {
  try {
    const response = await fetch(`${LLM_SERVICE_URL}/health`);
    
    if (!response.ok) {
      throw new Error('Service health check failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('LLM service health check failed:', error);
    return { status: 'unhealthy', error: error.message };
  }
}

module.exports = {
  generateSOP,
  generateLOR,
  reviewDocument,
  checkServiceHealth,
};
