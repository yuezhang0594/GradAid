import React, { useState, useCallback, useMemo } from "react";
import { useProgramSearch } from "../hooks/useProgramSearch";
import { useFavorites } from "../hooks/useFavorites";
import ProgramSearch from "../components/search-programs/ProgramSearch";
import UniversityCard from "../components/search-programs/UniversityCard";
import { Skeleton, Separator, PageWrapper, EmptyState } from "@/components/ui";
import { SEARCH_UNIVERSITY_LIMIT } from "#/validators";
import AddProgramForm from "@/components/add-program-form";
import { SearchXIcon } from "lucide-react";

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
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showAddProgramModal, setShowAddProgramModal] = useState(false);

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
  const { toggleFavorite, isFavorite, favoritesLoading } = useFavorites();

  // Map programs to their corresponding universities
  const universitiesWithFilteredPrograms = useMemo(() => {
    const programsByUniversityId = (programs || []).reduce(
      (acc, program) => {
        if (!program.universityId) return acc;

        if (!acc[program.universityId]) {
          acc[program.universityId] = [];
        }
        acc[program.universityId].push(program);
        return acc;
      },
      {} as Record<string, any[]>
    );

    // Filter universities to only those with programs from our search
    const filteredUniversities = (universities || [])
      .filter((university) => programsByUniversityId[university._id])
      .map((university) => ({
        ...university,
        filteredPrograms: programsByUniversityId[university._id] || [],
      }));

    return filteredUniversities;
  }, [universities, programs]);

  const universitiesToDisplay = useMemo(() => {
    // Order the universities by ranking
    return (
      universitiesWithFilteredPrograms
        .sort((a, b) => {
          // Use nullish coalescing operator to handle undefined rankings
          // Universities without rankings will be placed at the end
          return (a.ranking ?? Infinity) - (b.ranking ?? Infinity);
        })
        // Limit the number of universities displayed
        .slice(0, SEARCH_UNIVERSITY_LIMIT)
    );
  }, [universitiesWithFilteredPrograms]);

  // Handle search query changes
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Simplified filter handler without delay
  const handleFilterChange = useCallback(
    (newFilters: any) => {
      updateFilters(newFilters);
    },
    [updateFilters]
  );

  // Handle opening the add program modal
  const handleOpenAddProgram = useCallback(() => {
    setShowAddProgramModal(true);
  }, []);

  return (
    <PageWrapper
      title="Program Search"
      description="Find the perfect graduate program for your academic journey"
    >
      <div className="max-w-3xl mx-auto">
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

      {/* Modal Form */}
      <AddProgramForm
        open={showAddProgramModal}
        onOpenChange={setShowAddProgramModal}
      />

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
          <EmptyState
            icon={SearchXIcon}
            title="No programs found"
            description="Try adjusting your search criteria or filters to see more results."
            actionLabel="Add Missing Program"
            onAction={handleOpenAddProgram}
          />
        ) : (
          <>
            <div className="mb-4">
              <p className="text-muted-foreground">
                {programs?.length ?? 0} programs found across{" "}
                {universitiesWithFilteredPrograms.length} universities
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {universitiesToDisplay.map((university) => (
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
      {universitiesWithFilteredPrograms.length > SEARCH_UNIVERSITY_LIMIT && (
        <p className="text-muted-foreground text-sm mt-4">
          Results limited to {SEARCH_UNIVERSITY_LIMIT} universities. Please
          apply more filters to narrow down your search.
        </p>
      )}
      </div>
    </PageWrapper>
  );
};

export default UniversitySearchPage;
