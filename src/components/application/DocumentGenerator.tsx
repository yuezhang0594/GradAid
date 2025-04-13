import React, { useState } from 'react';
import { useGenerateSOP, useGenerateLORs } from '../../lib/llmService';
import { Id } from '../../../convex/_generated/dataModel';

interface DocumentGeneratorProps {
  userId: Id<"users">;
  universityId: Id<"universities">;
  programId: Id<"programs">;
}

/**
 * Component for generating application documents (SOP and LORs)
 */
export default function DocumentGenerator({ userId, universityId, programId }: DocumentGeneratorProps) {
  // State for recommenders
  const [recommenders, setRecommenders] = useState<Array<{ name: string; email: string }>>([
    { name: '', email: '' }
  ]);

  // Use the individual hooks for SOP and LOR generation
  const { 
    generateSOP, 
    isLoading: isLoadingSOP, 
    error: sopError, 
    sop 
  } = useGenerateSOP();

  const { 
    generateLORs, 
    isLoading: isLoadingLORs, 
    error: lorsError, 
    lors 
  } = useGenerateLORs();

  // Add a new recommender field
  const addRecommender = () => {
    if (recommenders.length < 3) {
      setRecommenders([...recommenders, { name: '', email: '' }]);
    }
  };

  // Update recommender information
  const updateRecommender = (index: number, field: 'name' | 'email', value: string) => {
    const updatedRecommenders = [...recommenders];
    updatedRecommenders[index][field] = value;
    setRecommenders(updatedRecommenders);
  };

  // Remove a recommender
  const removeRecommender = (index: number) => {
    if (recommenders.length > 1) {
      const updatedRecommenders = recommenders.filter((_, i) => i !== index);
      setRecommenders(updatedRecommenders);
    }
  };

  // Handle SOP generation
  const handleGenerateSOP = async () => {
    try {
      await generateSOP(userId, universityId, programId);
    } catch (error) {
      console.error("Failed to generate SOP:", error);
    }
  };

  // Handle LOR generation
  const handleGenerateLORs = async () => {
    // Filter out incomplete recommender entries
    const validRecommenders = recommenders.filter(r => r.name && r.email);
    
    if (validRecommenders.length === 0) {
      alert("Please add at least one recommender with name and email.");
      return;
    }
    
    try {
      await generateLORs(userId, universityId, programId, validRecommenders);
    } catch (error) {
      console.error("Failed to generate LORs:", error);
    }
  };

  // Generate both documents
  const handleGenerateAll = async () => {
    try {
      await handleGenerateSOP();
      await handleGenerateLORs();
    } catch (error) {
      console.error("Failed to generate documents:", error);
    }
  };

  return (
    <div className="document-generator">
      <h2>Generate Application Documents</h2>
      
      {/* Recommender Information */}
      <div className="recommenders-section">
        <h3>Recommender Information</h3>
        {recommenders.map((recommender, index) => (
          <div key={index} className="recommender-form">
            <div className="form-group">
              <label htmlFor={`recommender-name-${index}`}>Name:</label>
              <input
                id={`recommender-name-${index}`}
                type="text"
                value={recommender.name}
                onChange={(e) => updateRecommender(index, 'name', e.target.value)}
                placeholder="Dr. Jane Smith"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor={`recommender-email-${index}`}>Email:</label>
              <input
                id={`recommender-email-${index}`}
                type="email"
                value={recommender.email}
                onChange={(e) => updateRecommender(index, 'email', e.target.value)}
                placeholder="jsmith@university.edu"
              />
            </div>
            
            {recommenders.length > 1 && (
              <button 
                type="button" 
                className="remove-button"
                onClick={() => removeRecommender(index)}
              >
                Remove
              </button>
            )}
          </div>
        ))}
        
        {recommenders.length < 3 && (
          <button 
            type="button" 
            className="add-button"
            onClick={addRecommender}
          >
            Add Another Recommender
          </button>
        )}
      </div>
      
      {/* Generate Buttons */}
      <div className="generate-buttons">
        <button
          type="button"
          className="generate-sop-button"
          onClick={handleGenerateSOP}
          disabled={isLoadingSOP}
        >
          {isLoadingSOP ? 'Generating SOP...' : 'Generate SOP Only'}
        </button>
        
        <button
          type="button"
          className="generate-lors-button"
          onClick={handleGenerateLORs}
          disabled={isLoadingLORs}
        >
          {isLoadingLORs ? 'Generating LORs...' : 'Generate LORs Only'}
        </button>
        
        <button
          type="button"
          className="generate-all-button"
          onClick={handleGenerateAll}
          disabled={isLoadingSOP || isLoadingLORs}
        >
          {isLoadingSOP || isLoadingLORs ? 'Generating...' : 'Generate All Documents'}
        </button>
      </div>
      
      {/* Error Messages */}
      {sopError && (
        <div className="error-message">
          <h4>SOP Generation Error:</h4>
          <p>{sopError.message}</p>
        </div>
      )}
      
      {lorsError && (
        <div className="error-message">
          <h4>LOR Generation Error:</h4>
          <p>{lorsError.message}</p>
        </div>
      )}
      
      {/* Results */}
      <div className="results-section">
        {/* SOP Preview */}
        {sop && (
          <div className="sop-preview">
            <h3>Statement of Purpose</h3>
            <div className="document-preview">
              {sop}
            </div>
            <button 
              type="button" 
              className="download-button"
              onClick={() => {
                const blob = new Blob([sop], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'Statement_of_Purpose.txt';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }}
            >
              Download SOP
            </button>
          </div>
        )}
        
        {/* LORs Preview */}
        {lors && lors.length > 0 && (
          <div className="lors-preview">
            <h3>Letters of Recommendation</h3>
            {lors.map((lor, index) => (
              <div key={index} className="lor-item">
                <h4>Letter of Recommendation {index + 1}</h4>
                <div className="document-preview">
                  {lor}
                </div>
                <button 
                  type="button" 
                  className="download-button"
                  onClick={() => {
                    const blob = new Blob([lor], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `Letter_of_Recommendation_${index + 1}.txt`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }}
                >
                  Download LOR {index + 1}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
