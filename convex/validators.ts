import { Infer, v } from "convex/values";
import { z } from "zod";
import { sanitizeInput } from "../src/lib/inputValidation";

/**
 * Global constants for validation limits
 */
export const FEEDBACK_MAX_CHARS = 1000;
export const APPLICATION_NOTES_MAX_CHARS = 5000;
export const DEFAULT_AI_CREDITS = 500;
export const LOADING_INDICATOR_DELAY = 500;
export const RESET_DAYS_IN_MILLISECONDS = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
export const AI_CREDITS_FOR_SOP = 5;
export const AI_CREDITS_FOR_LOR = 3;
export const MAX_LOR = 5;


/**
 * TypeScript type definition for feedback input data
 * Generated from the Zod schema for type safety across the application
 */
export type FeedbackInput = z.infer<typeof feedbackSchema>;

/**
 * TypeScript type definition for document types
 * Represents the types of documents that can be submitted
 */

export type DocumentType = Infer<typeof documentTypeValidator>;
export const documentTypeValidator = v.union(
    v.literal("sop"),
    v.literal("lor")
);
export type DocumentStatus = Infer<typeof documentStatusValidator>;
export const documentStatusValidator = v.union(
    v.literal("not_started"),
    v.literal("draft"),
    v.literal("in_review"),
    v.literal("complete")
);
export type ApplicationPriority = Infer<typeof applicationPriorityValidator>;
export const applicationPriorityValidator = v.union(
    v.literal("high"),
    v.literal("medium"),
    v.literal("low")
);
export type ApplicationStatus = Infer<typeof applicationStatusValidator>;
export const applicationStatusValidator = v.union(
    v.literal("not_started"),
    v.literal("draft"),
    v.literal("in_progress"),
    v.literal("submitted"),
    v.literal("accepted"),
    v.literal("rejected"),
    v.literal("deleted")
);
export type UserActivityType = Infer<typeof userActivityTypeValidator>;
export const userActivityTypeValidator = v.union(
    v.literal("document_edit"),
    v.literal("document_status_update"),
    v.literal("application_update"),
    v.literal("lor_request"),
    v.literal("lor_update"),
    v.literal("ai_usage"),
    v.literal("feedback_submission"),
);
export type AiCreditUsageType = Infer<typeof aiCreditUsageTypeValidator>;
export const aiCreditUsageTypeValidator = v.union(
    v.literal("lor_request"),
    v.literal("lor_update"),
    v.literal("sop_request"),
    v.literal("sop_update"),
    v.literal("ai_usage"),
    v.literal("ai_credits_reset")
);
export type DeviceType = Infer<typeof deviceTypeValidator>;
export const deviceTypeValidator = v.union(
    v.literal("desktop"),
    v.literal("mobile"),
    v.literal("tablet")
);
export type SearchFilters = Infer<typeof searchFilterValidator>;
export const searchFilterValidator = v.object({
    programType: v.optional(v.union(v.literal("all"), v.string())),
    location: v.optional(v.object({
        city: v.string(),
        state: v.string(),
    })),
    ranking: v.optional(v.union(v.literal("all"), v.string())),
    gre: v.optional(v.boolean()),
    toefl: v.optional(v.boolean()),
    minimumGPA: v.optional(v.number()),
});
export const DEFAULT_FILTERS: SearchFilters = {
    programType: 'all',
    location: { state: 'all', city: 'all' },
    ranking: 'all',
    gre: false,
    toefl: false,
    minimumGPA: undefined,
};

// Map degree codes to readable labels
export const degreeLabels: Record<string, string> = {
    'MS': 'Master of Science (MS)',
    'MA': 'Master of Arts (MA)',
    'PhD': 'Doctor of Philosophy (PhD)',
    'MBA': 'Master of Business Admin (MBA)',
    'MFA': 'Master of Fine Arts (MFA)',
    'MEng': 'Master of Engineering (MEng)',
    'MCS': 'Master of Computer Science (MCS)',
    'MSE': 'Master of Science in Engineering (MSE)',
    'MFin': 'Master in Finance (MFin)',
    // Add other degree types as needed
};
export const TABLES_WITH_USER_DATA = [
    "userProfiles",
    "applications",
    "applicationDocuments",
    "aiCredits",
    "aiCreditUsage",
    "userActivity",
    "favorites",
] as const;

/**
 * Zod schema for validating user feedback submissions
 * Includes positive feedback, negative feedback, and a numerical rating
 * Applies sanitization and validation rules to prevent potential security issues
 * Only rating is required; both text fields are optional
 */
export const feedbackSchema = z.object({
    positive: z.string()
        .max(FEEDBACK_MAX_CHARS, { message: `Feedback is too long (maximum ${FEEDBACK_MAX_CHARS} characters)` })
        .optional()
        .transform(val => {
            // Sanitize and trim input, transform empty strings to undefined
            if (!val) return undefined;
            // Remove potential HTML/script tags and trim whitespace
            return sanitizeInput(val) || undefined;
        }),
    negative: z.string()
        .max(FEEDBACK_MAX_CHARS, { message: `Feedback is too long (maximum ${FEEDBACK_MAX_CHARS} characters)` })
        .optional()
        .transform(val => {
            // Sanitize and trim input, transform empty strings to undefined
            if (!val) return undefined;
            // Remove potential HTML/script tags and trim whitespace
            return sanitizeInput(val) || undefined;
        }),
    rating: z.number()
        .int({ message: "Rating is required." })
        .min(1, { message: "Rating is required." })
        .max(5, { message: "Rating is required." }),
    device: z.enum(["desktop", "mobile", "tablet"], {
        errorMap: () => ({ message: "Device type is required." }),
    })
});

/**
 * Convex validator for feedback submissions
 * Used in Convex functions to validate incoming feedback data
 */
export const feedbackValidator = v.object({
    positive: v.optional(v.string()),
    negative: v.optional(v.string()),
    rating: v.number(),
    device: deviceTypeValidator
});