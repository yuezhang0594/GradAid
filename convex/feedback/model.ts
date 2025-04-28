import { FEEDBACK_MAX_CHARS } from "../validators";
import { MutationCtx } from "../_generated/server"; // Import MutationCtx
import { Id } from "../_generated/dataModel"; // Import Id
import { DeviceType } from "../validators"; // Import DeviceType

/**
 * Validates the feedback rating.
 * @param rating - The numerical rating.
 * @throws Error if the rating is invalid.
 */
export function validateRating(rating: number): void {
  if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    throw new Error("Rating is required.");
  }
}

/**
 * Sanitizes and validates feedback text.
 * Removes HTML tags, trims whitespace, and checks character limits.
 * @param text - The feedback text.
 * @param fieldName - The name of the field being sanitized (e.g., "Positive feedback").
 * @returns The sanitized text, or undefined if the input is empty or only whitespace.
 * @throws Error if the text exceeds the maximum character limit.
 */
export function sanitizeAndValidateFeedbackText(text: string | undefined, fieldName: string): string | undefined {
  if (!text) return undefined;

  // Remove any potential HTML/script tags and trim whitespace
  const sanitized = text.replace(/<[^>]*>/g, '').trim();

  if (sanitized.length === 0) return undefined;

  // Check character limits
  if (sanitized.length > FEEDBACK_MAX_CHARS) {
    throw new Error(`${fieldName} exceeds maximum length of ${FEEDBACK_MAX_CHARS} characters`);
  }

  return sanitized;
}

/**
 * Creates a feedback entry in the database.
 * @param ctx - The mutation context.
 * @param args - Object containing userId, positive/negative feedback, rating, and device.
 * @returns The ID of the newly created feedback document.
 */
export async function createFeedbackEntry(
  ctx: MutationCtx,
  args: {
    userId: Id<"users">;
    positive?: string;
    negative?: string;
    rating: number;
    device: DeviceType;
  }
): Promise<Id<"feedback">> {
  return await ctx.db.insert("feedback", {
    userId: args.userId,
    positive: args.positive,
    negative: args.negative,
    rating: args.rating,
    device: args.device,
  });
}