import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '../../../test/utils';
import ApplicationsPage from '../applications';
import { Id } from "#/_generated/dataModel";

// Mock the Id type for tests
vi.mock("#/_generated/dataModel", () => ({
  Id: {
    fromString: (id: string) => id,
  },
}));

// Mock the Convex API
vi.mock("#/_generated/api", () => ({
  api: {
    applications: {
      queries: {
        getApplications: "applications:getApplications",
      },
    },
  },
}));

// Mock the Convex hooks
vi.mock('convex/react', () => ({
  useQuery: vi.fn(),
}));

// Mock React Router
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

// Mock the empty state component
vi.mock('@/components/ui/empty-state', () => ({
  EmptyState: ({ 
    title, 
    description, 
    actionLabel, 
    actionHref 
  }: { 
    title: string, 
    description: string, 
    actionLabel?: string, 
    actionHref?: string 
  }) => (
    <div data-testid="empty-state">
      <h3>{title}</h3>
      <p>{description}</p>
      {actionLabel && <a href={actionHref}>{actionLabel}</a>}
    </div>
  ),
}));

// Mock the card wrapper component
vi.mock('@/components/ui/card-wrapper', () => ({
  CardWrapper: ({ title, description, children, onClick }: {
    title: string;
    description: string;
    children: React.ReactNode;
    onClick: () => void;
  }) => (
    <div data-testid={`application-card-${title}`} onClick={onClick}>
      <h3>{title}</h3>
      <p>{description}</p>
      <div>{children}</div>
    </div>
  ),
}));

// Mock the page wrapper component
vi.mock('@/components/ui/page-wrapper', () => ({
  PageWrapper: ({ title, description, children }: {
    title: string;
    description: string;
    children: React.ReactNode;
  }) => (
    <div data-testid="page-wrapper" data-title={title} data-description={description}>
      {children}
    </div>
  ),
}));

import { useQuery } from 'convex/react';

describe('ApplicationsPage Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders the page wrapper with correct title and description', () => {
    vi.mocked(useQuery).mockReturnValue([]);
    
    render(<ApplicationsPage />);
    
    const pageWrapper = screen.getByTestId('page-wrapper');
    expect(pageWrapper).toBeInTheDocument();
    expect(pageWrapper).toHaveAttribute('data-title', 'Applications');
    expect(pageWrapper).toHaveAttribute('data-description', 'View deadlines, requirements, and progress for each university.');
  });

  it('shows empty state when no applications are found', () => {
    vi.mocked(useQuery).mockReturnValue([]);
    
    render(<ApplicationsPage />);
    
    const emptyState = screen.getByTestId('empty-state');
    expect(emptyState).toBeInTheDocument();
    expect(screen.getByText('No Applications Found')).toBeInTheDocument();
    expect(screen.getByText(/You haven't started any applications yet./)).toBeInTheDocument();
    
    const actionLink = screen.getByText('Start New Application');
    expect(actionLink).toHaveAttribute('href', '/apply');
    expect(actionLink).toHaveTextContent('Start New Application');
  });

  it('renders application cards when applications exist', () => {
    const mockApplications = [
      {
        id: 'app1' as unknown as Id<"applications">,
        university: 'Stanford University',
        program: 'Computer Science',
        degree: 'MS',
        status: 'in_progress' as const,
        priority: 'high' as const,
        deadline: '2023-12-15',
        documentsComplete: 2,
        totalDocuments: 5,
        progress: 40
      },
      {
        id: 'app2' as unknown as Id<"applications">,
        university: 'MIT',
        program: 'Electrical Engineering',
        degree: 'PhD',
        status: 'submitted' as const,
        priority: 'medium' as const,
        deadline: '2023-11-30',
        documentsComplete: 4,
        totalDocuments: 4,
        progress: 100
      }
    ];
    
    vi.mocked(useQuery).mockReturnValue(mockApplications);
    
    render(<ApplicationsPage />);
    
    // Check that application cards are rendered
    const stanfordCard = screen.getByTestId('application-card-Stanford University');
    const mitCard = screen.getByTestId('application-card-MIT');
    
    expect(stanfordCard).toBeInTheDocument();
    expect(mitCard).toBeInTheDocument();
    
    // Check application details
    expect(screen.getByText('Stanford University')).toBeInTheDocument();
    expect(screen.getByText('MS in Computer Science')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
    
    expect(screen.getByText('MIT')).toBeInTheDocument();
    expect(screen.getByText('PhD in Electrical Engineering')).toBeInTheDocument();
    expect(screen.getByText('Submitted')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
  });
});
