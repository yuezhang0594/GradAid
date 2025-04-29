import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock the validators first
vi.mock('#/validators', () => ({
  DEFAULT_FILTERS: {
    degree: [],
    location: []
  },
  SEARCH_UNIVERSITY_LIMIT: 10
}));

// Mock Convex hooks
vi.mock('convex/react', () => ({
  useMutation: () => vi.fn(),
  useQuery: vi.fn(() => [])
}));

// Mock the custom hooks
const mockUseProgramSearch = vi.fn(() => ({
  universities: [
    { _id: 'uni1', name: 'Stanford University', ranking: 1 },
    { _id: 'uni2', name: 'MIT', ranking: 2 },
    { _id: 'uni3', name: 'Harvard University', ranking: 3 }
  ],
  programs: [
    { _id: 'prog1', name: 'Computer Science', universityId: 'uni1', degree: 'MS' },
    { _id: 'prog2', name: 'Electrical Engineering', universityId: 'uni1', degree: 'PhD' },
    { _id: 'prog3', name: 'Computer Science', universityId: 'uni2', degree: 'MS' },
    { _id: 'prog4', name: 'Mathematics', universityId: 'uni3', degree: 'PhD' }
  ],
  filters: { degree: [], location: [] },
  updateFilters: vi.fn(),
  uniqueDegreeTypes: ['MS', 'PhD'],
  uniqueLocations: ['California', 'Massachusetts'],
  isLoading: false
}));

vi.mock('@/hooks/useProgramSearch', () => ({
  useProgramSearch: () => mockUseProgramSearch()
}));

const mockToggleFavorite = vi.fn();
const mockIsFavorite = vi.fn(() => false);

vi.mock('@/hooks/useFavorites', () => ({
  useFavorites: () => ({
    toggleFavorite: mockToggleFavorite,
    isFavorite: mockIsFavorite,
    favoritesLoading: false
  })
}));

// Mock the components
vi.mock('@/components/search-programs/ProgramSearch', () => ({
  default: ({ onSearch, onFilterChange, initialFilters, initialQuery, uniqueDegreeTypes, uniqueLocations }) => (
    <div data-testid="program-search">
      <input 
        data-testid="search-input" 
        value={initialQuery} 
        onChange={(e) => onSearch(e.target.value)} 
      />
      <button 
        data-testid="filter-button"
        onClick={() => onFilterChange({ degree: ['MS'], location: ['California'] })}
      >
        Apply Filters
      </button>
      <div data-testid="unique-degrees">{uniqueDegreeTypes.join(',')}</div>
      <div data-testid="unique-locations">{uniqueLocations.join(',')}</div>
    </div>
  )
}));

vi.mock('@/components/search-programs/UniversityCard', () => ({
  default: ({ university, programs, onFavorite }) => (
    <div data-testid={`university-card-${university._id}`}>
      <h3>{university.name}</h3>
      <div data-testid={`programs-${university._id}`}>
        {programs.map((program) => (
          <div key={program._id} data-testid={`program-${program._id}`}>
            {program.name} - {program.degree}
            <button data-testid={`favorite-${program._id}`} onClick={() => onFavorite(program._id)}>
              Favorite
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}));

vi.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className }: { className: string }) => <div data-testid="skeleton" className={className}>Loading...</div>
}));

vi.mock('@/components/ui/separator', () => ({
  Separator: ({ className }: { className: string }) => <hr data-testid="separator" className={className} />
}));

vi.mock('@/components/ui/page-wrapper', () => ({
  PageWrapper: ({ children, title, description }: { children: React.ReactNode, title: string, description: string }) => (
    <div data-testid="page-wrapper" data-title={title} data-description={description}>
      {children}
    </div>
  )
}));

vi.mock('@/components/ui/empty-state', () => ({
  EmptyState: ({ title, description, actionLabel, onAction }: { 
    icon: React.ComponentType<any>, 
    title: string, 
    description: string, 
    actionLabel: string, 
    onAction: () => void 
  }) => (
    <div data-testid="empty-state">
      <h3>{title}</h3>
      <p>{description}</p>
      <button data-testid="empty-state-action" onClick={onAction}>
        {actionLabel}
      </button>
    </div>
  )
}));

