import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Define types before mocks
type SavedProgram = {
  _id: string;
  _creationTime: number;
  name: string;
  degree: string;
  department: string;
  deadlines: { fall: string };
  requirements: {
    gre: boolean;
    toefl: boolean;
    minimumGPA: number;
  };
  university: {
    name: string;
    location: { city: string; state: string };
    website: string;
  };
  [key: string]: any;
};

// Mock modules before importing the component
const mockNavigate = vi.fn();
const mockToggleFavorite = vi.fn();
const mockUseFavorites = vi.fn();

// Mock Convex hooks
vi.mock('convex/react', () => ({
  useMutation: () => mockToggleFavorite,
  useQuery: vi.fn(() => [])
}));

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}));

// Mock the useFavorites hook
vi.mock('@/hooks/useFavorites', () => ({
  useFavorites: () => mockUseFavorites()
}));

// Mock the formatDate function
vi.mock('@/lib/formatDate', () => ({
  default: (date: string) => date ? new Date(date).toLocaleDateString() : 'No date'
}));

// Mock UI components
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, variant, size, onClick, className, asChild }: {
    children: React.ReactNode,
    variant?: string,
    size?: string,
    onClick?: () => void,
    className?: string,
    asChild?: boolean
  }) => (
    asChild ? (
      <div data-testid="button-as-child" data-variant={variant} className={className}>
        {children}
      </div>
    ) : (
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
  )
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div data-testid="card" className={className}>{children}</div>
  ),
  CardContent: ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div data-testid="card-content" className={className}>{children}</div>
  ),
  CardDescription: ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div data-testid="card-description" className={className}>{children}</div>
  ),
  CardTitle: ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div data-testid="card-title" className={className}>{children}</div>
  ),
  CardFooter: ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div data-testid="card-footer" className={className}>{children}</div>
  )
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className }: { 
    children: React.ReactNode, 
    variant?: string, 
    className?: string 
  }) => (
    <span data-testid="badge" data-variant={variant} className={className}>{children}</span>
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

vi.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className }: { className: string }) => (
    <div data-testid="skeleton" className={className}>Loading...</div>
  )
}));

vi.mock('@/components/ui/page-wrapper', () => ({
  PageWrapper: ({ children, title, description }: {
    children: React.ReactNode,
    title: string,
    description?: string
  }) => (
    <div data-testid="page-wrapper" data-title={title} data-description={description}>
      {children}
    </div>
  )
}));

vi.mock('lucide-react', () => ({
  BookmarkX: () => <div data-testid="bookmark-x-icon">BookmarkX</div>,
  ExternalLink: () => <div data-testid="external-link-icon">ExternalLink</div>,
  Calendar: () => <div data-testid="calendar-icon">Calendar</div>,
  X: () => <div data-testid="x-icon">X</div>
}));

// Import the component after all mocks
import SavedProgramsPage from '../SavedProgramsPage';

