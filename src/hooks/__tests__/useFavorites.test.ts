import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

// Mock Convex functions
vi.mock('convex/react', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn()
}));

vi.mock('#/_generated/api', () => ({
  api: {
    programs: {
      favorites: {
        toggleFavorite: 'programs.favorites.toggleFavorite',
        getFavoriteProgramIds: 'programs.favorites.getFavoriteProgramIds',
        getFavoritePrograms: 'programs.favorites.getFavoritePrograms',
        getFavoriteProgramsWithUniversity: 'programs.favorites.getFavoriteProgramsWithUniversity'
      }
    }
  }
}));

// Import after mocking
import { useFavorites } from '../useFavorites';
import { useQuery, useMutation } from 'convex/react';
import { Id } from '#/_generated/dataModel';

// Define a type for the mocked function
type MockedFunction = ReturnType<typeof vi.fn>;

describe('useFavorites Hook', () => {
  // Mock data
  const mockFavoriteProgramIds = [
    { programId: 'prog1' as unknown as Id<"programs"> },
    { programId: 'prog2' as unknown as Id<"programs"> }
  ];
  
  const mockFavoritePrograms = [
    { _id: 'prog1' as unknown as Id<"programs">, name: 'Computer Science' },
    { _id: 'prog2' as unknown as Id<"programs">, name: 'Data Science' }
  ];
  
  const mockProgramsWithUniversity = [
    { 
      program: { _id: 'prog1' as unknown as Id<"programs">, name: 'Computer Science' },
      university: { _id: 'uni1' as unknown as Id<"universities">, name: 'Stanford' }
    },
    { 
      program: { _id: 'prog2' as unknown as Id<"programs">, name: 'Data Science' },
      university: { _id: 'uni2' as unknown as Id<"universities">, name: 'MIT' }
    }
  ];
  
  const mockToggleFavorite = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock useQuery
    (useQuery as MockedFunction).mockImplementation((query) => {
      if (query === 'programs.favorites.getFavoriteProgramIds') {
        return mockFavoriteProgramIds;
      } else if (query === 'programs.favorites.getFavoritePrograms') {
        return mockFavoritePrograms;
      } else if (query === 'programs.favorites.getFavoriteProgramsWithUniversity') {
        return mockProgramsWithUniversity;
      }
      return undefined;
    });
    
    // Mock useMutation
    (useMutation as MockedFunction).mockReturnValue(mockToggleFavorite);
  });
  
  it('should return favorite program IDs', () => {
    const { result } = renderHook(() => useFavorites());
    
    // Check if getFavoriteProgramIds returns the correct data
    expect(result.current.getFavoriteProgramIds()).toEqual(mockFavoriteProgramIds);
    
    // Check if favoritesLoading is false when data is available
    expect(result.current.favoritesLoading).toBe(false);
  });
  
  it('should return favorite programs', () => {
    const { result } = renderHook(() => useFavorites());
    
    // Check if getFavoritePrograms returns the correct data
    expect(result.current.getFavoritePrograms()).toEqual(mockFavoritePrograms);
  });
  
  it('should return saved programs with university', () => {
    const { result } = renderHook(() => useFavorites());
    
    // Check if savedProgramsWithUniversity returns the correct data
    expect(result.current.savedProgramsWithUniversity).toEqual(mockProgramsWithUniversity);
  });
  
  it('should check if a program is favorited', () => {
    const { result } = renderHook(() => useFavorites());
    
    // Should return true for favorited program
    expect(result.current.isFavorite('prog1' as unknown as Id<"programs">)).toBe(true);
    
    // Should return false for non-favorited program
    expect(result.current.isFavorite('prog3' as unknown as Id<"programs">)).toBe(false);
  });
  
  it('should toggle a program as favorite', () => {
    const { result } = renderHook(() => useFavorites());
    
    // Call toggleFavorite
    result.current.toggleFavorite('prog3' as unknown as Id<"programs">);
    
    // Check if toggleFavorite mutation was called with correct arguments
    expect(mockToggleFavorite).toHaveBeenCalledWith({ programId: 'prog3' });
  });
  
  it('should handle loading state', () => {
    // Mock loading state
    (useQuery as MockedFunction).mockReturnValue(undefined);
    
    const { result } = renderHook(() => useFavorites());
    
    // Check if favoritesLoading is true when data is undefined
    expect(result.current.favoritesLoading).toBe(true);
    
    // Check if getFavoriteProgramIds returns empty array during loading
    expect(result.current.getFavoriteProgramIds()).toEqual([]);
    
    // Check if getFavoritePrograms returns empty array during loading
    expect(result.current.getFavoritePrograms()).toEqual([]);
    
    // Check if isFavorite returns false during loading
    expect(result.current.isFavorite('prog1' as unknown as Id<"programs">)).toBe(false);
  });
});
