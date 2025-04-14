import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUserIdOrThrow } from "./users";

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
    rating: v.number()
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserIdOrThrow(ctx);
    
    // Additional server-side validation
    if (args.rating < 1 || args.rating > 5 || !Number.isInteger(args.rating)) {
      throw new Error("Rating is required.");
    }
    
    // Sanitize and trim both positive and negative feedback
    const sanitizeString = (str: string | undefined): string | undefined => {
      if (!str) return undefined;
      // Remove any potential HTML/script tags and trim whitespace
      const sanitized = str.replace(/<[^>]*>/g, '').trim();
      return sanitized.length > 0 ? sanitized : undefined;
    };
    
    const positive = sanitizeString(args.positive);
    const negative = sanitizeString(args.negative);
    
    // Check character limits if text is provided
    const charLimit = 1000;
    if (positive && positive.length > charLimit) {
      throw new Error(`Positive feedback exceeds maximum length of ${charLimit} characters`);
    }
    if (negative && negative.length > charLimit) {
      throw new Error(`Negative feedback exceeds maximum length of ${charLimit} characters`);
    }
    
    // Create the feedback entry
    const feedbackId = await ctx.db.insert("feedback", {
      userId,
      positive,
      negative,
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