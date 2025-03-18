import { useState, useCallback, useEffect } from 'react';
import { api } from '../../convex/_generated/api';
import { useQuery } from 'convex/react';
import { Id, Doc } from '../../convex/_generated/dataModel';

// Use Convex's generated type
type Program = Doc<"programs">;
type University = Doc<"universities">

// Define the filter interface to match the API
export interface ProgramSearchFilters {
    programType: string;
    location: string;
    ranking: string;
    gre?: boolean;
    toefl?: boolean;
    minimumGPA?: number;
}

// Default filter values
export const DEFAULT_FILTERS: ProgramSearchFilters = {
    programType: 'all',
    location: 'all',
    ranking: 'all',
    gre: false,
    toefl: false
};

export function useProgramSearch(query?: string, initialFilters?: Partial<ProgramSearchFilters>) {
    const [filters, setFilters] = useState<ProgramSearchFilters>({ ...DEFAULT_FILTERS, ...initialFilters });
    const [status, setStatus] = useState<"LoadingFirstPage" | "CanLoadMore" | "LoadingMore" | "Exhausted">("LoadingFirstPage");
    const [cursor, setCursor] = useState<string | null>(null);
    const [programs, setPrograms] = useState<Id<'programs'>[]>([]);
    const [universities, setUniversities] = useState<University[]>([]);

    // Get programs with optional filters and search query
    const programIds = useQuery(api.programs.search.searchPrograms, {
        query,
        filters,
    });
    const paginationResult = useQuery(api.programs.search.getUniversitiesForPrograms, {
        programIds: programIds || [],
        paginationOpts: { numItems: 10, cursor }
    });

    // Update filters
    const updateFilters = useCallback((newFilters: Partial<ProgramSearchFilters>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
        // Reset pagination when filters change
        setCursor(null);
        setStatus("LoadingFirstPage");
        setPrograms([]);
    }, []);

    // Load more universities
    const loadMore = useCallback(() => {
        if (status === "CanLoadMore") {
            setStatus("LoadingMore");
            // The next page will be loaded automatically when the query reruns with the new cursor
        }
    }, [status]);

    // Update universities and pagination status when results change
    useEffect(() => {
        if (paginationResult === null) {
            // Explicitly handle the "no results" case
            setUniversities([]);
            setStatus("Exhausted");
            return;
        }

        if (!paginationResult) return;

        if (status === "LoadingFirstPage") {
            setUniversities(paginationResult.page);
        } else if (status === "LoadingMore") {
            setUniversities(prev => [...prev, ...paginationResult.page]);
        }

        // Update pagination status
        if (!paginationResult.isDone) {
            setCursor(paginationResult.continueCursor || null);
            setStatus("CanLoadMore");
        } else {
            setStatus("Exhausted");
        }
    }, [paginationResult, status]);


    return {
        universities,
        programIds,
        filters,
        updateFilters,
        loadMore,
        status,
        hasMore: status === "CanLoadMore"
    };
}
