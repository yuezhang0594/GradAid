import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../test/utils';
import DocumentEditor from '../DocumentEditor';
import { useDocumentEditor } from '@/hooks/useDocumentEditor';
import { Id } from "#/_generated/dataModel";

// Mock the Id type for tests
vi.mock("#/_generated/dataModel", () => ({
  Id: {
    fromString: (id: string) => id,
  },
}));

// Create a default mock return value
const defaultMockDocumentEditorValue = {
  document: {
    _id: "doc1" as unknown as Id<"applicationDocuments">,
    _creationTime: Date.now(),
    title: 'Statement of Purpose',
    content: 'This is a test document content',
    lastEdited: new Date().toISOString(),
    status: "draft" as "draft" | "not_started" | "in_review" | "complete", // Explicitly type as union type
    type: "sop" as "sop" | "lor", // Explicitly type as union type
    applicationId: "app1" as unknown as Id<"applications">,
    userId: "user1" as unknown as Id<"users">,
    progress: 75,
    recommenderName: undefined,
    recommenderEmail: undefined,
    aiSuggestionsCount: 0,
  },
  state: { 
    content: 'This is a test document content',
    recommenderName: "",
    recommenderEmail: "",
    showRecommenderDialog: false,
    showConfirmationDialog: false,
    showConfirmationNext: false,
    isSaving: false,
    isGenerating: false,
  },
  setState: vi.fn(),
  documentId: "doc1" as unknown as Id<"applicationDocuments">,
  universityName: 'Stanford University',
  programName: 'Computer Science',
  programDegree: 'MS',
  handleSave: vi.fn(),
  handleBack: vi.fn(),
  handleRecommenderSubmit: vi.fn(),
  handleGenerateDocument: vi.fn(),
  performDocumentGeneration: vi.fn(),
  generateSOP: vi.fn(),
  generateLOR: vi.fn(),
};

// Mock the custom hook
vi.mock('@/hooks/useDocumentEditor', () => ({
  useDocumentEditor: vi.fn(),
}));

// Mock React Router's useNavigate and useLocation
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ 
    pathname: '/documents/stanford/sop', 
    state: { 
      applicationId: 'app1',
      universityName: 'Stanford University',
      returnPath: '/dashboard'
    } 
  }),
  useSearchParams: () => [new URLSearchParams('documentId=doc1'), vi.fn()],
}));

describe('DocumentEditor Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.resetAllMocks();
    // Set the default mock implementation for useDocumentEditor
    vi.mocked(useDocumentEditor).mockReturnValue(defaultMockDocumentEditorValue);
  });

  it('renders the document editor with correct title and university info', async () => {
    render(<DocumentEditor />);
    
    await waitFor(() => {
      // Check if the title is rendered
      expect(screen.getByText('Statement of Purpose')).toBeInTheDocument();
      
      // Check if university and program info is displayed
      expect(screen.getByText(/Stanford University.*MS.*Computer Science/)).toBeInTheDocument();
      
      // Check if the document content is loaded in the textarea
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue('This is a test document content');
    });
  });

  it('calls saveDocument when save button is clicked', async () => {
    const user = userEvent.setup();
    
    // Create a mock for the saveDocument function
    const mockHandleSave = vi.fn();
    
    // Override the default mock with our specific mock for this test
    vi.mocked(useDocumentEditor).mockReturnValue({
      ...defaultMockDocumentEditorValue,
      handleSave: mockHandleSave,
    });
    
    render(<DocumentEditor />);
    
    // Find and click the save button
    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);
    
    // Check if saveDocument was called
    expect(mockHandleSave).toHaveBeenCalled();
  });

  it('calls generateDocument when generate button is clicked', async () => {
    const user = userEvent.setup();
    
    // Create a mock for the generateDocument function
    const mockHandleGenerateDocument = vi.fn();
    
    // Override the default mock with our specific mock for this test
    vi.mocked(useDocumentEditor).mockReturnValue({
      ...defaultMockDocumentEditorValue,
      handleGenerateDocument: mockHandleGenerateDocument,
    });
    
    render(<DocumentEditor />);
    
    // Find and click the generate button
    const generateButton = screen.getByRole('button', { name: /generate/i });
    await user.click(generateButton);
    
    // Check if generateDocument was called
    expect(mockHandleGenerateDocument).toHaveBeenCalled();
  });

  it('shows loading state when isLoading is true', async () => {
    // Override the mock to return a state with saving in progress
    vi.mocked(useDocumentEditor).mockReturnValue({
      ...defaultMockDocumentEditorValue,
      state: {
        ...defaultMockDocumentEditorValue.state,
        isSaving: true,
      },
    });
    
    render(<DocumentEditor />);
    
    // Check for loading indicator or disabled buttons
    const savingButton = screen.getByRole('button', { name: /saving/i });
    expect(savingButton).toBeDisabled();
  });
});
