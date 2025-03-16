import { useMutation, useQuery } from 'convex/react';
import { useCallback } from "react";
import { useUser } from '@clerk/clerk-react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

export function useFavorites() {
  // Get authenticated user from Clerk
  const { user, isSignedIn, isLoaded } = useUser();
  const userId = isSignedIn ? (user?.id as Id<"users">) : undefined;
  
  // Directly use Convex mutations and queries
  const toggleFavoriteMutation = useMutation(api.programs.favorites.toggleFavorite);
  
  // Get all favorite program IDs
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
    return isFavoriteQuery(programId) ?? false;
  };

  // Get all favorited program IDs
  const getFavoriteProgramIds = () => {
    return favoriteProgramIdsResult || [];
  };

  return {
    toggleFavorite,
    getFavoriteProgramIds,
    isFavorite,
    favoritesLoading,
  };
}
