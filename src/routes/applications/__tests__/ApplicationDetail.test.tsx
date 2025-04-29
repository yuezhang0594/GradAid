import { describe, it, expect, vi, beforeEach } from 'vitest';

// These mocks need to be defined before any imports
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

vi.mock("#/_generated/dataModel", () => ({
  Id: {
    fromString: (id: string) => id,
  },
}));

vi.mock("#/_generated/api", () => {
  const api = {
    documents: {
      mutations: {
        createDocument: { name: 'documents:createDocument' },
      },
    },
    applications: {
      mutations: {
        deleteApplication: { name: 'applications:deleteApplication' },
        updateApplicationStatus: { name: 'applications:updateApplicationStatus' },
      },
    },
  };
  return { api };
});

// Create separate mock functions that can be referenced in tests
const mockNavigate = vi.fn();
const mockUseApplicationDetail = vi.fn();
const mockCreateDocument = vi.fn();
const mockDeleteApplication = vi.fn();
const mockUpdateApplicationStatus = vi.fn();

// Create a mockLocation we can control
const mockLocation: {
  pathname: string;
  state: null | {
    applicationId?: string;
    universityName?: string;
    message?: string;
  };
} = {
  pathname: '/applications/stanford',
  state: null
};

// Set default return value for useApplicationDetail to fix first test
mockUseApplicationDetail.mockReturnValue({
  application: null,
  applicationStats: [],
  documentStats: [],
  isLoading: false
});

vi.mock('@/hooks/useApplicationDetail', () => ({
  useApplicationDetail: (...args: any) => mockUseApplicationDetail(...args)
}));

vi.mock('convex/react', () => ({
  useMutation: (fn: any) => {
    if (fn?.name === 'documents:createDocument') return mockCreateDocument;
    if (fn?.name === 'applications:deleteApplication') return mockDeleteApplication;
    if (fn?.name === 'applications:updateApplicationStatus') return mockUpdateApplicationStatus;
    return vi.fn();
  }
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation
}));

vi.mock('@/components/ui/page-wrapper', () => ({
  PageWrapper: ({ title, description, children }: { title: string, description?: string, children: React.ReactNode }) => (
    <div data-testid="page-wrapper" data-title={title} data-description={description || ''}>
      {children}
    </div>
  ),
}));

// Mock Dialog components needed for tests
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: { children: React.ReactNode, open: boolean }) => (
    open ? <div data-testid="dialog">{children}</div> : null
  ),
  DialogContent: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-title">{children}</div>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-description">{children}</div>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-footer">{children}</div>,
}));

vi.mock('@/components/ui', () => ({
  Button: ({ children, onClick, disabled }: { children: React.ReactNode, onClick?: () => void, disabled?: boolean }) => (
    <button data-testid="button" onClick={onClick} disabled={disabled}>{children}</button>
  ),
}));

// Mock ClickableCard component with a testid
vi.mock('@/components/dashboard/clickablecard', () => ({
  ClickableCard: ({ children, action }: { children: React.ReactNode, action: any }) => (
    <div data-testid="clickable-card" onClick={action.onClick}>
      {children}
    </div>
  )
}));

// Mock Input component
vi.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input data-testid="input" {...props} />
}));

// Only import modules after all mocks are defined
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ApplicationDetail from '../ApplicationDetail';
import { toast } from 'sonner';

