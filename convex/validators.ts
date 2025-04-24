import { Infer, v } from "convex/values";
import { z } from "zod";
import { sanitizeInput } from "../src/lib/inputValidation";

/**
 * Global constants for validation limits
 */
export const FEEDBACK_MAX_CHARS = 1000;
export const PROFILE_NOTES_MAX_CHARS = 1000;
export const APPLICATION_NOTES_MAX_CHARS = 5000;
export const DEFAULT_AI_CREDITS = 500;
export const LOADING_INDICATOR_DELAY = 500;
export const RESET_TIME_IN_DAYS = 30;
export const RESET_DAYS_IN_MILLISECONDS = RESET_TIME_IN_DAYS * 24 * 60 * 60 * 1000; // 30 days in milliseconds
export const AI_CREDITS_FOR_SOP = 50;
export const AI_CREDITS_FOR_LOR = 30;
export const MAX_LOR = 5;
export const SEARCH_UNIVERSITY_LIMIT = 10;


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
    'M.S.': 'Master of Science (M.S.)',
    'M.A.': 'Master of Arts (M.A.)',
    'Ph.D.': 'Doctor of Philosophy (Ph.D.)',
    'M.B.A.': 'Master of Business Admin (M.B.A.)',
    'M.F.A.': 'Master of Fine Arts (M.F.A.)',
    'M.Eng.': 'Master of Engineering (M.Eng.)',
    'M.C.S.': 'Master of Computer Science (M.C.S.)',
    'M.S.E.': 'Master of Science in Engineering (M.S.E.)',
    'M.Fin.': 'Master in Finance (M.Fin.)',
    'M.P.H.': 'Master of Public Health (M.P.H.)',
    'M.S.W.': 'Master of Social Work (M.S.W.)',
    'M.Ed.': 'Master of Education (M.Ed.)',
    'Ed.D.': 'Doctor of Education (Ed.D.)',
    'J.D.': 'Juris Doctor (J.D.)',
    'LL.M.': 'Master of Laws (LL.M.)',
    'M.Arch.': 'Master of Architecture (M.Arch.)',
    'M.M.': 'Master of Music (M.M.)',
    'M.D.': 'Doctor of Medicine (M.D.)',
    'M.A.T.': 'Master of Arts in Teaching (M.A.T.)',
    'M.P.P.': 'Master of Public Policy (M.P.P.)',
    'M.P.A.': 'Master of Public Administration (M.P.A.)',
    'M.S.N.': 'Master of Science in Nursing (M.S.N.)',
    'D.M.A.': 'Doctor of Musical Arts (D.M.A.)',
    'M.Div.': 'Master of Divinity (M.Div.)',
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