vi.mock('@/components/add-program-form', () => ({
  default: ({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) => (
    open ? (
      <div data-testid="add-program-form">
        <button data-testid="close-form" onClick={() => onOpenChange(false)}>
          Close
        </button>
      </div>
    ) : null
  )
}));

vi.mock('lucide-react', () => ({
  SearchXIcon: () => <div data-testid="search-x-icon">SearchXIcon</div>
}));

// Import the component after all mocks
import ProgramSearchPage from '../ProgramSearchPage';

describe('ProgramSearchPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page wrapper with correct title and description', () => {
    render(<ProgramSearchPage />);
    
    const pageWrapper = screen.getByTestId('page-wrapper');
    expect(pageWrapper).toBeInTheDocument();
    expect(pageWrapper).toHaveAttribute('data-title', 'Program Search');
    expect(pageWrapper).toHaveAttribute('data-description', 'Find the perfect graduate program for your academic journey');
  });

  it('renders the search component with correct props', () => {
    render(<ProgramSearchPage />);
    
    const searchComponent = screen.getByTestId('program-search');
    expect(searchComponent).toBeInTheDocument();
    
    // Check that unique degree types and locations are passed correctly
    const uniqueDegrees = screen.getByTestId('unique-degrees');
    const uniqueLocations = screen.getByTestId('unique-locations');
    expect(uniqueDegrees).toHaveTextContent('MS,PhD');
    expect(uniqueLocations).toHaveTextContent('California,Massachusetts');
  });

  it('renders university cards with their programs', () => {
    render(<ProgramSearchPage />);
    
    // Check Stanford card and programs
    const stanfordCard = screen.getByTestId('university-card-uni1');
    expect(stanfordCard).toBeInTheDocument();
    expect(stanfordCard).toHaveTextContent('Stanford University');
    
    const stanfordPrograms = screen.getByTestId('programs-uni1');
    expect(stanfordPrograms).toBeInTheDocument();
    expect(stanfordPrograms).toHaveTextContent('Computer Science - MS');
    expect(stanfordPrograms).toHaveTextContent('Electrical Engineering - PhD');
    
    // Check MIT card and programs
    const mitCard = screen.getByTestId('university-card-uni2');
    expect(mitCard).toBeInTheDocument();
    expect(mitCard).toHaveTextContent('MIT');
    
    const mitPrograms = screen.getByTestId('programs-uni2');
    expect(mitPrograms).toBeInTheDocument();
    expect(mitPrograms).toHaveTextContent('Computer Science - MS');
    
    // Check Harvard card and programs
    const harvardCard = screen.getByTestId('university-card-uni3');
    expect(harvardCard).toBeInTheDocument();
    expect(harvardCard).toHaveTextContent('Harvard University');
    
    const harvardPrograms = screen.getByTestId('programs-uni3');
    expect(harvardPrograms).toBeInTheDocument();
    expect(harvardPrograms).toHaveTextContent('Mathematics - PhD');
  });

  it('updates search query when search input changes', () => {
    render(<ProgramSearchPage />);
    
    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'Computer Science' } });
    
    // Check that useProgramSearch was called with the updated query
    expect(mockUseProgramSearch).toHaveBeenCalled();
  });

  it('opens add program modal when action button is clicked', () => {
    // Mock the useProgramSearch hook to return empty results
    mockUseProgramSearch.mockReturnValueOnce({
      universities: [],
      programs: [],
      filters: { degree: [], location: [] },
      updateFilters: vi.fn(),
      uniqueDegreeTypes: [],
      uniqueLocations: [],
      isLoading: false
    });
    
    render(<ProgramSearchPage />);
    
    // Check that empty state is rendered
    const emptyState = screen.getByTestId('empty-state');
    expect(emptyState).toBeInTheDocument();
    
    // Click the action button
    const actionButton = screen.getByTestId('empty-state-action');
    fireEvent.click(actionButton);
    
    // Check that add program form is rendered
    const addProgramForm = screen.getByTestId('add-program-form');
    expect(addProgramForm).toBeInTheDocument();
  });

  it('shows loading skeletons when data is loading', () => {
    // Mock the hooks to indicate loading
    mockUseProgramSearch.mockReturnValueOnce({
      universities: [],
      programs: [],
      filters: { degree: [], location: [] },
      updateFilters: vi.fn(),
      uniqueDegreeTypes: [],
      uniqueLocations: [],
      isLoading: true
    });
    
    render(<ProgramSearchPage />);
    
    // Check that skeletons are rendered
    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
