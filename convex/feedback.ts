import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { feedbackSchema } from "./validators";
import { getCurrentUserIdOrThrow } from "./users";

/**
 * Submits user feedback to the system and logs the activity.
 * 
 * This mutation allows users to provide feedback including optional positive and negative
 * comments along with a numerical rating. The feedback is validated against a schema
 * before being stored in the database. A record of the feedback submission is also
 * logged in the user's activity history.
 * 
 * @param ctx - The Convex execution context
 * @param args - The feedback arguments
 * @param args.positive - Optional positive feedback comment
 * @param args.negative - Optional negative feedback comment
 * @param args.rating - Numerical rating value
 * @returns The ID of the newly created feedback entry
 * @throws Error if the user is not authenticated
 * @throws Error if the feedback data doesn't match the required schema
 */
export const submitFeedback = mutation({
  args: {
    positive: v.optional(v.string()),
    negative: v.optional(v.string()),
    rating: v.number(),
  },
  returns: v.id("feedback"),
  handler: async (ctx, args) => {
    const userId = await getCurrentUserIdOrThrow(ctx);

    // Validate input data
    try {
      feedbackSchema.parse(args);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Invalid feedback data: ${error.message}`);
      } else {
        throw new Error(`Invalid feedback data: Unknown error`);
      }
    }

    // Store the feedback
    const feedbackId = await ctx.db.insert("feedback", {
      userId,
      positive: args.positive,
      negative: args.negative,
      rating: args.rating,
    });

    // Log the activity
    await ctx.db.insert("userActivity", {
      userId,
      type: "feedback_submission", 
      description: "Submitted feedback",
      timestamp: new Date().toISOString(),
      metadata: {},
    });

    return feedbackId;
  },
});