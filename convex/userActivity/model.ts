import { Id } from "../_generated/dataModel";
import { QueryCtx } from "../_generated/server";


/**
 * Fetches recent activity for a user with optional limit
 */

export async function getRecentActivityForUser(
    ctx: QueryCtx,
    userId: Id<"users">,
    limit: number = 12
) {
    return await ctx.db
        .query("userActivity")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .order("desc")
        .take(limit);
}
