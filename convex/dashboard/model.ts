import { QueryCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { getUserAiCredits } from "../aiCredits/model";
import { getApplicationsForUser } from "../applications/model";
import { getDocumentsForUser } from "../documents/model";
import { getRecentActivityForUser } from "../userActivity/model";

/**
 * Retrieves comprehensive dashboard statistics for a specific user.
 * 
 * This function aggregates various metrics including:
 * - Application statistics (total count, submission status, upcoming deadlines)
 * - Document statistics (total count, completion progress, fully completed documents)
 * - Available AI credits
 * - Recent user activity
 * 
 * @param ctx - The query context for database operations
 * @param userId - The unique identifier of the user to retrieve stats for
 * @returns An object containing consolidated dashboard statistics with application metrics,
 *          document progress information, AI credit balance, and recent activity records
 * @async
 */
export async function getDashboardStatsForUser(
    ctx: QueryCtx,
    userId: Id<"users">
) {
    // Get applications count and status
    const applications = await getApplicationsForUser(ctx, userId);

    const applicationStats = {
        total: applications.length,
        submitted: applications.filter((a) => a.status === "submitted").length,
        inProgress: applications.filter((a) => a.status === "in_progress").length,
        nextDeadline: applications
            .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())[0]
            ?.deadline,
    };

    /**
     * Retrieves all documents associated with a specific user.
     * 
     * @param ctx - The context object used for database operations.
     * @param userId - The unique identifier of the user whose documents to retrieve.
     * @returns A promise that resolves to an array of document objects belonging to the user.
     */
    const documents = await getDocumentsForUser(ctx, userId);

    const documentStats = {
        totalDocuments: documents.length,
        averageProgress: documents.length > 0
            ? documents.reduce((sum, doc) => sum + doc.progress, 0) / documents.length
            : 0,
        completedDocuments: documents.filter((d) => d.progress === 100).length,
    };

    // Get AI credits
    const aiCredits = await getUserAiCredits(ctx, userId);

    // Get recent activity
    const recentActivity = await getRecentActivityForUser(ctx, userId, 12);

    return {
        applications: applicationStats,
        documents: documentStats,
        aiCredits: aiCredits,
        recentActivity: recentActivity,
    };
}