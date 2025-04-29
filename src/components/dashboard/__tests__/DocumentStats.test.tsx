import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DocumentStats, DocumentStat } from '../DocumentStats';
import { Id } from "#/_generated/dataModel";

// Mock react-router-dom's useNavigate and useLocation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/dashboard' })
}));

// Mock ClickableCard component
vi.mock('../clickablecard', () => ({
  ClickableCard: ({ children, action }: { children: React.ReactNode, action: any }) => (
    <div data-testid="clickable-card" onClick={action.onClick}>{children}</div>
  )
}));

// Mock Card components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div data-testid="card" className={className}>{children}</div>
  ),
  CardHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-header">{children}</div>
  ),
  CardTitle: ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div data-testid="card-title" className={className}>{children}</div>
  ),
  CardDescription: ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div data-testid="card-description" className={className}>{children}</div>
  ),
  CardContent: ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div data-testid="card-content" className={className}>{children}</div>
  ),
}));

// Mock Badge component
vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant }: { children: React.ReactNode, variant?: string }) => (
    <span data-testid="badge" data-variant={variant}>{children}</span>
  )
}));

// Mock Progress component
vi.mock('@/components/ui/progress', () => ({
  Progress: ({ value, className }: { value: number, className?: string }) => (
    <div data-testid="progress" data-value={value} className={className}></div>
  )
}));

// Mock Button component
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, variant, onClick, className }: { children: React.ReactNode, variant?: string, onClick?: () => void, className?: string }) => (
    <button data-testid="button" data-variant={variant} className={className} onClick={onClick}>{children}</button>
  )
}));

// Mock icons
vi.mock('lucide-react', () => ({
  FileTextIcon: () => <span data-testid="file-text-icon">FileText</span>,
  ExternalLink: () => <span data-testid="external-link-icon">ExternalLink</span>,
  ChevronUpIcon: () => <span data-testid="chevron-up-icon">ChevronUp</span>,
  ChevronDownIcon: () => <span data-testid="chevron-down-icon">ChevronDown</span>,
}));

