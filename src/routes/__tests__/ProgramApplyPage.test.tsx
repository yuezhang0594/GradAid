import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Define types before mocks
type SavedProgram = {
  _id: string;
  name: string;
  university: {
    name: string;
  };
  [key: string]: any;
};

// Mock modules before importing the component
const mockNavigate = vi.fn();
const mockLocation = vi.fn();
const mockUseFavorites = vi.fn();

// Mock Convex hooks
vi.mock('convex/react', () => ({
  useMutation: () => vi.fn(),
  useQuery: vi.fn(() => [])
}));

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation()
}));

// Mock the useFavorites hook
vi.mock('@/hooks/useFavorites', () => ({
  useFavorites: () => mockUseFavorites()
}));

// Mock UI components
vi.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className }: { className: string }) => (
    <div data-testid="skeleton" className={className}>Loading...</div>
  )
}));

vi.mock('@/components/ui/empty-state', () => ({
  EmptyState: ({ title, description, actionLabel, actionHref }: {
    icon: React.ComponentType<any>, // Keep the icon parameter but mark it as unused
    title: string,
    description: string,
    actionLabel: string,
    actionHref: string
  }) => (
    <div data-testid="empty-state">
      <h3>{title}</h3>
      <p>{description}</p>
      <a data-testid="empty-state-action" href={actionHref}>
        {actionLabel}
      </a>
    </div>
  )
}));

vi.mock('@/components/ui/page-wrapper', () => ({
  PageWrapper: ({ children, title, description }: {
    children: React.ReactNode,
    title: string,
    description: string
  }) => (
    <div data-testid="page-wrapper" data-title={title} data-description={description}>
      {children}
    </div>
  )
}));

vi.mock('@/components/ui/alert', () => ({
  Alert: ({ children, className }: { children: React.ReactNode, className: string }) => (
    <div data-testid="alert" className={className}>{children}</div>
  ),
  AlertDescription: ({ children, className }: { children: React.ReactNode, className: string }) => (
    <div data-testid="alert-description" className={className}>{children}</div>
  )
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, variant, size, onClick, className }: {
    children: React.ReactNode,
    variant: string,
    size: string,
    onClick: () => void,
    className: string
  }) => (
    <button 
      data-testid="button"
      data-variant={variant}
      data-size={size}
      className={className}
      onClick={onClick}
    >
      {children}
    </button>
  )
}));

vi.mock('@/components/apply/apply-program-selector', () => ({
  default: ({ savedPrograms, initialProgramId, onSubmit }: {
    savedPrograms: SavedProgram[],
    initialProgramId: string,
    onSubmit: (programId: string) => void
  }) => (
    <div data-testid="apply-program-selector">
      <p>Program Selector</p>
      <button 
        data-testid="submit-program" 
        onClick={() => onSubmit(initialProgramId || savedPrograms[0]?._id || 'test-program-id')}
      >
        Apply to Program
      </button>
    </div>
  )
}));

vi.mock('@/components/apply/create-application-form', () => ({
  default: ({ programId }: { programId: string }) => (
    <div data-testid="create-application-form" data-program-id={programId}>
      Create Application Form
    </div>
  )
}));

vi.mock('lucide-react', () => ({
  BookmarkPlus: () => <div data-testid="bookmark-plus-icon">BookmarkPlus</div>,
  Search: () => <div data-testid="search-icon">Search</div>
}));

// Import the component after all mocks
import ProgramApplyPage from '../ProgramApplyPage';

describe('ProgramApplyPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementation
    mockUseFavorites.mockReturnValue({
      savedProgramsWithUniversity: [],
      favoritesLoading: false
    });
  });

  it('renders loading state when favorites are loading', () => {
    // Mock the useFavorites hook to indicate loading
    mockUseFavorites.mockReturnValue({
      savedProgramsWithUniversity: [],
      favoritesLoading: true
    });

    // Mock empty query parameters
    mockLocation.mockReturnValue({ search: '' });

    render(<ProgramApplyPage />);
    
    // Check that skeletons are rendered
    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders empty state when no saved programs exist', () => {
    // Mock the useFavorites hook to return empty results
    mockUseFavorites.mockReturnValue({
      savedProgramsWithUniversity: [],
      favoritesLoading: false
    });

    // Mock empty query parameters
    mockLocation.mockReturnValue({ search: '' });

    render(<ProgramApplyPage />);
    
    // Check that empty state is rendered
    const emptyState = screen.getByTestId('empty-state');
    expect(emptyState).toBeInTheDocument();
    expect(screen.getByText('No Saved Programs')).toBeInTheDocument();
    
    // Check that the action link points to the search page
    const actionLink = screen.getByTestId('empty-state-action');
    expect(actionLink).toHaveAttribute('href', '/search');
  });

  it('renders program selector when saved programs exist', () => {
    // Mock the useFavorites hook to return saved programs
    mockUseFavorites.mockReturnValue({
      savedProgramsWithUniversity: [
        { _id: 'prog1', name: 'Computer Science', university: { name: 'Stanford' } }
      ],
      favoritesLoading: false
    });

    // Mock empty query parameters
    mockLocation.mockReturnValue({ search: '' });

    render(<ProgramApplyPage />);
    
    // Check that program selector is rendered
    const programSelector = screen.getByTestId('apply-program-selector');
    expect(programSelector).toBeInTheDocument();
    
    // Check that the alert is rendered
    const alert = screen.getByTestId('alert');
    expect(alert).toBeInTheDocument();
  });

  it('renders create application form when programId and create parameters are present', () => {
    // Mock the useFavorites hook to return saved programs
    mockUseFavorites.mockReturnValue({
      savedProgramsWithUniversity: [
        { _id: 'prog1', name: 'Computer Science', university: { name: 'Stanford' } }
      ],
      favoritesLoading: false
    });

    // Mock query parameters with programId and create
    mockLocation.mockReturnValue({ 
      search: '?programId=prog1&create'
    });

    render(<ProgramApplyPage />);
    
    // Check that create application form is rendered
    const applicationForm = screen.getByTestId('create-application-form');
    expect(applicationForm).toBeInTheDocument();
    expect(applicationForm).toHaveAttribute('data-program-id', 'prog1');
  });

  it('navigates to create form when program is selected', () => {
    // Mock the useFavorites hook to return saved programs
    mockUseFavorites.mockReturnValue({
      savedProgramsWithUniversity: [
        { _id: 'prog1', name: 'Computer Science', university: { name: 'Stanford' } }
      ],
      favoritesLoading: false
    });

    // Mock empty query parameters
    mockLocation.mockReturnValue({ search: '' });

    render(<ProgramApplyPage />);
    
    // Click the submit button
    const submitButton = screen.getByTestId('submit-program');
    fireEvent.click(submitButton);
    
    // Check that navigate was called with the correct URL
    expect(mockNavigate).toHaveBeenCalledWith('/apply?programId=prog1&create');
  });

  it('navigates to search page when search button is clicked', () => {
    // Mock the useFavorites hook to return saved programs
    mockUseFavorites.mockReturnValue({
      savedProgramsWithUniversity: [
        { _id: 'prog1', name: 'Computer Science', university: { name: 'Stanford' } }
      ],
      favoritesLoading: false
    });

    // Mock empty query parameters
    mockLocation.mockReturnValue({ search: '' });

    render(<ProgramApplyPage />);
    
    // Click the search button
    const searchButton = screen.getByTestId('button');
    fireEvent.click(searchButton);
    
    // Check that navigate was called with the correct URL
    expect(mockNavigate).toHaveBeenCalledWith('/search');
  });
});
