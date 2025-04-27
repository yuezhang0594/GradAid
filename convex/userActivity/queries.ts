import { query } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentUserIdOrThrow } from "../users";

/**
 * Retrieves the most recent user activities for the current authenticated user.
 * 
 * @param args - The query arguments
 * @param args.limit - Optional. Maximum number of activities to return (default: 10)
 * @returns An array of user activity records sorted by recency (newest first)
 * @throws If no authenticated user is found
 */
export const getRecentActivity = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserIdOrThrow(ctx);
    const { limit = 10 } = args;

    const activities = await ctx.db
      .query("userActivity")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);

    return activities;
  },
});

/**
 * Retrieves activity statistics for the current authenticated user.
 *
 * This query calculates the number of activities performed by the user across three time periods:
 * - Today: Activities recorded since 12:00 AM of the current day
 * - This Week: Activities recorded since the start of the current week (from Sunday)
 * - This Month: Activities recorded since the 1st day of the current month
 *
 * @returns An object containing activity counts for different time periods:
 * ```
 * {
 *   today: number,    // Count of activities recorded today
 *   thisWeek: number, // Count of activities recorded this week
 *   thisMonth: number // Count of activities recorded this month
 * }
 * ```
 * @throws Will throw an error if no authenticated user is found
 */
export const getActivityStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getCurrentUserIdOrThrow(ctx);

    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start from Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const activities = await ctx.db
      .query("userActivity")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const stats = {
      today: 0,
      thisWeek: 0,
      thisMonth: 0,
    };

    activities.forEach((activity) => {
      const activityDate = new Date(activity.timestamp);
      if (activityDate >= startOfDay) {
        stats.today++;
      }
      if (activityDate >= startOfWeek) {
        stats.thisWeek++;
      }
      if (activityDate >= startOfMonth) {
        stats.thisMonth++;
      }
    });

    return stats;
  },
});