describe('SavedProgramsPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementation
    mockUseFavorites.mockReturnValue({
      toggleFavorite: mockToggleFavorite,
      savedProgramsWithUniversity: [],
      favoritesLoading: false
    });
  });

  it('renders loading state when favorites are loading', () => {
    // Mock the useFavorites hook to indicate loading
    mockUseFavorites.mockReturnValue({
      toggleFavorite: mockToggleFavorite,
      savedProgramsWithUniversity: [],
      favoritesLoading: true
    });

    render(<SavedProgramsPage />);
    
    // Check that skeletons are rendered
    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders empty state when no saved programs exist', () => {
    // Mock the useFavorites hook to return empty results
    mockUseFavorites.mockReturnValue({
      toggleFavorite: mockToggleFavorite,
      savedProgramsWithUniversity: [],
      favoritesLoading: false
    });

    render(<SavedProgramsPage />);
    
    // Check that empty state is rendered
    const emptyState = screen.getByTestId('empty-state');
    expect(emptyState).toBeInTheDocument();
    expect(screen.getByText('No saved programs')).toBeInTheDocument();
    
    // Check that the action link points to the search page
    const actionLink = screen.getByTestId('empty-state-action');
    expect(actionLink).toHaveAttribute('href', '/search');
  });

  it('renders saved programs when they exist', () => {
    // Mock saved programs data
    const mockSavedPrograms: SavedProgram[] = [
      {
        _id: 'prog1',
        _creationTime: new Date('2023-01-01').getTime(),
        name: 'Computer Science',
        degree: 'MS',
        department: 'School of Computing',
        deadlines: { fall: '2023-12-15' },
        requirements: {
          gre: true,
          toefl: true,
          minimumGPA: 3.0
        },
        university: {
          name: 'Stanford University',
          location: { city: 'Stanford', state: 'CA' },
          website: 'https://stanford.edu'
        }
      }
    ];

    // Mock the useFavorites hook to return saved programs
    mockUseFavorites.mockReturnValue({
      toggleFavorite: mockToggleFavorite,
      savedProgramsWithUniversity: mockSavedPrograms,
      favoritesLoading: false
    });

    render(<SavedProgramsPage />);
    
    // Check that program card is rendered
    const card = screen.getByTestId('card');
    expect(card).toBeInTheDocument();
    
    // Check that program details are displayed
    expect(screen.getByText('MS in Computer Science')).toBeInTheDocument();
    expect(screen.getByText(/Stanford University/)).toBeInTheDocument();
    expect(screen.getByText(/School of Computing/)).toBeInTheDocument();
    
    // Check that requirements are displayed
    expect(screen.getAllByTestId('badge')).toHaveLength(3); // GRE, TOEFL, GPA badges
    expect(screen.getByText('GRE Required')).toBeInTheDocument();
    expect(screen.getByText('TOEFL Required')).toBeInTheDocument();
    expect(screen.getByText(/GPA: .*\+/)).toBeInTheDocument();
  });

  it('calls toggleFavorite when remove button is clicked', () => {
    // Mock saved programs data
    const mockSavedPrograms: SavedProgram[] = [
      {
        _id: 'prog1',
        _creationTime: new Date('2023-01-01').getTime(),
        name: 'Computer Science',
        degree: 'MS',
        department: 'School of Computing',
        deadlines: { fall: '2023-12-15' },
        requirements: {
          gre: true,
          toefl: true,
          minimumGPA: 3.0
        },
        university: {
          name: 'Stanford University',
          location: { city: 'Stanford', state: 'CA' },
          website: 'https://stanford.edu'
        }
      }
    ];

    // Mock the useFavorites hook to return saved programs
    mockUseFavorites.mockReturnValue({
      toggleFavorite: mockToggleFavorite,
      savedProgramsWithUniversity: mockSavedPrograms,
      favoritesLoading: false
    });

    render(<SavedProgramsPage />);
    
    // Find and click the remove button
    const removeButtons = screen.getAllByTestId('button');
    const removeButton = removeButtons.find(button => 
      button.textContent?.includes('X') || 
      button.innerHTML.includes('X')
    );
    
    if (removeButton) {
      fireEvent.click(removeButton);
      
      // Check that toggleFavorite was called with the correct program ID
      expect(mockToggleFavorite).toHaveBeenCalledWith('prog1');
    } else {
      throw new Error('Remove button not found');
    }
  });

  it('navigates to application page when Start Application button is clicked', () => {
    // Mock saved programs data
    const mockSavedPrograms: SavedProgram[] = [
      {
        _id: 'prog1',
        _creationTime: new Date('2023-01-01').getTime(),
        name: 'Computer Science',
        degree: 'MS',
        department: 'School of Computing',
        deadlines: { fall: '2023-12-15' },
        requirements: {
          gre: true,
          toefl: true,
          minimumGPA: 3.0
        },
        university: {
          name: 'Stanford University',
          location: { city: 'Stanford', state: 'CA' },
          website: 'https://stanford.edu'
        }
      }
    ];

    // Mock the useFavorites hook to return saved programs
    mockUseFavorites.mockReturnValue({
      toggleFavorite: mockToggleFavorite,
      savedProgramsWithUniversity: mockSavedPrograms,
      favoritesLoading: false
    });

    render(<SavedProgramsPage />);
    
    // Find and click the Start Application button
    const buttons = screen.getAllByTestId('button');
    const applyButton = buttons.find(button => 
      button.textContent?.includes('Start Application')
    );
    
    if (applyButton) {
      fireEvent.click(applyButton);
      
      // Check that navigate was called with the correct URL
      expect(mockNavigate).toHaveBeenCalledWith('/apply?programId=prog1&create');
    } else {
      throw new Error('Start Application button not found');
    }
  });
});
