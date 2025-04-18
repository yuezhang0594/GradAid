import React, { useState, useCallback, useMemo } from 'react';
import { useProgramSearch } from '../hooks/useProgramSearch';
import { useFavorites } from '../hooks/useFavorites';
import ProgramSearch from '../components/search-programs/ProgramSearch';
import UniversityCard from '../components/search-programs/UniversityCard';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { PageWrapper } from '@/components/ui/page-wrapper';

/**
 * UniversitySearchPage Component
 * 
 * Renders a searchable and filterable page for graduate programs across universities.
 * 
 * Features:
 * - Advanced search functionality with filters
 * - Favorite/save program functionality for authenticated users
 * - Responsive layout with loading states
 * 
 * The component uses custom hooks:
 * - useUniversities: Manages university data, filtering, and pagination
 * - useFavorites: Handles saving/favoriting functionality
 * 
 * State management:
 * - Manages search query and filters
 * - Handles loading states
 * 
 * @returns React component displaying the university search interface with results
 */
const UniversitySearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Use the universities hook for fetching and filtering data
  const {
    universities,
    programs,
    filters,
    updateFilters,
    uniqueDegreeTypes,
    uniqueLocations,
    isLoading,
  } = useProgramSearch(searchQuery);

  // Use the favorites hook to manage favorite programs
  const {
    toggleFavorite,
    isFavorite,
    favoritesLoading,
  } = useFavorites();

  // Map programs to their corresponding universities
  const universitiesWithFilteredPrograms = useMemo(() => { 
    const programsByUniversityId = (programs || []).reduce((acc, program) => {
      if (!program.universityId) return acc;

      if (!acc[program.universityId]) {
        acc[program.universityId] = [];
      }
      acc[program.universityId].push(program);
      return acc;
    }, {} as Record<string, any[]>);

    // Filter universities to only those with programs from our search
    const filteredUniversities = (universities || [])
      .filter(university => programsByUniversityId[university._id])
      .map(university => ({
        ...university,
        filteredPrograms: programsByUniversityId[university._id] || []
      }));

    return filteredUniversities;
  }, [universities, programs]);

  // Handle search query changes
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Simplified filter handler without delay
  const handleFilterChange = useCallback((newFilters: any) => {
    updateFilters(newFilters);
  }, [updateFilters]);

  return (
    <PageWrapper 
      title="Program Search" 
      description="Find the perfect graduate program for your academic journey"
    >
      {/* Search component */}
      <div className="mb-8">
        <ProgramSearch
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
          initialFilters={filters}
          initialQuery={searchQuery}
          uniqueDegreeTypes={uniqueDegreeTypes}
          uniqueLocations={uniqueLocations}
        />
      </div>

      <Separator className="my-6" />

      {/* Results section */}
      <section id="results-section">
        {isLoading || favoritesLoading ? (
          <div className="flex justify-center py-12">
            <div className="space-y-4 w-full">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-[300px] w-full" />
              <Skeleton className="h-[300px] w-full" />
            </div>
          </div>
        ) : universitiesWithFilteredPrograms.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent className="pt-10">
              <h3 className="text-xl font-medium text-gray-700 mb-2">No programs found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or filters to see more results.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-muted-foreground">
                {programs?.length ?? 0} programs found across {universitiesWithFilteredPrograms.length} universities
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {universitiesWithFilteredPrograms.map(university => (
                <UniversityCard
                  key={university._id}
                  university={university}
                  programs={university.filteredPrograms}
                  onSave={toggleFavorite}
                  isFavorite={isFavorite}
                />
              ))}
            </div>
          </>
        )}
      </section>
    </PageWrapper>
  );
};

export default UniversitySearchPage;
