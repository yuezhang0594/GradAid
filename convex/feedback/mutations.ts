import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentUserIdOrThrow } from "../users";
import { deviceTypeValidator } from "../validators";
import * as FeedbackModel from "./model"; 
import { logUserActivity } from "../userActivity/model";

/**
 * Submits user feedback to the database
 * 
 * This function validates and stores feedback data including positive feedback, negative feedback,
 * and a numerical rating. It implements server-side validation in addition to any client-side
 * validation to ensure data integrity and security.
 * 
 * @param ctx - Convex mutation context
 * @param args - Feedback data including optional positive and negative feedback and required rating
 * @returns The ID of the newly created feedback document
 */
export const submitFeedback = mutation({
  args: {
    positive: v.optional(v.string()),
    negative: v.optional(v.string()),
    rating: v.number(),
    device: deviceTypeValidator
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserIdOrThrow(ctx);
    
    FeedbackModel.validateRating(args.rating);    
    const positive = FeedbackModel.sanitizeAndValidateFeedbackText(args.positive, "Positive feedback");
    const negative = FeedbackModel.sanitizeAndValidateFeedbackText(args.negative, "Negative feedback");
    
    const feedbackId = await FeedbackModel.createFeedbackEntry(ctx, {
      userId,
      positive,
      negative,
      rating: args.rating,
      device: args.device,
    });

    await logUserActivity(
      ctx,
      userId,
      "feedback_submission",
      "Submitted feedback",
      {} // No specific metadata for feedback submission
    );
    
    return feedbackId;
  },
});