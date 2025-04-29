import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock dependencies
vi.mock('convex/react', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useAction: vi.fn(),
  useConvex: vi.fn()
}));

vi.mock('#/_generated/api', () => ({
  api: {
    aiCredits: {
      queries: {
        getAiCreditsRemaining: 'aiCredits.queries.getAiCreditsRemaining'
      }
    },
    userProfiles: {
      queries: {
        getProfile: 'userProfiles.queries.getProfile',
        getUserName: 'userProfiles.queries.getUserName'
      }
    },
    documents: {
      queries: {
        getDocumentById: 'documents.queries.getDocumentById',
        getRecommender: 'documents.queries.getRecommender'
      },
      mutations: {
        saveDocumentDraft: 'documents.mutations.saveDocumentDraft',
        updateDocumentStatus: 'documents.mutations.updateDocumentStatus'
      }
    },
    applications: {
      queries: {
        getApplicationDetails: 'applications.queries.getApplicationDetails'
      }
    },
    services: {
      llm: {
        generateSOP: 'services.llm.generateSOP',
        generateLOR: 'services.llm.generateLOR'
      }
    }
  }
}));

vi.mock('#/validators', () => ({
  AI_CREDITS_FOR_SOP: 5,
  AI_CREDITS_FOR_LOR: 3
}));

// Mock toast notifications
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Import after mocking
import { useGenerateStatementOfPurpose, useGenerateLetterOfRecommendation } from '../useLLM';
import { useQuery, useMutation, useAction, useConvex } from 'convex/react';
import { toast } from 'sonner';
import { Id } from '#/_generated/dataModel';
import { AI_CREDITS_FOR_SOP, AI_CREDITS_FOR_LOR } from '#/validators';

// Define a type for the mocked function
type MockedFunction = ReturnType<typeof vi.fn>;

