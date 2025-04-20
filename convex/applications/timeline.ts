import { query } from "../_generated/server";
import { getCurrentUserIdOrThrow } from "../users";
import { getApplicationsWithDetails } from "./model";

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
