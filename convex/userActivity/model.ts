import { Id } from "../_generated/dataModel";
import { MutationCtx, QueryCtx } from "../_generated/server";
import { UserActivityType } from "../validators";

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

/**
 * Logs user activity in the system.
 * 
 * @param ctx - The Convex mutation context
 * @param userId - The ID of the user performing the activity
 * @param type - The type of user activity being logged
 * @param description - A human-readable description of the activity
 * @param metadata - Optional additional data related to the activity
 * @param metadata.documentId - Optional ID of the related application document
 * @param metadata.applicationId - Optional ID of the related application
 * @param metadata.creditsUsed - Optional number of credits used in the activity
 * @param metadata.oldStatus - Optional previous status before the activity
 * @param metadata.newStatus - Optional new status after the activity
 * @param metadata.oldProgress - Optional previous progress value before the activity
 * @param metadata.newProgress - Optional new progress value after the activity
 * @param metadata.remainingCredits - Optional count of remaining credits after the activity
 * 
 * @returns A Promise that resolves to the ID of the newly created user activity record
 */
export async function logUserActivity(
    ctx: MutationCtx,
    userId: Id<"users">,
    type: UserActivityType,
    description: string,
    metadata?: {
        documentId?: Id<"applicationDocuments">,
        applicationId?: Id<"applications">,
        creditsUsed?: number,
        oldStatus?: string,
        newStatus?: string,
        oldProgress?: number,
        newProgress?: number,
        remainingCredits?: number,
    }
) {
    return await ctx.db.insert("userActivity", {
        userId,
        type,
        description,
        timestamp: new Date().toISOString(),
        metadata: metadata || {},
    });
}