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

    // Get university details for each application
    const timelineItems = await Promise.all(
      applications.map(async (app) => {
        const university = await ctx.db.get(app.universityId);
        
        return {
          date: app.deadline,
          university: university?.name ?? "Unknown University",
          program: app.program,
          requirements: app.requirements,
          priority: app.priority,
        };
      })
    );

    // Sort by deadline
    return timelineItems.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  },
});
