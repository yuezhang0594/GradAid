import React, { useState } from 'react';
import { useConvex } from 'convex/react';
import { Id } from '../../../convex/_generated/dataModel';
import { generateApplicationDocuments } from '../../lib/llmService';

interface GenerateDocumentsProps {
  userId: Id<"users">;
  universityId: Id<"universities">;
  programId: Id<"programs">;
  onComplete?: (documents: { sop: string; lors: string[] }) => void;
  onError?: (error: Error) => void;
}

interface Recommender {
  name: string;
  email: string;
}

/**
 * Component for generating application documents (SOP and LORs) using the LLM model
 */
export function GenerateDocuments({
  userId,
  universityId,
  programId,
  onComplete,
  onError
}: GenerateDocumentsProps) {
  const convex = useConvex();
  const [isLoading, setIsLoading] = useState(false);
  const [recommenders, setRecommenders] = useState<Recommender[]>([
    { name: '', email: '' },
    { name: '', email: '' }
  ]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Handle recommender input changes
  const handleRecommenderChange = (index: number, field: keyof Recommender, value: string) => {
    const updatedRecommenders = [...recommenders];
    updatedRecommenders[index] = {
      ...updatedRecommenders[index],
      [field]: value
    };
    setRecommenders(updatedRecommenders);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    // Validate recommender information
    const validRecommenders = recommenders.filter(r => r.name && r.email);
    if (validRecommenders.length === 0) {
      setError('At least one recommender is required');
      setIsLoading(false);
      return;
    }

    try {
      // Generate the documents
      const documents = await generateApplicationDocuments(
        convex,
        userId,
        universityId,
        programId,
        validRecommenders
      );

      // Call the onComplete callback if provided
      if (onComplete) {
        onComplete(documents);
      }

      setSuccess(true);
    } catch (err: any) {
      console.error('Error generating documents:', err);
      setError(err.message || 'Failed to generate documents');
      
      // Call the onError callback if provided
      if (onError) {
        onError(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Generate Application Documents</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Documents generated successfully!
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Recommender Information</h3>
          <p className="text-sm text-gray-600 mb-4">
            Please provide information for up to 2 recommenders. We'll generate Letters of Recommendation from their perspective.
          </p>
          
          {recommenders.map((recommender, index) => (
            <div key={index} className="mb-4 p-3 border rounded">
              <h4 className="font-medium mb-2">Recommender {index + 1}</h4>
              
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={recommender.name}
                  onChange={(e) => handleRecommenderChange(index, 'name', e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Dr. Jane Doe"
                  required={index === 0}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={recommender.email}
                  onChange={(e) => handleRecommenderChange(index, 'email', e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="jane.doe@university.edu"
                  required={index === 0}
                />
              </div>
            </div>
          ))}
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 px-4 rounded font-medium ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isLoading ? 'Generating...' : 'Generate Documents'}
        </button>
      </form>
    </div>
  );
}
