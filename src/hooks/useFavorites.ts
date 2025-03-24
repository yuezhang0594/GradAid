import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

export function useFavorites() {
  // Directly use Convex mutations and queries
  const toggleFavoriteMutation = useMutation(api.programs.favorites.toggleFavorite);
  
  // Get all favorite program IDs
  const favoriteProgramIdsResult = useQuery(
    api.programs.favorites.getFavoriteProgramIds
  );

  // Get all favorite programs
  const favoriteProgramsResult = useQuery(
    api.programs.favorites.getFavoritePrograms
  );
  
  // Extract all university IDs from favorite programs
  const universityIds = favoriteProgramsResult
    ? [...new Set(favoriteProgramsResult.map(program => program.universityId))]
    : [];
  
  // Fetch all universities for favorite programs in a single query
  const universitiesResult = useQuery(
    api.programs.search.getUniversities,
    { universityIds }
  ) || [];
  
  // Determine if favorites are loading
  const favoritesLoading = (favoriteProgramIdsResult === undefined);

  // Toggle a program as favorite
  const toggleFavorite = (programId: Id<"programs">) => {
    return toggleFavoriteMutation({ programId });
  };

  // Check if a specific program is favorited
  const isFavorite = (programId: Id<"programs">) => {
    if (!favoriteProgramIdsResult) return false;
    
    return favoriteProgramIdsResult.some(
      (favorite) => favorite.programId === programId
    );
  };

  // Get all favorited program IDs
  const getFavoriteProgramIds = () => {
    return favoriteProgramIdsResult || [];
  };

  const getFavoritePrograms = () => {
    return favoriteProgramsResult || [];
  }

  // Combine programs with university data without using hooks
  const getFavoriteProgramsWithUniversity = () => {
    if (!favoriteProgramsResult) return [];
    
    // Create a map of university IDs to university objects for quick lookup
    const universityMap = Object.fromEntries(
      (universitiesResult || []).map(university => [university._id, university])
    );
    
    // Join programs with their universities using the map
    return favoriteProgramsResult.map(program => ({
      ...program,
      university: universityMap[program.universityId] || null
    }));
  }

  return {
    toggleFavorite,
    getFavoriteProgramsWithUniversity,
    getFavoriteProgramIds,
    getFavoritePrograms,
    isFavorite,
    favoritesLoading,
  };
}
