import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { getFavoriteProgramsWithUniversity } from 'convex/programs/favorites';

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

  const savedProgramsWithUniversity = useQuery(
    api.programs.favorites.getFavoriteProgramsWithUniversity
  );

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

  return {
    toggleFavorite,
    getFavoriteProgramIds,
    getFavoritePrograms,
    isFavorite,
    favoritesLoading,
    savedProgramsWithUniversity,
  };
}
