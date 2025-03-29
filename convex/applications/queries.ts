import { query } from "../_generated/server";
import { getCurrentUserIdOrThrow, getDemoUserId } from "../users";
import { Id } from "../_generated/dataModel";
import { v } from "convex/values";

// Query to get applications for a specific user
export const getApplications = query({
  args: {
    demoMode: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    // Try to get current user, if not available or demo mode is on, use mock user
    let userId: Id<"users">;
    try {
      if (args.demoMode) {
        userId = await getDemoUserId(ctx);
      } else {
        userId = await getCurrentUserIdOrThrow(ctx);
      }
    } catch {
      // Use mock user ID if authentication fails
      userId = "mock-user-id" as Id<"users">;
    }

    // Get all applications for the user
    const applications = await ctx.db
      .query("applications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Get university and program details for each application
    const applicationsWithDetails = await Promise.all(
      applications.map(async (application) => {
        const university = await ctx.db.get(application.universityId);
        const program = await ctx.db.get(application.programId);
        
        // Get documents for this application
        const documents = await ctx.db
          .query("applicationDocuments")
          .withIndex("by_application", (q) => q.eq("applicationId", application._id))
          .collect();

        // Calculate document completion
        const totalDocuments = documents.length;
        const completeDocuments = documents.filter(doc => doc.status === "complete").length;
        const progress = totalDocuments > 0 ? Math.round((completeDocuments / totalDocuments) * 100) : 0;

        return {
          id: application._id,
          university: university?.name ?? "Unknown University",
          program: program?.name ?? "Unknown Program",
          status: application.status,
          priority: application.priority,
          deadline: application.deadline,
          documentsComplete: completeDocuments,
          totalDocuments,
          progress,
        };
      })
    );

    return applicationsWithDetails;
  },
});
