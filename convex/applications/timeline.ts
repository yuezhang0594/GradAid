import { query } from "../_generated/server";
import { getCurrentUserIdOrThrow } from "../users";
import { getApplicationsWithDetails } from "./model";

/**
 * Retrieves a timeline of applications for the current authenticated user.
 * 
 * This query fetches all applications associated with the current user along with their details,
 * and returns them sorted chronologically by deadline (earliest first).
 * 
 * @throws Will throw an error if there is no authenticated user.
 * @returns An array of application objects with their details, sorted by deadline in ascending order.
 */
export const getTimeline = query({
  args: {},
  handler: async (ctx, args) => {
    const userId = await getCurrentUserIdOrThrow(ctx);
    const applicationsWithDetails = await getApplicationsWithDetails(ctx, userId);

    // Sort by deadline
    return applicationsWithDetails.sort((a, b) => 
      new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    );
  },
});
