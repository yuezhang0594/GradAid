import React, { useState, useCallback, useRef, useMemo } from 'react';
import { useProgramSearch } from '../hooks/useProgramSearch';
import { useFavorites } from '../hooks/useFavorites';
import ProgramSearch from '../components/search-programs/ProgramSearch';
import UniversityCard from '../components/search-programs/UniversityCard';
import { Id } from 'convex/_generated/dataModel';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

const FILTER_DELAY = 500; // delay for filtering to smooth UX
const ITEMS_PER_PAGE = 5; // Define how many items per page for pagination

/**
 * UniversitySearchPage Component
 * 
 * Renders a searchable and filterable page for graduate programs across universities.
 * 
 * Features:
 * - Advanced search functionality with filters
 * - Pagination with dynamic page loading
 * - Favorite/save program functionality for authenticated users
 * - Responsive layout with loading states
 * 
 * The component uses custom hooks:
 * - useUniversities: Manages university data, filtering, and pagination
 * - useFavorites: Handles saving/favoriting functionality
 * 
 * State management:
 * - Manages search query and filters with debouncing for slider filters
 * - Tracks pagination state and loading states
 * - Handles scroll position when changing pages
 * 
 * @returns React component displaying the university search interface with results
 */
const UniversitySearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const filterTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingPage, setIsLoadingPage] = useState(false);

  // Use the universities hook for fetching and filtering data
  const {
    universities,
    programIds,
    filters,
    updateFilters,
    loadMore,
    status,
    hasMore
  } = useProgramSearch(searchQuery);

  // Get the actual program objects for the programIds
  const programs = useQuery(api.programs.search.getProgramsByIds, {
    programIds: programIds || []
  }) || [];

  // Use the favorites hook to manage favorite programs
  const {
    toggleFavorite,
    isFavorite,
    favoritesLoading,
  } = useFavorites();

  // Map programs to their corresponding universities
  const universitiesWithFilteredPrograms = useMemo(() => {
    const programsByUniversityId = programs.reduce((acc, program) => {
      if (!program.universityId) return acc;

      if (!acc[program.universityId]) {
        acc[program.universityId] = [];
      }
      acc[program.universityId].push(program);
      return acc;
    }, {} as Record<string, any[]>);

    // Filter universities to only those with programs from our search
    const filteredUniversities = universities
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
    // Reset to first page when searching
    setCurrentPage(1);
  }, []);

  // Create a delayed filter handler
  const handleFilterChange = useCallback((newFilters: any, filterType?: string) => {
    if (filterTimeoutRef.current) {
      clearTimeout(filterTimeoutRef.current);
    }

    // Only apply delay for slider filters
    if (filterType === 'slider') {
      // Set a new timeout to apply filters after delay
      filterTimeoutRef.current = setTimeout(() => {
        updateFilters(newFilters);
        filterTimeoutRef.current = null;
      }, FILTER_DELAY);
    } else {
      updateFilters(newFilters);
    }

    setCurrentPage(1);
  }, [updateFilters]);

  // Clean up timeout on unmount
  React.useEffect(() => {
    return () => {
      if (filterTimeoutRef.current) {
        clearTimeout(filterTimeoutRef.current);
      }
    };
  }, []);

  // Calculate total number of pages
  const totalPages = hasMore ?
    Math.floor(universitiesWithFilteredPrograms.length / ITEMS_PER_PAGE) + 1 :
    Math.max(1, Math.ceil(universitiesWithFilteredPrograms.length / ITEMS_PER_PAGE));

  // Handle page change from pagination
  const handlePageChange = async (page: number) => {
    const maxLoadedPage = Math.ceil(universitiesWithFilteredPrograms.length / ITEMS_PER_PAGE);

    if (page > maxLoadedPage && hasMore) {
      setIsLoadingPage(true);
      await loadMore();
      setIsLoadingPage(false);
    }

    setCurrentPage(page);

    window.scrollTo({
      top: document.getElementById('results-section')?.offsetTop || 0,
      behavior: 'smooth'
    });
  };

  // Get universities for current page
  const getCurrentPageUniversities = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return universitiesWithFilteredPrograms.slice(startIndex, endIndex);
  };

  const currentUniversities = getCurrentPageUniversities();

  // Generate page numbers to display in pagination
  const getPageNumbers = () => {
    const pageNumbers = [];

    pageNumbers.push(1);

    const rangeStart = Math.max(2, currentPage - 1);
    const rangeEnd = Math.min(totalPages - 1, currentPage + 1);

    if (rangeStart > 2) {
      pageNumbers.push('ellipsis-start');
    }

    for (let i = rangeStart; i <= rangeEnd; i++) {
      pageNumbers.push(i);
    }

    if (rangeEnd < totalPages - 1) {
      pageNumbers.push('ellipsis-end');
    }

    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <header className="mb-8">
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl mb-2">Program Search</h1>
        <p className="text-muted-foreground">
          Find the perfect graduate program for your academic journey
        </p>
      </header>

      {/* Search component */}
      <div className="mb-8">
        <ProgramSearch
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
          initialFilters={filters}
          initialQuery={searchQuery}
        />
      </div>

      <Separator className="my-6" />

      {/* Results section */}
      <section id="results-section">
        {status === "LoadingFirstPage" || isLoadingPage || favoritesLoading ? (
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
            <div className="mb-4 flex justify-between items-center">
              <p className="text-muted-foreground">
                {programs.length} programs found across {universitiesWithFilteredPrograms.length} universities
              </p>
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {currentUniversities.map(university => (
                <UniversityCard
                  key={university._id}
                  university={university}
                  programs={university.filteredPrograms}
                  onSave={toggleFavorite}
                  isFavorite={isFavorite}
                />
              ))}
            </div>

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                        className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        aria-disabled={currentPage <= 1}
                      />
                    </PaginationItem>

                    {getPageNumbers().map((pageNum, idx) => (
                      pageNum === 'ellipsis-start' || pageNum === 'ellipsis-end' ? (
                        <PaginationItem key={`ellipsis-${idx}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      ) : (
                        <PaginationItem key={`page-${pageNum}`}>
                          <PaginationLink
                            onClick={() => handlePageChange(pageNum as number)}
                            isActive={currentPage === pageNum}
                            className="cursor-pointer"
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                        className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        aria-disabled={currentPage >= totalPages}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default UniversitySearchPage;