describe('useLLM Hook', () => {
  // Mock data
  const mockApplicationId = 'app1' as unknown as Id<"applications">;
  const mockDocumentId = 'doc1' as unknown as Id<"applicationDocuments">;
  
  const mockUserProfile = {
    _id: 'profile1',
    _creationTime: 1234567890,
    userId: 'user1',
    currentLocation: 'New York',
    countryOfOrigin: 'United States',
    nativeLanguage: 'English',
    educationLevel: 'Bachelor',
    major: 'Computer Science',
    university: 'MIT',
    gpa: 3.9,
    gpaScale: 4.0,
    greScores: {
      verbal: 165,
      quantitative: 170,
      analyticalWriting: 5.0
    },
    englishTest: {
      type: 'TOEFL',
      overallScore: 110,
      sectionScores: {},
      testDate: '2024-01-15'
    },
    researchExperience: '2 years of research in machine learning',
    researchInterests: ['AI', 'Machine Learning', 'Computer Vision'],
    targetDegree: 'PhD',
    intendedField: 'Computer Science',
    careerObjectives: 'Research scientist in AI'
  };
  
  const mockApplicationDetails = {
    _id: mockApplicationId,
    university: 'Stanford University',
    program: 'Computer Science',
    degree: 'PhD',
    department: 'Computer Science Department',
    documents: [
      {
        _id: mockDocumentId,
        type: 'sop',
        title: 'Statement of Purpose',
        content: '',
        status: 'not_started'
      }
    ]
  };
  
  const mockRecommender = {
    _id: 'rec1',
    name: 'Dr. John Smith',
    email: 'john.smith@example.com',
    title: 'Professor',
    institution: 'MIT',
    relationship: 'Research Advisor'
  };
  
  // Mock functions
  const mockGenerateSOP = vi.fn();
  const mockGenerateLOR = vi.fn();
  const mockSaveDocumentDraft = vi.fn();
  const mockUpdateDocumentStatus = vi.fn();
  const mockConvexQuery = vi.fn();
  const mockConvexMutation = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock useQuery
    (useQuery as MockedFunction).mockImplementation((query) => {
      if (query === 'aiCredits.queries.getAiCreditsRemaining') {
        return 10; // Mock 10 AI credits remaining
      } else if (query === 'userProfiles.queries.getProfile') {
        return mockUserProfile;
      } else if (query === 'userProfiles.queries.getUserName') {
        return 'John Doe';
      } else if (query === 'documents.queries.getDocumentById') {
        return {
          _id: mockDocumentId,
          type: 'lor',
          title: 'Letter of Recommendation',
          content: '',
          status: 'not_started'
        };
      }
      return undefined;
    });
    
    // Mock useAction
    (useAction as MockedFunction).mockImplementation((action) => {
      if (action === 'services.llm.generateSOP') {
        return mockGenerateSOP;
      } else if (action === 'services.llm.generateLOR') {
        return mockGenerateLOR;
      }
      return vi.fn();
    });
    
    // Mock useMutation
    (useMutation as MockedFunction).mockImplementation((mutation) => {
      if (mutation === 'documents.mutations.saveDocumentDraft') {
        return mockSaveDocumentDraft;
      } else if (mutation === 'documents.mutations.updateDocumentStatus') {
        return mockUpdateDocumentStatus; // Return our mock for updateDocumentStatus
      }
      return vi.fn();
    });
    
    // Mock useConvex
    (useConvex as MockedFunction).mockReturnValue({
      query: mockConvexQuery,
      mutation: mockConvexMutation
    });
    
    // Set up successful responses
    mockGenerateSOP.mockResolvedValue('Generated Statement of Purpose content');
    mockGenerateLOR.mockResolvedValue('Generated Letter of Recommendation content');
    mockSaveDocumentDraft.mockResolvedValue(true);
    mockUpdateDocumentStatus.mockResolvedValue(true);
    mockConvexQuery.mockImplementation((query) => {
      if (query === 'applications.queries.getApplicationDetails') {
        return Promise.resolve(mockApplicationDetails);
      } else if (query === 'documents.queries.getRecommender') {
        return Promise.resolve(mockRecommender);
      }
      return Promise.resolve(undefined);
    });
    mockConvexMutation.mockResolvedValue(true);
  });
  
  describe('useGenerateStatementOfPurpose', () => {
    it('should generate SOP successfully', async () => {
      const { result } = renderHook(() => useGenerateStatementOfPurpose());
      
      let sopContent;
      await act(async () => {
        sopContent = await result.current(mockApplicationId);
      });
      
      // Check if generateSOP was called with correct data
      expect(mockGenerateSOP).toHaveBeenCalledWith({
        profile: expect.objectContaining({
          name: 'John Doe',
          current_location: 'New York',
          major: 'Computer Science'
        }),
        program: expect.objectContaining({
          university: 'Stanford University',
          name: 'Computer Science',
          degree: 'PhD',
          department: 'Computer Science Department'
        })
      });
      
      // Check if saveDocumentDraft was called with correct arguments
      expect(mockSaveDocumentDraft).toHaveBeenCalledWith({
        applicationDocumentId: mockDocumentId,
        content: 'Generated Statement of Purpose content'
      });
      
      // Check if updateDocumentStatus was called with correct arguments
      expect(mockUpdateDocumentStatus).toHaveBeenCalledWith({
        documentId: mockDocumentId,
        status: 'draft'
      });
      
      // Check if toast.success was called
      expect(toast.success).toHaveBeenCalledWith('Success', {
        description: 'Statement of Purpose generated successfully!'
      });
      
      // Check if SOP content is returned
      expect(sopContent).toBe('Generated Statement of Purpose content');
    });
    
    it('should handle insufficient AI credits for SOP', async () => {
      // Mock insufficient AI credits
      (useQuery as MockedFunction).mockImplementation((query) => {
        if (query === 'aiCredits.queries.getAiCreditsRemaining') {
          return 3; // Not enough credits for SOP (requires 5)
        } else if (query === 'userProfiles.queries.getProfile') {
          return mockUserProfile;
        } else if (query === 'userProfiles.queries.getUserName') {
          return 'John Doe';
        }
        return undefined;
      });
      
      const { result } = renderHook(() => useGenerateStatementOfPurpose());
      
      let sopContent;
      await act(async () => {
        sopContent = await result.current(mockApplicationId);
      });
      
      // Check if toast.error was called
      expect(toast.error).toHaveBeenCalledWith('Insufficient AI Credits', {
        description: 'You have 3 AI credits left. It takes 5 credits to generate a Statement of Purpose.'
      });
      
      // Check if generateSOP was not called
      expect(mockGenerateSOP).not.toHaveBeenCalled();
      
      // Check if sopContent is null
      expect(sopContent).toBeNull();
    });
    
    it('should handle missing application details', async () => {
      // Mock missing application details
      mockConvexQuery.mockImplementation((query) => {
        if (query === 'applications.queries.getApplicationDetails') {
          return Promise.resolve(null);
        }
        return Promise.resolve(undefined);
      });
      
      const { result } = renderHook(() => useGenerateStatementOfPurpose());
      
      let sopContent;
      await act(async () => {
        sopContent = await result.current(mockApplicationId);
      });
      
      // Check if toast.error was called
      expect(toast.error).toHaveBeenCalledWith('Application not found', {
        description: 'Could not find the application for SOP generation.'
      });
      
      // Check if generateSOP was not called
      expect(mockGenerateSOP).not.toHaveBeenCalled();
      
      // Check if sopContent is null
      expect(sopContent).toBeNull();
    });
    
    it('should handle errors during SOP generation', async () => {
      // Mock generateSOP to throw an error
      mockGenerateSOP.mockRejectedValueOnce(new Error('Failed to generate SOP'));
      
      const { result } = renderHook(() => useGenerateStatementOfPurpose());
      
      let sopContent;
      await act(async () => {
        sopContent = await result.current(mockApplicationId);
      });
      
      // Check if toast.error was called
      expect(toast.error).toHaveBeenCalledWith('Error', {
        description: 'Failed to generate Statement of Purpose. Please try again.'
      });
      
      // Check if sopContent is null
      expect(sopContent).toBeNull();
    });
  });
  
  describe('useGenerateLetterOfRecommendation', () => {
    it('should generate LOR successfully', async () => {
      const { result } = renderHook(() => useGenerateLetterOfRecommendation(mockDocumentId));
      
      let lorContent;
      await act(async () => {
        lorContent = await result.current(mockApplicationId);
      });
      
      // Check if generateLOR was called with correct data
      expect(mockGenerateLOR).toHaveBeenCalledWith({
        profile: expect.objectContaining({
          name: 'John Doe',
          current_location: 'New York',
          major: 'Computer Science'
        }),
        university: {
          name: 'Stanford University'
        },
        program: {
          name: 'Computer Science',
          degree: 'PhD',
          department: 'Computer Science Department'
        },
        recommender: {
          name: 'Dr. John Smith',
          email: 'john.smith@example.com'
        }
      });
      
      // Check if convex.mutation was called with correct arguments for saveDocumentDraft
      expect(mockConvexMutation).toHaveBeenCalledWith(
        'documents.mutations.saveDocumentDraft',
        {
          applicationDocumentId: mockDocumentId,
          content: 'Generated Letter of Recommendation content'
        }
      );
      
      // Check if convex.mutation was called with correct arguments for updateDocumentStatus
      expect(mockConvexMutation).toHaveBeenCalledWith(
        'documents.mutations.updateDocumentStatus',
        {
          documentId: mockDocumentId,
          status: 'draft'
        }
      );
      
      // Check if toast.success was called
      expect(toast.success).toHaveBeenCalledWith('Success', {
        description: 'Letter of Recommendation generated successfully!'
      });
      
      // Check if LOR content is returned
      expect(lorContent).toBe('Generated Letter of Recommendation content');
    });
    
    it('should handle insufficient AI credits for LOR', async () => {
      // Mock insufficient AI credits
      (useQuery as MockedFunction).mockImplementation((query) => {
        if (query === 'aiCredits.queries.getAiCreditsRemaining') {
          return 2; // Not enough credits for LOR (requires 3)
        } else if (query === 'userProfiles.queries.getProfile') {
          return mockUserProfile;
        } else if (query === 'userProfiles.queries.getUserName') {
          return 'John Doe';
        } else if (query === 'documents.queries.getDocumentById') {
          return {
            _id: mockDocumentId,
            type: 'lor',
            title: 'Letter of Recommendation',
            content: '',
            status: 'not_started'
          };
        }
        return undefined;
      });
      
      const { result } = renderHook(() => useGenerateLetterOfRecommendation(mockDocumentId));
      
      let lorContent;
      await act(async () => {
        lorContent = await result.current(mockApplicationId);
      });
      
      // Check if toast.error was called
      expect(toast.error).toHaveBeenCalledWith('Insufficient AI Credits', {
        description: 'You have 2 AI credits left. It takes 3 credits to generate a Letter of Recommendation.'
      });
      
      // Check if generateLOR was not called
      expect(mockGenerateLOR).not.toHaveBeenCalled();
      
      // Check if lorContent is null
      expect(lorContent).toBeNull();
    });
    
    it('should handle missing recommender information', async () => {
      // Mock missing recommender
      mockConvexQuery.mockImplementation((query) => {
        if (query === 'applications.queries.getApplicationDetails') {
          return Promise.resolve(mockApplicationDetails);
        } else if (query === 'documents.queries.getRecommender') {
          return Promise.resolve(null);
        }
        return Promise.resolve(undefined);
      });
      
      const { result } = renderHook(() => useGenerateLetterOfRecommendation(mockDocumentId));
      
      let lorContent;
      await act(async () => {
        lorContent = await result.current(mockApplicationId);
      });
      
      // Check if toast.error was called
      expect(toast.error).toHaveBeenCalledWith('Missing Recommender', {
        description: 'Please assign a recommender before generating a Letter of Recommendation.'
      });
      
      // Check if generateLOR was not called
      expect(mockGenerateLOR).not.toHaveBeenCalled();
      
      // Check if lorContent is null
      expect(lorContent).toBeNull();
    });
    
    it('should handle incomplete recommender information', async () => {
      // Mock incomplete recommender
      mockConvexQuery.mockImplementation((query) => {
        if (query === 'applications.queries.getApplicationDetails') {
          return Promise.resolve(mockApplicationDetails);
        } else if (query === 'documents.queries.getRecommender') {
          return Promise.resolve({
            _id: 'rec1',
            name: 'Dr. John Smith',
            // Missing email
            title: 'Professor',
            institution: 'MIT',
            relationship: 'Research Advisor'
          });
        }
        return Promise.resolve(undefined);
      });
      
      const { result } = renderHook(() => useGenerateLetterOfRecommendation(mockDocumentId));
      
      let lorContent;
      await act(async () => {
        lorContent = await result.current(mockApplicationId);
      });
      
      // Check if toast.error was called
      expect(toast.error).toHaveBeenCalledWith('Incomplete Recommender Info', {
        description: 'Recommender must have both name and email. Please update the recommender information.'
      });
      
      // Check if generateLOR was not called
      expect(mockGenerateLOR).not.toHaveBeenCalled();
      
      // Check if lorContent is null
      expect(lorContent).toBeNull();
    });
    
    it('should handle errors during LOR generation', async () => {
      // Mock generateLOR to throw an error
      mockGenerateLOR.mockRejectedValueOnce(new Error('Failed to generate LOR'));
      
      const { result } = renderHook(() => useGenerateLetterOfRecommendation(mockDocumentId));
      
      let lorContent;
      await act(async () => {
        lorContent = await result.current(mockApplicationId);
      });
      
      // Check if toast.error was called
      expect(toast.error).toHaveBeenCalledWith('Error', {
        description: 'Failed to generate Letter of Recommendation. Please try again.'
      });
      
      // Check if lorContent is null
      expect(lorContent).toBeNull();
    });
  });
});
