import { query } from "../_generated/server";
import { getCurrentUserIdOrThrow } from "../users";
import { getDashboardStatsForUser } from "./model";

/**
 * Retrieves dashboard statistics for the currently authenticated user.
 * 
 * This query fetches dashboard statistics specific to the current user's account.
 * It requires an authenticated user context to function properly.
 * 
 * @returns Dashboard statistics for the current user
 * @throws Will throw an error if no authenticated user is found
 */
export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getCurrentUserIdOrThrow(ctx);
    return getDashboardStatsForUser(ctx, userId);
  },
});