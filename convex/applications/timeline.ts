import { query } from "../_generated/server";
import { getCurrentUserIdOrThrow, getDemoUserId } from "../users";
import { v } from "convex/values";

export const getTimeline = query({
  args: {
    demoMode: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    // Get user ID (either current user or demo user)
    let userId;
    try {
      if (args.demoMode) {
        userId = await getDemoUserId(ctx);
      } else {
        userId = await getCurrentUserIdOrThrow(ctx);
      }
    } catch {
      userId = await getDemoUserId(ctx);
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
        return {
          ...application,
          university: university?.name ?? "Unknown University",
          program: program?.name ?? "Unknown Program",
        };
      })
    );

    // Sort by deadline
    return applicationsWithDetails.sort((a, b) => 
      new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    );
  },
});
