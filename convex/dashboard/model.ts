import { QueryCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { getUserAiCredits } from "../aiCredits/model";
import { getApplicationsForUser } from "../applications/model";
import { getDocumentsForUser } from "../documents/model";
import { getRecentActivityForUser } from "../userActivity/model";

/**
 * Fetches dashboard statistics for a user
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

    // Get document progress
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