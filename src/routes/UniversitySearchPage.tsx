import React, { useState, useCallback } from 'react';
import { useUniversities } from '../hooks/useUniversities';
import UniversitySearch from '../components/universities/UniversitySearch';
import UniversityCard from '../components/universities/UniversityCard';
import { Id } from 'convex/_generated/dataModel';

const UniversitySearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [favoriteIds, setFavoriteIds] = useState<Map<string, Set<string>>>(new Map());
  
  // Use the universities hook for fetching and filtering data
  const {
    universities,
    filters,
    updateFilters,
    loadMore,
    toggleFavorite,
    status,
    loading,
    hasMore
  } = useUniversities(searchQuery);
  
  // Handle search query changes
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);
  
  // Handle saving/favoriting a university or program
  const handleSave = useCallback((universityId: string, programId?: string) => {
    toggleFavorite(universityId as Id<"universities">);
    
    // Update local favorite state for immediate UI feedback
    setFavoriteIds(prev => {
      const newMap = new Map(prev);
      
      if (!newMap.has(universityId)) {
        newMap.set(universityId, new Set());
      }
      
      const programSet = newMap.get(universityId)!;
      
      if (programId) {
        if (programSet.has(programId)) {
          programSet.delete(programId);
        } else {
          programSet.add(programId);
        }
      } else {
        // If just the university is being toggled
        if (programSet.size > 0) {
          newMap.delete(universityId);
        } else {
          newMap.set(universityId, new Set());
        }
      }
      
      return newMap;
    });
  }, [toggleFavorite]);
  
  // Check if a university or program is favorited
  const isFavorite = useCallback((universityId: string, programId?: string) => {
    if (!favoriteIds.has(universityId)) return false;
    if (programId) {
      return favoriteIds.get(universityId)?.has(programId) || false;
    }
    return true;
  }, [favoriteIds]);

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">University Search</h1>
        <p className="text-gray-600">
          Find the perfect graduate program for your academic journey
        </p>
      </header>
      
      {/* Search component */}
      <div className="mb-8">
        <UniversitySearch
          onSearch={handleSearch}
          onFilterChange={updateFilters}
          initialFilters={filters}
          initialQuery={searchQuery}
        />
      </div>
      
      {/* Results section */}
      <section>
        {loading && status === "LoadingFirstPage" ? (
          <div className="flex justify-center py-12">
            <div className="animate-pulse text-center">
              <p className="text-gray-500">Loading universities...</p>
            </div>
          </div>
        ) : universities.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-medium text-gray-700 mb-2">No universities found</h3>
            <p className="text-gray-500">
              Try adjusting your search criteria or filters to see more results.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-gray-600">{universities.length} results found</p>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {universities.map(university => (
                <UniversityCard
                  key={university._id}
                  university={university}
                  onSave={handleSave}
                  isFavorite={isFavorite}
                />
              ))}
            </div>
            
            {/* Pagination */}
            {hasMore && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading && status === "LoadingMore" ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading more...
                    </>
                  ) : (
                    "Load More Universities"
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default UniversitySearchPage;
