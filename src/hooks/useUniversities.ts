import { useState, useCallback } from 'react';
import { api } from '../../convex/_generated/api';
import { useQuery, useMutation } from 'convex/react';
import { useUser } from '@clerk/clerk-react'
import { Id, Doc } from '../../convex/_generated/dataModel';

// Use Convex's generated type
type University = Doc<"universities"> & { _id: Id<"universities"> };

// Define the filter interface to match the API
export interface UniversityFilters {
    programType: string;
    location: string;
    ranking: string;
    gre?: boolean;
    toefl?: boolean;
    minimumGPA?: number;
}

// Default filter values
export const DEFAULT_FILTERS: UniversityFilters = {
    programType: 'all',
    location: 'all',
    ranking: 'all',
};

export function useUniversities(query?: string, initialFilters?: Partial<UniversityFilters>) {
    const [filters, setFilters] = useState<UniversityFilters>({...DEFAULT_FILTERS, ...initialFilters});
    const [status, setStatus] = useState<"LoadingFirstPage" | "CanLoadMore" | "LoadingMore" | "Exhausted">("LoadingFirstPage");
    const [cursor, setCursor] = useState<string | null>(null);
    const [universities, setUniversities] = useState<University[]>([]);

    // Get universities with optional filters and search query
    const paginationResult = useQuery(api.universities.search.searchUniversities, {
        query,
        filters,
        paginationOpts: { numItems: 10, cursor }
    });

    // Favorite university mutation
    const favoriteUniversity = useMutation(api.universities.favorites.toggleFavorite);

    // Get the authenticated user
    const { user } = useUser();

    // Update filters
    const updateFilters = useCallback((newFilters: Partial<UniversityFilters>) => {
        setFilters(prev => ({...prev, ...newFilters}));
        // Reset pagination when filters change
        setCursor(null);
        setStatus("LoadingFirstPage");
    }, []);

    // Load more universities
    const loadMore = useCallback(() => {
        if (status === "CanLoadMore") {
            setStatus("LoadingMore");
            // The next page will be loaded automatically when the query reruns with the new cursor
        }
    }, [status]);

    // Update universities and pagination status when results change
    if (paginationResult) {
        if (status === "LoadingFirstPage" || status === "LoadingMore") {
            setUniversities(prev =>
                status === "LoadingFirstPage"
                    ? paginationResult.results
                    : [...prev, ...paginationResult.results]
            );

            if (paginationResult.continueCursor) {
                setCursor(paginationResult.continueCursor);
                setStatus("CanLoadMore");
            } else {
                setStatus("Exhausted");
            }
        }
    }

    // Add/remove university to/from favorites
    const toggleFavorite = useCallback((universityId: Id<"universities">) => {
        // Get the current user ID from Clerk authentication
        const userId = user?.id;
        if (userId) {
            favoriteUniversity({ universityId, userId });
        }
    }, [favoriteUniversity, user]);

    // Filter local universities
    const filterUniversities = useCallback((predicate: (p: University) => boolean) => {
        return universities.filter(predicate);
    }, [universities]);

    return {
        universities,
        filters,
        updateFilters,
        loadMore,
        toggleFavorite,
        filterUniversities,
        status,
        loading: status === "LoadingFirstPage" || status === "LoadingMore",
        hasMore: status === "CanLoadMore"
    };
}
