import { query } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentUserIdOrThrow } from "../users";
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
