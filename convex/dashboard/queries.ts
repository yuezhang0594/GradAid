import { query } from "../_generated/server";
import { getCurrentUserIdOrThrow } from "../users";
import { getDashboardStatsForUser } from "./model";

// Get dashboard stats for a user
export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getCurrentUserIdOrThrow(ctx);
    return getDashboardStatsForUser(ctx, userId);
  },
});