describe('DocumentStats Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockDocumentStats: DocumentStat[] = [
    {
      title: 'SOP',
      progress: 75,
      status: 'draft',
      university: 'Stanford University',
      program: 'MS Computer Science',
      type: 'sop',
      documentId: 'doc1',
      applicationId: 'app1' as unknown as Id<"applications">,
      lastEdited: new Date().toISOString(),
      aiSuggestions: 2,
      action: {
        label: 'Edit Document',
        href: '/applications/Stanford University/documents/sop',
        tooltip: 'Continue editing document',
      },
    },
    {
      title: 'Research Statement',
      progress: 45,
      status: 'draft',
      university: 'MIT',
      program: 'MS Artificial Intelligence',
      type: 'researchStatement',
      documentId: 'doc2',
      applicationId: 'app2' as unknown as Id<"applications">,
      lastEdited: new Date().toISOString(),
      aiSuggestions: 1,
      action: {
        label: 'Edit Document',
        href: '/applications/MIT/documents/researchstatement',
        tooltip: 'Continue editing document',
      },
    },
    {
      title: 'CV',
      progress: 100,
      status: 'completed',
      university: 'UC Berkeley',
      program: 'MS Computer Science',
      type: 'cv',
      documentId: 'doc3',
      applicationId: 'app3' as unknown as Id<"applications">,
      lastEdited: new Date().toISOString(),
      aiSuggestions: 0,
      action: {
        label: 'Edit Document',
        href: '/applications/UC Berkeley/documents/cv',
        tooltip: 'Continue editing document',
      },
    }
  ];

  it('renders document cards correctly', () => {
    render(<DocumentStats documentStats={mockDocumentStats} />);
    
    // Check if all document titles are rendered
    expect(screen.getByText('SOP')).toBeInTheDocument();
    expect(screen.getByText('Research Statement')).toBeInTheDocument();
    expect(screen.getByText('CV')).toBeInTheDocument();
    
    // Check if university names are rendered
    expect(screen.getByText('Stanford University')).toBeInTheDocument();
    expect(screen.getByText('MIT')).toBeInTheDocument();
    expect(screen.getByText('UC Berkeley')).toBeInTheDocument();
    
    // Check if program names are rendered
    expect(screen.getAllByText('MS Computer Science').length).toBeGreaterThan(0);
    expect(screen.getByText('MS Artificial Intelligence')).toBeInTheDocument();
    
    // Check if progress percentages are rendered
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('45%')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
    
    // Check if status badges are rendered
    const badges = screen.getAllByTestId('badge');
    expect(badges.length).toBe(3);
    expect(badges[0].textContent).toBe('Draft');
    expect(badges[1].textContent).toBe('Draft');
    expect(badges[2].textContent).toBe('Completed');
    
    // Check if progress bars are rendered
    const progressBars = screen.getAllByTestId('progress');
    expect(progressBars.length).toBe(3);
    expect(progressBars[0].getAttribute('data-value')).toBe('75');
    expect(progressBars[1].getAttribute('data-value')).toBe('45');
    expect(progressBars[2].getAttribute('data-value')).toBe('100');
  });

  it('navigates to document editor when a document card is clicked', async () => {
    const user = userEvent.setup();
    
    render(<DocumentStats documentStats={mockDocumentStats} />);
    
    // Get the first document card and click it
    const documentCards = screen.getAllByTestId('clickable-card');
    await user.click(documentCards[0]);
    
    // Check if navigate was called with the correct parameters
    expect(mockNavigate).toHaveBeenCalledWith(
      '/documents/Stanford%20University/sop?documentId=doc1',
      expect.objectContaining({
        state: expect.objectContaining({
          applicationId: 'app1',
          universityName: 'Stanford University',
          returnPath: '/dashboard'
        })
      })
    );
  });

  it('shows "Show More" button when there are more than the initial number of documents', () => {
    // Create more documents than the initial number to show
    const manyDocuments = Array(6).fill(null).map((_, index) => ({
      ...mockDocumentStats[0],
      title: `Document ${index+1}`,
      documentId: `doc${index+1}`,
      university: `University ${index+1}`,
      program: `Program ${index+1}`,
    }));
    
    render(<DocumentStats documentStats={manyDocuments} initialDocumentsToShow={4} />);
    
    // Check if the "Show More" button is rendered
    expect(screen.getByText(/Show More/)).toBeInTheDocument();
    expect(screen.getByText(/2 more/)).toBeInTheDocument();
  });

  it('toggles between showing all documents and initial documents when "Show More/Less" is clicked', async () => {
    const user = userEvent.setup();
    
    // Create more documents than the initial number to show
    const manyDocuments = Array(6).fill(null).map((_, index) => ({
      ...mockDocumentStats[0],
      title: `Document ${index+1}`,
      documentId: `doc${index+1}`,
      university: `University ${index+1}`,
      program: `Program ${index+1}`,
    }));
    
    render(<DocumentStats documentStats={manyDocuments} initialDocumentsToShow={4} />);
    
    // Initially, we should see only the first 4 documents
    let documentCards = screen.getAllByTestId('clickable-card');
    expect(documentCards.length).toBe(4);
    
    // Click "Show More"
    const showMoreButton = screen.getByText(/Show More/);
    await user.click(showMoreButton);
    
    // Now we should see all 6 documents
    documentCards = screen.getAllByTestId('clickable-card');
    expect(documentCards.length).toBe(6);
    
    // Click "Show Less"
    const showLessButton = screen.getByText(/Show Less/);
    await user.click(showLessButton);
    
    // Now we should see only 4 documents again
    documentCards = screen.getAllByTestId('clickable-card');
    expect(documentCards.length).toBe(4);
  });

  it('renders empty state when no documents are provided', () => {
    render(<DocumentStats documentStats={[]} />);
    
    expect(screen.getByText('You haven\'t started any applications yet.')).toBeInTheDocument();
    expect(screen.getByText('You can start a new application on the \'Apply\' or \'Saved Programs\' pages.')).toBeInTheDocument();
    expect(screen.getByText('Start New Application')).toBeInTheDocument();
  });

  it('navigates to documents page when "View all" button is clicked', async () => {
    const user = userEvent.setup();
    
    render(<DocumentStats documentStats={mockDocumentStats} />);
    
    // Find and click the "View all" button
    const viewAllButton = screen.getByText('View all');
    await user.click(viewAllButton);
    
    // Check if navigate was called with the correct path
    expect(mockNavigate).toHaveBeenCalledWith('/documents');
  });

  it('navigates to saved page when "Start New Application" button is clicked in empty state', async () => {
    const user = userEvent.setup();
    
    render(<DocumentStats documentStats={[]} />);
    
    // Find and click the "Start New Application" button
    const startNewButton = screen.getByText('Start New Application');
    await user.click(startNewButton);
    
    // Check if navigate was called with the correct path
    expect(mockNavigate).toHaveBeenCalledWith('/saved');
  });
});
