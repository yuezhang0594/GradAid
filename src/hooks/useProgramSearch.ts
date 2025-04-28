import { useState, useCallback, useEffect } from 'react';
import { api } from '#/_generated/api';
import { useQuery } from 'convex/react';
import { Doc, Id } from '#/_generated/dataModel';
import { SearchFilters, DEFAULT_FILTERS } from '#/validators';
import { set } from 'date-fns';

type Program = Doc<"programs">;
type University = Doc<"universities">

export function useProgramSearch(query?: string) {
    const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);

    // The filter state change will automatically trigger this query to re-run
    const programIds = useQuery(api.search.queries.searchPrograms, {
        search: query || "",
        filters,
    });

    const universities = useQuery(api.search.queries.getUniversitiesForPrograms, {
        programIds: programIds ?? [],
    });

    const programs = useQuery(api.programs.queries.getProgramsByIds, {
        programIds: programIds ?? [],
    });

    const uniqueLocations = useQuery(api.search.queries.getUniqueLocations) || [];

    const uniqueDegreeTypes = useQuery(api.search.queries.getUniqueDegreeTypes) || [];

    const isLoading = programIds === undefined || universities === undefined || programs === undefined || uniqueLocations === undefined || uniqueDegreeTypes === undefined;

    // Update filters
    const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    }, []);

    return {
        universities,
        programs,
        filters,
        updateFilters,
        uniqueLocations,
        uniqueDegreeTypes,
        isLoading,
    };
}
