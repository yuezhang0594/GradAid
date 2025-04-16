import { verify } from "crypto";
import { Doc, Id } from "../_generated/dataModel";
import { ActionCtx, MutationCtx, QueryCtx } from "../_generated/server";
import { getCurrentUserIdOrThrow } from "../users";
import { DocumentStatus, DocumentType, ApplicationStatus } from "../validators";

/**
 * Verifies that the current authenticated user is the owner of a specified application.
 * 
 * @param ctx - The mutation context for database operations and authentication
 * @param applicationId - The ID of the application to verify ownership for
 * @returns A promise resolving to an object containing the user ID and the application
 * @throws {Error} If the application is not found
 * @throws {Error} If the current user is not the owner of the application
 */
export async function verifyApplicationOwnership(
    ctx: MutationCtx | QueryCtx,
    applicationId: Id<"applications">
): Promise<{ userId: Id<"users">, application: Doc<"applications"> }> {
    // Get user ID from auth
    const userId = await getCurrentUserIdOrThrow(ctx);

    // Get the application to verify ownership
    const application = await ctx.db.get(applicationId);
    if (!application) {
        throw new Error("Application not found");
    }

    if (application.userId !== userId) {
        throw new Error("Unauthorized: Application does not belong to the user");
    }

    return { userId, application };
}

/**
 * Validates that a program belongs to a specified university.
 * 
 * This function performs two validations:
 * 1. Verifies that both the university and program documents exist in the database
 * 2. Confirms that the program is associated with the specified university
 * 
 * @param ctx - The mutation context providing database access
 * @param universityId - The ID of the university to validate against
 * @param programId - The ID of the program to validate
 * 
 * @throws {Error} When the university document cannot be found
 * @throws {Error} When the program document cannot be found
 * @throws {Error} When the program does not belong to the specified university
 * 
 * @returns An object containing both the university and program documents
 */
export async function validateProgramBelongsToUniversity(
    ctx: MutationCtx,
    universityId: Id<"universities">,
    programId: Id<"programs">
) {
    // Verify the university and program exist
    const university = await ctx.db.get(universityId);
    if (!university) {
        throw new Error("University not found");
    }

    const program = await ctx.db.get(programId);
    if (!program) {
        throw new Error("Program not found");
    }

    // Ensure the program belongs to the specified university
    if (program.universityId !== universityId) {
        throw new Error("Program does not belong to the specified university");
    }

    return { university, program };
}

/**
 * Checks if a user already has an application for a specific program.
 * 
 * @param ctx - The mutation context providing access to the database
 * @param userId - The ID of the user to check for existing applications
 * @param programId - The ID of the program to check against
 * 
 * @throws {Error} Throws an error if the user already has an application for the specified program
 * 
 * @async
 */
export async function checkExistingApplication(
    ctx: MutationCtx,
    userId: Id<"users">,
    programId: Id<"programs">
) {
    const existingApplication = await ctx.db
        .query("applications")
        .withIndex("by_user", (q) =>
            q.eq("userId", userId)
        )
        .filter((q) => q.eq(q.field("programId"), programId))
        .first();

    if (existingApplication) {
        throw new Error("You already have an application for this program");
    }
}

/**
 * Logs an activity related to an application status change.
 * 
 * This function creates a user activity record in the database after verifying
 * that the current user has ownership of the specified application. The activity
 * tracks changes in application status along with a descriptive message.
 * 
 * @param ctx - The mutation context for database operations
 * @param applicationId - The ID of the application being updated
 * @param description - A descriptive message about the activity or change
 * @param status - The new status being assigned to the application
 * 
 * @throws Will throw an error if the user doesn't have ownership of the application
 * 
 * @async
 */
export async function logApplicationActivity(
    ctx: MutationCtx,
    applicationId: Id<"applications">,
    description: string,
    status: ApplicationStatus
) {
    const { userId, application } = await verifyApplicationOwnership(ctx, applicationId);
    await ctx.db.insert("userActivity", {
        userId,
        type: "application_update",
        description: description,
        timestamp: new Date().toISOString(),
        metadata: {
            applicationId: applicationId,
            oldStatus: application.status,
            newStatus: status
        }
    });
}