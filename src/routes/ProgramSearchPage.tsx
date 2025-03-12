import React, { useState, useCallback, useRef } from 'react';
import { useUniversities } from '../hooks/useUniversities';
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

const FILTER_DELAY = 500; // delay for filtering to smooth UX
const ITEMS_PER_PAGE = 5; // Define how many items per page for pagination

const UniversitySearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [favoriteIds, setFavoriteIds] = useState<Map<string, Set<string>>>(new Map());
  const filterTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingPage, setIsLoadingPage] = useState(false);

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
    // Reset to first page when searching
    setCurrentPage(1);
  }, []);

  // Create a delayed filter handler
  const handleFilterChange = useCallback((newFilters: any, filterType?: string) => {
    // Clear any pending timeout
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
      // Apply other filter changes immediately
      updateFilters(newFilters);
    }
    
    // Reset to first page when filters change
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

  // Calculate total number of pages based on loaded universities and hasMore
  const totalPages = hasMore ? Math.floor(universities.length / ITEMS_PER_PAGE) + 1 : Math.max(1, Math.ceil(universities.length / ITEMS_PER_PAGE));

  // Handle page change from pagination
  const handlePageChange = async (page: number) => {
    const maxLoadedPage = Math.ceil(universities.length / ITEMS_PER_PAGE);
    
    // If requesting a page beyond currently loaded data and more data is available
    if (page > maxLoadedPage && hasMore) {
      setIsLoadingPage(true);
      await loadMore();
      setIsLoadingPage(false);
    }
    
    setCurrentPage(page);
    
    // Scroll to top of results
    window.scrollTo({
      top: document.getElementById('results-section')?.offsetTop || 0,
      behavior: 'smooth'
    });
  };

  // Get universities for current page
  const getCurrentPageUniversities = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return universities.slice(startIndex, endIndex);
  };

  const currentUniversities = getCurrentPageUniversities();

  // Generate page numbers to display in pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    
    // Always show first page
    pageNumbers.push(1);
    
    // Show pages around current page
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
    
    // Always show last page if there are multiple pages
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
        {(loading && status === "LoadingFirstPage") || isLoadingPage ? (
          <div className="flex justify-center py-12">
            <div className="space-y-4 w-full">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-[300px] w-full" />
              <Skeleton className="h-[300px] w-full" />
            </div>
          </div>
        ) : universities.length === 0 ? (
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
                {universities.reduce((count, university) => count + (university.programs?.length || 0), 0)} results found
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
                  onSave={handleSave}
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
