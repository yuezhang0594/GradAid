// Mock modules before importing anything
vi.mock('convex/react', () => ({
  useQuery: vi.fn().mockReturnValue([])
}));

vi.mock('#/_generated/api', () => ({
  api: {
    search: {
      search: {
        searchPrograms: {},
        getUniversitiesForPrograms: {},
        getUniqueLocations: {},
        getUniqueDegreeTypes: {}
      }
    },
    programs: {
      queries: {
        getProgramsByIds: {}
      }
    }
  }
}));

// Mock with inline object to avoid variable hoisting issues
vi.mock('#/validators', () => ({
  DEFAULT_FILTERS: {
    programType: 'all',
    location: { state: 'all', city: 'all' },
    ranking: 'all',
    gre: false,
    toefl: false,
    minimumGPA: undefined,
  },
  SearchFilters: {}
}));

// Now import everything after mocks are defined
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useProgramSearch } from '../useProgramSearch';
import { useQuery } from 'convex/react';

// Define a type for the mocked function
type MockedFunction = ReturnType<typeof vi.fn>;

describe('useProgramSearch Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Set up mock return values for each test
    (useQuery as unknown as MockedFunction).mockReturnValue(['prog1', 'prog2', 'prog3']);
  });

  it('initializes with default filters', () => {
    const { result } = renderHook(() => useProgramSearch());
    
    // Check if filters are initialized
    expect(result.current.filters).toBeDefined();
    expect(result.current.filters.programType).toBe('all');
    // Use optional chaining to handle possibly undefined location
    expect(result.current.filters.location?.state).toBe('all');
    expect(result.current.filters.location?.city).toBe('all');
    expect(result.current.filters.ranking).toBe('all');
    expect(result.current.filters.gre).toBe(false);
    expect(result.current.filters.toefl).toBe(false);
    expect(result.current.filters.minimumGPA).toBeUndefined();
  });

  it('updates filters correctly', () => {
    const { result } = renderHook(() => useProgramSearch());
    
    // Update location filter
    act(() => {
      result.current.updateFilters({ 
        location: { city: 'Stanford', state: 'California' } 
      });
    });
    
    // Check if location filter is updated
    expect(result.current.filters.location?.city).toBe('Stanford');
    expect(result.current.filters.location?.state).toBe('California');
    expect(result.current.filters.programType).toBe('all'); // Should preserve default
    
    // Update multiple filters
    act(() => {
      result.current.updateFilters({ 
        gre: true,
        programType: 'MS' 
      });
    });
    
    // Check if all filters are correctly applied
    expect(result.current.filters.location?.city).toBe('Stanford'); // Should preserve previous update
    expect(result.current.filters.location?.state).toBe('California'); // Should preserve previous update
    expect(result.current.filters.gre).toBe(true); // Should be updated
    expect(result.current.filters.programType).toBe('MS'); // Should be updated
  });

  it('handles loading state correctly', () => {
    // Mock undefined returns to simulate loading
    (useQuery as unknown as MockedFunction).mockReturnValue(undefined);
    
    const { result } = renderHook(() => useProgramSearch());
    
    // Check loading state when data is undefined
    expect(result.current.isLoading).toBe(true);
    
    // The hook returns undefined for programs and universities during loading
    expect(result.current.programs).toBeUndefined();
    expect(result.current.universities).toBeUndefined();
  });
});
