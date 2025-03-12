import { useMutation, useQuery } from 'convex/react';
import { useUser } from '@clerk/clerk-react';
import { api } from '../../convex/_generated/api';
import { Id } from 'convex/_generated/dataModel';

export function useFavorites() {
  // Get authenticated user from Clerk
  const { user, isSignedIn, isLoaded } = useUser();
  const userId = isSignedIn ? user?.id : undefined;
  
  // Directly use Convex mutations and queries
  const toggleFavoriteMutation = useMutation(api.programs.favorites.toggleFavorite);
  
  // Get favorite program IDs with proper handling for null userId
  const favoriteProgramIdsResult = useQuery(
    api.programs.favorites.getFavoriteProgramIds, 
    userId ? { userId } : "skip"
  );
  
  // Check if a specific program is favorited with proper handling for null inputs
  const isFavoriteQuery = (programId: Id<"programs">) => {
    return useQuery(
      api.programs.favorites.isFavorite, 
      userId && programId ? { userId, programId } : "skip"
    );
  };
  
  // Determine if favorites are loading
  const favoritesLoading = !isLoaded || (isSignedIn && favoriteProgramIdsResult === undefined);

  // Toggle a program as favorite
  const toggleFavorite = (programId: Id<"programs">) => {
    if (!userId) return Promise.resolve(false);
    return toggleFavoriteMutation({ userId, programId });
  };

  // Check if a specific program is favorited synchronously
  const isFavorite = (programId: Id<"programs">) => {
    const result = isFavoriteQuery(programId);
    return result === true; // Will be undefined when loading or false when not favorited
  };

  // Get all favorited program IDs for a user
  const getFavoriteProgramIds = () => {
    return favoriteProgramIdsResult || [];
  };

  return {
    toggleFavorite,
    getFavoriteProgramIds,
    isFavorite,
    favoritesLoading,
    userId
  };
}