describe('ApplicationDetail Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockUseApplicationDetail.mockReset();
    
    // Reset location state for each test
    mockLocation.pathname = '/applications/stanford';
    mockLocation.state = null;
    
    // Default mock return value
    mockUseApplicationDetail.mockReturnValue({
      application: null,
      applicationStats: [],
      documentStats: [],
      isLoading: false
    });
  });

  it('shows error state when no applicationId is provided', () => {
    // Using default mock from above which has null state
    render(<ApplicationDetail />);
    
    const pageWrapper = screen.getByTestId('page-wrapper');
    expect(pageWrapper).toHaveAttribute('data-title', 'Error');
    expect(screen.getByText('Missing Application ID')).toBeInTheDocument();
    expect(screen.getByText('No application ID was provided in the navigation state.')).toBeInTheDocument();
    expect(screen.getByText('Go Back')).toBeInTheDocument();
  });

  it('shows loading state when isLoading is true', () => {
    // Set application ID first, then set isLoading to true
    mockLocation.state = {
      applicationId: 'mock-application-id',
      universityName: 'Stanford University'
    };
    
    mockUseApplicationDetail.mockReturnValue({
      application: null,
      applicationStats: [],
      documentStats: [],
      isLoading: true
    });

    const { container } = render(<ApplicationDetail />);
    
    const pageWrapper = screen.getByTestId('page-wrapper');
    expect(pageWrapper).toHaveAttribute('data-title', 'Loading Application Details...');
    // Instead of looking for loading text, check for loading indicators
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('shows application not found state when applicationId is valid but application not found', () => {
    // Update location state for this test
    mockLocation.state = {
      applicationId: 'mock-application-id',
      universityName: 'Stanford University'
    };
    
    mockUseApplicationDetail.mockReturnValue({
      application: null,
      applicationStats: [],
      documentStats: [],
      isLoading: false
    });

    render(<ApplicationDetail />);
    
    const pageWrapper = screen.getByTestId('page-wrapper');
    expect(pageWrapper).toHaveAttribute('data-title', 'Application not found');
    expect(screen.getByText(/Application not found/i)).toBeInTheDocument();
    expect(screen.getByText(/No application found for Stanford University/i)).toBeInTheDocument();
  });

  it('renders the application detail page with data correctly', () => {
    // Set location state to include applicationId
    mockLocation.state = {
      applicationId: 'mock-application-id',
      universityName: 'Stanford University'
    };

    const mockApplication = {
      _id: 'mock-application-id',
      university: 'Stanford University',
      degree: 'Ph.D.',
      program: 'Computer Science',
      status: 'in_progress'
    };

    const mockAppStats = [
      { title: 'Status', value: 'in_progress', description: 'Current application status' },
      { title: 'Documents', value: '2 of 4', description: 'Documents completed' },
      { title: 'Deadline', value: 'Dec 1, 2023', description: 'Application deadline' }
    ];

    const mockDocStats = [
      { 
        title: 'Statement of Purpose', 
        type: 'sop', 
        status: 'in_progress', 
        progress: 50, 
        documentId: 'doc-id-1',
        action: { label: 'Edit SOP', href: '#' }
      },
      { 
        title: 'Letter of Recommendation', 
        type: 'lor', 
        status: 'complete', 
        progress: 100, 
        documentId: 'doc-id-2',
        action: { label: 'Edit LOR', href: '#' }
      }
    ];

    mockUseApplicationDetail.mockReturnValue({
      application: mockApplication,
      applicationStats: mockAppStats,
      documentStats: mockDocStats,
      isLoading: false
    });

    render(<ApplicationDetail />);
    
    // Check page title contains university name
    const pageWrapper = screen.getByTestId('page-wrapper');
    expect(pageWrapper).toHaveAttribute('data-title', 'Stanford University');
    expect(pageWrapper).toHaveAttribute('data-description', 'Ph.D. in Computer Science');
    
    // Check application status cards - be more specific with queries
    expect(screen.getByRole('heading', { level: 2, name: /Application Status/i })).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Documents')).toBeInTheDocument();
    expect(screen.getByText('Deadline')).toBeInTheDocument();
    
    // Check document cards
    expect(screen.getByRole('heading', { level: 2, name: /Application Documents/i })).toBeInTheDocument();
    
    // Check buttons
    expect(screen.getByRole('button', { name: 'Submit Application' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete Application' })).toBeInTheDocument();
  });

  it('navigates to document page when document card is clicked', async () => {
    // Set location state to include applicationId
    mockLocation.state = {
      applicationId: 'mock-application-id',
      universityName: 'Stanford University'
    };

    const mockApplication = {
      _id: 'mock-application-id',
      university: 'Stanford University',
      degree: 'Ph.D.',
      program: 'Computer Science',
      status: 'in_progress'
    };

    const mockDocStats = [
      { 
        title: 'Statement of Purpose', 
        type: 'sop', 
        status: 'in_progress', 
        progress: 50, 
        documentId: 'doc-id-1',
        action: { label: 'Edit SOP', href: '#' }
      }
    ];

    mockUseApplicationDetail.mockReturnValue({
      application: mockApplication,
      applicationStats: [],
      documentStats: mockDocStats,
      isLoading: false
    });

    render(<ApplicationDetail />);
    
    // Find the document card by its testid and click it
    const documentCards = screen.getAllByTestId('clickable-card');
    expect(documentCards.length).toBeGreaterThan(0);
    fireEvent.click(documentCards[0]);
    
    // Check navigate was called with correct params
    expect(mockNavigate).toHaveBeenCalledWith(
      `/documents/${encodeURIComponent('Stanford University')}/sop?documentId=doc-id-1`,
      expect.objectContaining({
        state: expect.objectContaining({
          applicationId: 'mock-application-id',
          universityName: 'Stanford University'
        })
      })
    );
  });

  // ... remaining tests using the same pattern
  it('creates a new document when "Create New Document" is clicked', async () => {
    // Set location state 
    mockLocation.state = {
      applicationId: 'mock-application-id',
      universityName: 'Stanford University'
    };

    const mockApplication = {
      _id: 'mock-application-id',
      university: 'Stanford University',
      program: 'Computer Science',
      degree: 'Ph.D.',
      status: 'in_progress'
    };

    mockUseApplicationDetail.mockReturnValue({
      application: mockApplication,
      applicationStats: [],
      documentStats: [], // No existing documents
      isLoading: false
    });

    // Mock the create document function to return a document ID
    mockCreateDocument.mockResolvedValue('new-doc-id');

    render(<ApplicationDetail />);
    
    // Find the card with "Statement of Purpose" and click it
    const documentCard = screen.getAllByTestId('clickable-card')[0];
    fireEvent.click(documentCard);
    
    // Check that createDocument was called with correct params
    expect(mockCreateDocument).toHaveBeenCalledWith({
      applicationId: 'mock-application-id',
      type: 'sop'
    });

    // Wait for async function to complete and check navigation
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        '/documents/Stanford%20University/sop?documentId=new-doc-id',
        expect.objectContaining({
          state: expect.objectContaining({
            applicationId: 'mock-application-id',
            universityName: 'Stanford University'
          })
        })
      );
    });
  });

  it('opens delete confirmation dialog when delete button is clicked', () => {
    // Set location state
    mockLocation.state = {
      applicationId: 'mock-application-id',
      universityName: 'Stanford University'
    };

    const mockApplication = {
      _id: 'mock-application-id',
      university: 'Stanford University',
      program: 'Computer Science',
      degree: 'Ph.D.',
      status: 'in_progress'
    };

    mockUseApplicationDetail.mockReturnValue({
      application: mockApplication,
      applicationStats: [],
      documentStats: [],
      isLoading: false
    });

    render(<ApplicationDetail />);
    
    // Find the delete button by text and click it
    const deleteButtons = screen.getAllByRole('button');
    const deleteButton = deleteButtons.find(button => button.textContent === 'Delete Application');
    fireEvent.click(deleteButton!);
    
    // Check dialog appears
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete this application?/i)).toBeInTheDocument();
    expect(screen.getByText(/This action is permanent and irreversible/i)).toBeInTheDocument();
  });

  it('confirms application deletion when confirmation is correctly entered', async () => {
    // Set location state
    mockLocation.state = {
      applicationId: 'mock-application-id',
      universityName: 'Stanford University'
    };

    const mockApplication = {
      _id: 'mock-application-id',
      university: 'Stanford University',
      program: 'Computer Science',
      degree: 'Ph.D.',
      status: 'in_progress'
    };

    mockUseApplicationDetail.mockReturnValue({
      application: mockApplication,
      applicationStats: [],
      documentStats: [],
      isLoading: false
    });

    mockDeleteApplication.mockResolvedValue(true);

    render(<ApplicationDetail />);
    
    // Open delete dialog
    const deleteButtons = screen.getAllByRole('button');
    const deleteButton = deleteButtons.find(button => button.textContent === 'Delete Application');
    fireEvent.click(deleteButton!);
    
    // Enter confirmation text
    const confirmInput = screen.getByTestId('input');
    fireEvent.change(confirmInput, { target: { value: 'Delete application' } });
    
    // Click delete button in dialog
    const confirmButtons = screen.getAllByRole('button');
    const confirmDeleteButton = confirmButtons.find(button => button.textContent === 'Delete');
    fireEvent.click(confirmDeleteButton!);
    
    // Check delete mutation was called
    expect(mockDeleteApplication).toHaveBeenCalledWith({ applicationId: 'mock-application-id' });
    
    // Check navigation occurred after deletion
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/applications', {
        state: { message: 'Application for Stanford University has been deleted.' }
      });
      expect(toast.success).toHaveBeenCalledWith('Application deleted successfully');
    });
  });

  it('opens submit application dialog when submit button is clicked', () => {
    // Set location state
    mockLocation.state = {
      applicationId: 'mock-application-id',
      universityName: 'Stanford University'
    };

    const mockApplication = {
      _id: 'mock-application-id',
      university: 'Stanford University',
      program: 'Computer Science',
      degree: 'Ph.D.',
      status: 'in_progress'
    };

    mockUseApplicationDetail.mockReturnValue({
      application: mockApplication,
      applicationStats: [],
      documentStats: [
        { 
          type: 'sop', 
          status: 'complete', 
          progress: 100, 
          documentId: 'doc-id-1',
          action: { label: 'Edit SOP', href: '#' } 
        },
        { 
          type: 'lor', 
          status: 'complete', 
          progress: 100, 
          documentId: 'doc-id-2',
          action: { label: 'Edit LOR', href: '#' } 
        }
      ],
      isLoading: false
    });

    render(<ApplicationDetail />);
    
    // Find the submit button by text and click it
    const submitButtons = screen.getAllByRole('button');
    const submitButton = submitButtons.find(button => button.textContent === 'Submit Application');
    fireEvent.click(submitButton!);
    
    // Check dialog appears
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-title')).toHaveTextContent('Submit Application?');
  });

  it('shows error toast when trying to submit with incomplete documents', () => {
    // Set location state
    mockLocation.state = {
      applicationId: 'mock-application-id',
      universityName: 'Stanford University'
    };

    const mockApplication = {
      _id: 'mock-application-id',
      university: 'Stanford University',
      program: 'Computer Science',
      degree: 'Ph.D.',
      status: 'in_progress'
    };

    mockUseApplicationDetail.mockReturnValue({
      application: mockApplication,
      applicationStats: [],
      documentStats: [
        { 
          type: 'sop', 
          status: 'not_started', 
          progress: 0, 
          documentId: 'doc-id-1',
          action: { label: 'Edit SOP', href: '#' } 
        }
      ], // Missing LOR
      isLoading: false
    });

    render(<ApplicationDetail />);
    
    // Find the submit button and click it
    const submitButtons = screen.getAllByRole('button');
    const submitButton = submitButtons.find(button => button.textContent === 'Submit Application');
    fireEvent.click(submitButton!);
    
    // Dialog shouldn't appear, but toast error should be shown
    expect(toast.error).toHaveBeenCalled();
  });

  it('submits application when confirmation dialog is confirmed', async () => {
    // Set location state
    mockLocation.state = {
      applicationId: 'mock-application-id',
      universityName: 'Stanford University'
    };

    const mockApplication = {
      _id: 'mock-application-id',
      university: 'Stanford University',
      program: 'Computer Science',
      degree: 'Ph.D.',
      status: 'in_progress'
    };

    mockUseApplicationDetail.mockReturnValue({
      application: mockApplication,
      applicationStats: [],
      documentStats: [
        { 
          type: 'sop', 
          status: 'complete', 
          progress: 100, 
          documentId: 'doc-id-1',
          action: { label: 'Edit SOP', href: '#' } 
        },
        { 
          type: 'lor', 
          status: 'complete', 
          progress: 100, 
          documentId: 'doc-id-2',
          action: { label: 'Edit LOR', href: '#' } 
        }
      ],
      isLoading: false
    });

    mockUpdateApplicationStatus.mockResolvedValue(true);

    render(<ApplicationDetail />);
    
    // Open submit dialog
    const submitButtons = screen.getAllByRole('button');
    const submitButton = submitButtons.find(button => button.textContent === 'Submit Application');
    fireEvent.click(submitButton!);
    
    // Click confirm button in dialog
    const confirmButtons = screen.getAllByRole('button');
    const confirmButton = confirmButtons.find(button => button.textContent === 'Confirm Submit');
    fireEvent.click(confirmButton!);
    
    // Check update status mutation was called with correct params
    expect(mockUpdateApplicationStatus).toHaveBeenCalledWith({
      applicationId: 'mock-application-id',
      status: 'submitted',
      submissionDate: expect.any(String)
    });
    
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Application submitted successfully!');
    });
  });
});
