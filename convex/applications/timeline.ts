import { query } from "../_generated/server";
import { getCurrentUserIdOrThrow, getDemoUserId } from "../users";

export const getTimeline = query({
  args: {},
  handler: async (ctx, args) => {
    const userId = await getCurrentUserIdOrThrow(ctx);
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
        const applicationDocuments = await ctx.db
        .query("applicationDocuments")
        .withIndex("by_application", (q) => q.eq("applicationId", application._id))
        .collect();
        return {
          ...application,
          university: university?.name ?? "Unknown University",
          program: program?.name ?? "Unknown Program",
          applicationDocuments,
        };
      })
    );

    // Sort by deadline
    return applicationsWithDetails.sort((a, b) => 
      new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    );
  },
});
