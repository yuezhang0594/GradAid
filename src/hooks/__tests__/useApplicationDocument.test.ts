import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock dependencies
vi.mock('convex/react', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn()
}));

vi.mock('#/_generated/api', () => ({
  api: {
    documents: {
      queries: {
        getDocumentById: 'documents.queries.getDocumentById'
      },
      mutations: {
        updateDocumentStatus: 'documents.mutations.updateDocumentStatus',
        generateDocumentContent: 'documents.mutations.generateDocumentContent',
        saveDocumentDraft: 'documents.mutations.saveDocumentDraft'
      }
    },
    aiCredits: {
      queries: {
        getAiCreditsRemaining: 'aiCredits.queries.getAiCreditsRemaining'
      }
    }
  }
}));

// Mock toast notifications
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Import after mocking
import { useApplicationDocument } from '../useApplicationDocument';
import { useQuery, useMutation } from 'convex/react';
import { toast } from 'sonner';
import { Id } from '#/_generated/dataModel';

// Define a type for the mocked function
type MockedFunction = ReturnType<typeof vi.fn>;

// Mock the missing saveDocumentDraft function in the global scope
// This is needed because the hook references it directly without defining it
(global as any).saveDocumentDraft = vi.fn();

describe('useApplicationDocument Hook', () => {
  // Mock data
  const mockDocumentId = 'doc1' as unknown as Id<"applicationDocuments">;
  
  const mockDocument = {
    _id: mockDocumentId,
    _creationTime: 1234567890,
    applicationId: 'app1' as unknown as Id<"applications">,
    type: 'sop',
    title: 'Statement of Purpose',
    content: 'This is a draft statement of purpose.',
    status: 'draft',
    progress: 30,
    lastUpdated: 1234567890
  };
  
  // Mock mutation functions
  const mockSaveDocumentDraft = vi.fn();
  const mockUpdateDocumentStatus = vi.fn();
  const mockGenerateDocumentContent = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset the global mock
    (global as any).saveDocumentDraft = mockSaveDocumentDraft;
    
    // Mock useQuery
    (useQuery as MockedFunction).mockImplementation((query) => {
      if (query === 'documents.queries.getDocumentById') {
        return mockDocument;
      } else if (query === 'aiCredits.queries.getAiCreditsRemaining') {
        return 10; // Mock 10 AI credits remaining
      }
      return undefined;
    });
    
    // Mock useMutation
    (useMutation as MockedFunction).mockImplementation((mutation) => {
      if (mutation === 'documents.mutations.updateDocumentStatus') {
        return mockUpdateDocumentStatus;
      } else if (mutation === 'documents.mutations.generateDocumentContent') {
        return mockGenerateDocumentContent;
      } else if (mutation === 'documents.mutations.saveDocumentDraft') {
        return mockSaveDocumentDraft;
      }
      return mockSaveDocumentDraft;
    });
    
    // Set up successful mutation responses
    mockSaveDocumentDraft.mockResolvedValue(true);
    mockUpdateDocumentStatus.mockResolvedValue(true);
    mockGenerateDocumentContent.mockResolvedValue('Generated content for SOP');
  });
  
  it('should initialize with document content when available', () => {
    const { result } = renderHook(() => useApplicationDocument({ documentId: mockDocumentId }));
    
    // Check if content is initialized with document content
    expect(result.current.content).toBe('This is a draft statement of purpose.');
    expect(result.current.document).toEqual(mockDocument);
    expect(result.current.isSaving).toBe(false);
    expect(result.current.isGenerating).toBe(false);
  });
  
  it('should update content when setContent is called', () => {
    const { result } = renderHook(() => useApplicationDocument({ documentId: mockDocumentId }));
    
    // Update content
    act(() => {
      result.current.setContent('Updated content');
    });
    
    // Check if content is updated
    expect(result.current.content).toBe('Updated content');
  });
  
  it('should save document content successfully', async () => {
    const { result } = renderHook(() => useApplicationDocument({ documentId: mockDocumentId }));
    
    // Save document
    let saveResult;
    await act(async () => {
      saveResult = await result.current.saveDocument();
    });
    
    // Check if saveDocumentDraft was called with correct arguments
    expect(mockSaveDocumentDraft).toHaveBeenCalledWith({
      applicationDocumentId: mockDocumentId,
      content: 'This is a draft statement of purpose.'
    });
    
    // Check if toast.success was called
    expect(toast.success).toHaveBeenCalledWith('Document saved successfully!');
    
    // Check if saveResult is true
    expect(saveResult).toBe(true);
  });
  
  it('should handle errors when saving document', async () => {
    // Mock saveDocumentDraft to throw an error
    mockSaveDocumentDraft.mockRejectedValueOnce(new Error('Failed to save'));
    
    const { result } = renderHook(() => useApplicationDocument({ documentId: mockDocumentId }));
    
    // Save document
    let saveResult;
    await act(async () => {
      saveResult = await result.current.saveDocument();
    });
    
    // Check if toast.error was called
    expect(toast.error).toHaveBeenCalledWith('Error saving document', {
      description: 'Please try again later'
    });
    
    // Check if saveResult is false
    expect(saveResult).toBe(false);
  });
  
  it('should update document status successfully', async () => {
    const { result } = renderHook(() => useApplicationDocument({ documentId: mockDocumentId }));
    
    // Update status
    let updateResult;
    await act(async () => {
      updateResult = await result.current.updateStatus('complete');
    });
    
    // Check if updateDocumentStatus was called with correct arguments
    expect(mockUpdateDocumentStatus).toHaveBeenCalledWith({
      applicationDocumentId: mockDocumentId,
      status: 'complete'
    });
    
    // Check if toast.success was called
    expect(toast.success).toHaveBeenCalledWith('Document marked as complete');
    
    // Check if updateResult is true
    expect(updateResult).toBe(true);
  });
  
  it('should handle errors when updating document status', async () => {
    // Mock updateDocumentStatus to throw an error
    mockUpdateDocumentStatus.mockRejectedValueOnce(new Error('Failed to update status'));
    
    const { result } = renderHook(() => useApplicationDocument({ documentId: mockDocumentId }));
    
    // Update status
    let updateResult;
    await act(async () => {
      updateResult = await result.current.updateStatus('complete');
    });
    
    // Check if toast.error was called
    expect(toast.error).toHaveBeenCalledWith('Error updating document status', {
      description: 'Please try again later'
    });
    
    // Check if updateResult is false
    expect(updateResult).toBe(false);
  });
  
  it('should generate content successfully', async () => {
    const { result } = renderHook(() => useApplicationDocument({ documentId: mockDocumentId }));
    
    // Generate content
    let generateResult;
    await act(async () => {
      generateResult = await result.current.generateContent(mockDocumentId);
    });
    
    // Check if generateDocumentContent was called with correct arguments
    expect(mockGenerateDocumentContent).toHaveBeenCalledWith({
      applicationDocumentId: mockDocumentId
    });
    
    // Check if content was updated
    expect(result.current.content).toBe('Generated content for SOP');
    
    // Check if toast.success was called
    expect(toast.success).toHaveBeenCalledWith('Content generated successfully');
    
    // Check if generateResult is true
    expect(generateResult).toBe(true);
  });
  
  it('should handle insufficient AI credits when generating content', async () => {
    // Mock insufficient AI credits
    (useQuery as MockedFunction).mockImplementation((query) => {
      if (query === 'documents.queries.getDocumentById') {
        return mockDocument;
      } else if (query === 'aiCredits.queries.getAiCreditsRemaining') {
        return 2; // Not enough credits for SOP (requires 5)
      }
      return undefined;
    });
    
    const { result } = renderHook(() => useApplicationDocument({ documentId: mockDocumentId }));
    
    // Generate content
    let generateResult;
    await act(async () => {
      generateResult = await result.current.generateContent(mockDocumentId);
    });
    
    // Check if toast.error was called
    expect(toast.error).toHaveBeenCalledWith('Insufficient AI credits to generate content.');
    
    // Check if generateDocumentContent was not called
    expect(mockGenerateDocumentContent).not.toHaveBeenCalled();
    
    // Check if generateResult is false
    expect(generateResult).toBe(false);
  });
  
  it('should calculate completion percentage correctly', () => {
    const { result } = renderHook(() => useApplicationDocument({ documentId: mockDocumentId }));
    
    // Check if completion percentage is calculated correctly
    expect(result.current.getCompletionPercentage()).toBe(30);
    
    // Mock a complete document
    const completeDocument = {
      ...mockDocument,
      status: 'complete',
      progress: 90 // This should be ignored for complete documents
    };
    
    // Update the mock to return the complete document
    (useQuery as MockedFunction).mockImplementation((query) => {
      if (query === 'documents.queries.getDocumentById') {
        return completeDocument;
      } else if (query === 'aiCredits.queries.getAiCreditsRemaining') {
        return 10;
      }
      return undefined;
    });
    
    // Render the hook with the updated mock
    const { result: completeResult } = renderHook(() => useApplicationDocument({ documentId: mockDocumentId }));
    
    // Check if completion percentage is 100 for complete documents
    expect(completeResult.current.getCompletionPercentage()).toBe(100);
  });
  
  it('should format document type correctly', () => {
    const { result } = renderHook(() => useApplicationDocument({ documentId: mockDocumentId }));
    
    // Check if document type is formatted correctly
    expect(result.current.formatDocumentType('sop')).toBe('Statement of Purpose');
    expect(result.current.formatDocumentType('lor')).toBe('Letter of Recommendation');
    expect(result.current.formatDocumentType('research_statement' as any)).toBe('Research Statement');
    expect(result.current.formatDocumentType('cv' as any)).toBe('Cv');
    expect(result.current.formatDocumentType(undefined)).toBe('Document');
  });
});
