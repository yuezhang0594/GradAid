import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Id } from '#/_generated/dataModel';

// Mock data
const mockDocument = {
  _id: 'doc1' as unknown as Id<"applicationDocuments">,
  _creationTime: Date.now(),
  title: 'Statement of Purpose',
  content: 'This is a test document content',
  type: 'sop' as 'sop' | 'lor',
  status: 'draft' as 'draft' | 'not_started' | 'in_review' | 'complete',
  lastEdited: new Date().toISOString(),
  applicationId: 'app1' as unknown as Id<"applications">,
  userId: 'user1' as unknown as Id<"users">,
  progress: 75,
  recommenderName: undefined,
  recommenderEmail: undefined,
  aiSuggestionsCount: 0,
};

const mockApplication = {
  _id: 'app1' as unknown as Id<"applications">,
  _creationTime: Date.now(),
  university: 'Stanford University',
  program: 'Computer Science',
  degree: 'MS',
  status: 'in_progress',
  userId: 'user1' as unknown as Id<"users">,
};

// Mock functions
const mockGetDocumentById = vi.fn().mockReturnValue(mockDocument);
const mockGetApplicationDetails = vi.fn().mockReturnValue(mockApplication);
const mockSaveDocumentDraft = vi.fn().mockResolvedValue('success');
const mockUpdateDocumentStatus = vi.fn().mockResolvedValue('success');
const mockGenerateSOP = vi.fn().mockResolvedValue('Generated SOP content');
const mockGenerateLOR = vi.fn().mockResolvedValue('Generated LOR content');
const mockSetAtom = vi.fn();
const mockNavigate = vi.fn();

// Setup mocks
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({
    state: {
      applicationId: 'app1',
      universityName: 'Stanford University',
    },
  }),
  useSearchParams: () => [new URLSearchParams('documentId=doc1'), vi.fn()],
}));

vi.mock('jotai', () => ({
  useSetAtom: () => mockSetAtom,
  atom: vi.fn(),
}));

vi.mock('../store/document', () => ({
  documentEditorAtom: {},
}));

vi.mock('../useLLM', () => ({
  useGenerateStatementOfPurpose: () => mockGenerateSOP,
  useGenerateLetterOfRecommendation: () => mockGenerateLOR,
}));

// Mock Convex API
vi.mock('#/_generated/api', () => ({
  api: {
    documents: {
      queries: {
        getDocumentById: 'documents.queries.getDocumentById',
      },
      mutations: {
        saveDocumentDraft: 'documents.mutations.saveDocumentDraft',
        updateDocumentStatus: 'documents.mutations.updateDocumentStatus',
      },
    },
    applications: {
      queries: {
        getApplicationDetails: 'applications.queries.getApplicationDetails',
      },
    },
  },
}));

// Mock Convex hooks
vi.mock('convex/react', () => {
  const useQueryMock = vi.fn((queryName, args) => {
    if (queryName === 'documents.queries.getDocumentById') {
      return mockDocument;
    }
    if (queryName === 'applications.queries.getApplicationDetails') {
      return mockApplication;
    }
    return null;
  });
  
  const useMutationMock = vi.fn((mutationName) => {
    if (mutationName === 'documents.mutations.saveDocumentDraft') {
      return mockSaveDocumentDraft;
    }
    if (mutationName === 'documents.mutations.updateDocumentStatus') {
      return mockUpdateDocumentStatus;
    }
    return vi.fn().mockResolvedValue('success');
  });
  
  return {
    useQuery: useQueryMock,
    useMutation: useMutationMock,
    useAction: vi.fn(() => vi.fn().mockResolvedValue('success')),
  };
});

// Import the hook after all mocks are set up
import { useDocumentEditor } from '../useDocumentEditor';

describe('useDocumentEditor Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch document data when documentId is provided', () => {
    const { result } = renderHook(() => useDocumentEditor());
    
    expect(result.current.document).toEqual(mockDocument);
    expect(result.current.documentId).toBe('doc1');
  });

  it('should fetch application data and set university and program info', () => {
    const { result } = renderHook(() => useDocumentEditor());
    
    expect(result.current.universityName).toBe('Stanford University');
    expect(result.current.programName).toBe('Computer Science');
    expect(result.current.programDegree).toBe('MS');
  });

  it('should update state when setState is called', () => {
    const { result } = renderHook(() => useDocumentEditor());
    
    act(() => {
      result.current.setState({
        ...result.current.state,
        content: 'Updated content',
      });
    });
    
    expect(result.current.state.content).toBe('Updated content');
  });

  it('should have the correct initial state', () => {
    const { result } = renderHook(() => useDocumentEditor());
    
    expect(result.current.state).toEqual(expect.objectContaining({
      content: expect.any(String),
      recommenderName: expect.any(String),
      recommenderEmail: expect.any(String),
      showRecommenderDialog: expect.any(Boolean),
      showConfirmationDialog: expect.any(Boolean),
      showConfirmationNext: expect.any(Boolean),
      isSaving: expect.any(Boolean),
      isGenerating: expect.any(Boolean),
    }));
  });
});
