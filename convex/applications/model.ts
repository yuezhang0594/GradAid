import { Doc, Id } from "../_generated/dataModel";
import { MutationCtx, QueryCtx } from "../_generated/server";
import { getCurrentUserIdOrThrow } from "../users";
import { DocumentStatus, DocumentType, ApplicationStatus, ApplicationPriority } from "../validators";
import { createApplicationDocuments } from "../documents/model";

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
    oldStatus: ApplicationStatus,
    newStatus: ApplicationStatus
) {
    const userId = await getCurrentUserIdOrThrow(ctx);
    await ctx.db.insert("userActivity", {
        userId,
        type: "application_update",
        description: description,
        timestamp: new Date().toISOString(),
        metadata: {
            applicationId: applicationId,
            oldStatus,
            newStatus,
        }
    });
}

/**
 * Fetches applications with their related university, program, and document details
 * 
 * @param ctx - The query context for database operations
 * @param userId - The ID of the user whose applications to fetch
 * @returns A promise resolving to an array of applications with related details
 */
export async function getApplicationsWithDetails(
    ctx: QueryCtx,
    userId: Id<"users">
) {
    // Get all applications for the user
    const applications = await ctx.db
        .query("applications")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();

    // Get university and program details for each application
    return await Promise.all(
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
}

/**
 * Fetches applications with document progress calculations
 * 
 * @param ctx - The query context for database operations
 * @param userId - The ID of the user whose applications to fetch
 * @returns A promise resolving to an array of applications with progress information
 */
export async function getApplicationsWithProgress(
    ctx: QueryCtx,
    userId: Id<"users">
) {
    // Get all applications for the user
    const applications = await ctx.db
        .query("applications")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();

    // Get university and program details for each application
    return await Promise.all(
        applications.map(async (application) => {
            const university = await ctx.db.get(application.universityId);
            const program = await ctx.db.get(application.programId);

            // Get documents for this application
            const documents = await ctx.db
                .query("applicationDocuments")
                .withIndex("by_application", (q) => q.eq("applicationId", application._id))
                .collect();

            // Calculate document completion
            const totalDocuments = documents.length;
            const completeDocuments = documents.filter(doc => doc.status === "complete").length;
            const progress = totalDocuments > 0 ? Math.round((completeDocuments / totalDocuments) * 100) : 0;

            return {
                id: application._id,
                university: university?.name ?? "Unknown University",
                program: program?.name ?? "Unknown Program",
                degree: program?.degree ?? "Unknown Degree",
                status: application.status,
                priority: application.priority,
                deadline: application.deadline,
                documentsComplete: completeDocuments,
                totalDocuments,
                progress,
            };
        })
    );
}

/**
 * Groups application documents by university
 * 
 * @param ctx - The query context for database operations
 * @param userId - The ID of the user whose documents to fetch
 * @returns A promise resolving to an array of universities with their documents
 */
export async function getApplicationDocumentsByUniversity(
    ctx: QueryCtx,
    userId: Id<"users">
) {
    // Get all applications for the user
    const applications = await ctx.db
        .query("applications")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();

    // Get documents for each application and group by university
    const universitiesMap = new Map();

    for (const application of applications) {
        const university = await ctx.db.get(application.universityId);
        const program = await ctx.db.get(application.programId);

        if (!university || !program) continue;

        // Get documents for this application
        const documents = await ctx.db
            .query("applicationDocuments")
            .withIndex("by_application", (q) => q.eq("applicationId", application._id))
            .collect();

        const universityData = universitiesMap.get(university.name) || {
            name: university.name,
            documents: [],
            programs: []
        };

        // Add program if not already present
        if (!universityData.programs.some((p: { applicationId: Id<"applications"> }) =>
            p.applicationId === application._id)) {
            universityData.programs.push({
                applicationId: application._id,
                name: `${program.degree} in ${program.name}`
            });
        }

        // Add documents with their IDs
        for (const doc of documents) {
            universityData.documents.push({
                documentId: doc._id,
                type: doc.type,
                status: doc.status,
                progress: doc.progress ?? 0,
                count: 1,
                program: `${program.degree} in ${program.name}`
            });
        }

        universitiesMap.set(university.name, universityData);
    }

    return Array.from(universitiesMap.values());
}

/**
 * Fetches detailed information about a specific application
 * 
 * @param ctx - The query context for database operations
 * @param userId - The ID of the user who owns the application
 * @param applicationId - The ID of the application to fetch
 * @returns A promise resolving to the application details or null if not found
 */
export async function getApplicationWithDetails(
    ctx: QueryCtx,
    userId: Id<"users">,
    applicationId: string
) {
    // Get application details
    const application = await ctx.db
        .query("applications")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .filter((q) => q.eq(q.field("_id"), applicationId))
        .first();

    if (!application) {
        return null;
    }

    // Get university and program details
    const university = await ctx.db.get(application.universityId);
    const program = await ctx.db.get(application.programId);

    // Get documents
    const documents = await ctx.db
        .query("applicationDocuments")
        .withIndex("by_application", (q) => q.eq("applicationId", application._id))
        .collect();

    return {
        ...application,
        university: university?.name ?? "Unknown University",
        department: program?.department ?? "Unknown Department",
        program: program?.name ?? "Unknown Program",
        degree: program?.degree ?? "Unknown Degree",
        documents: documents,
    };
}

/**
 * Creates a new application with associated documents
 * 
 * @param ctx - The mutation context for database operations
 * @param userId - The ID of the user creating the application
 * @param universityId - The ID of the university for the application
 * @param programId - The ID of the program for the application
 * @param deadline - The application deadline
 * @param priority - The application priority
 * @param notes - Optional notes for the application
 * @param applicationDocuments - Optional documents for the application
 * @returns A promise resolving to the ID of the created application
 */
export async function createNewApplication(
    ctx: MutationCtx,
    userId: Id<"users">,
    universityId: Id<"universities">,
    programId: Id<"programs">,
    deadline: string,
    priority: ApplicationPriority,
    notes?: string,
    applicationDocuments?: Array<{
        type: DocumentType,
        status: DocumentStatus
    }>
) {
    await validateProgramBelongsToUniversity(ctx, universityId, programId);
    await checkExistingApplication(ctx, userId, programId);

    const defaultApplicationDocuments = [
        {
            type: "sop" as DocumentType,
            status: "not_started" as DocumentStatus
        },
        {
            type: "lor" as DocumentType,
            status: "not_started" as DocumentStatus
        },
        {
            type: "lor" as DocumentType,
            status: "not_started" as DocumentStatus
        }
    ];

    const applicationId = await ctx.db.insert("applications", {
        userId,
        universityId,
        programId,
        deadline,
        priority,
        notes: notes ?? "",
        status: "draft",
        submissionDate: undefined,
        lastUpdated: new Date().toISOString(),
    });

    await createApplicationDocuments(ctx, applicationId, applicationDocuments || defaultApplicationDocuments);
    await logApplicationActivity(ctx, applicationId, "Application created", "not_started", "draft");

    return applicationId;
}

/**
 * Deletes an application and its associated documents
 * 
 * @param ctx - The mutation context for database operations
 * @param applicationId - The ID of the application to delete
 * @returns A promise resolving to an object with a success flag
 */
export async function deleteApplicationWithDocuments(
    ctx: MutationCtx,
    applicationId: Id<"applications">
) {
    const { application } = await verifyApplicationOwnership(ctx, applicationId);
    // Delete the application and its documents
    await ctx.db.delete(applicationId);
    const applicationDocuments = await ctx.db
        .query("applicationDocuments")
        .withIndex("by_application", (q) => q.eq("applicationId", applicationId))
        .collect();

    for (const doc of applicationDocuments) {
        await ctx.db.delete(doc._id);
    }

    await logApplicationActivity(ctx, applicationId, "Application deleted", application.status, "deleted");

    return { success: true };
}

/**
 * Updates the status of an application with optional metadata
 * 
 * @param ctx - The mutation context for database operations
 * @param applicationId - The ID of the application to update
 * @param status - The new status for the application
 * @param notes - Optional notes for the application
 * @param submissionDate - Optional submission date for the application
 * @returns A promise resolving to the ID of the updated application
 */
export async function updateApplicationStatusWithMetadata(
    ctx: MutationCtx,
    applicationId: Id<"applications">,
    status: ApplicationStatus,
    notes?: string,
    submissionDate?: string
) {
    const { application } = await verifyApplicationOwnership(ctx, applicationId);
    // Create update object
    const updateData: Record<string, any> = {
        status,
        lastUpdated: new Date().toISOString()
    };

    // Add optional fields if provided
    if (notes !== undefined) {
        updateData.notes = notes;
    }

    if (status === "submitted" && submissionDate) {
        updateData.submissionDate = submissionDate;
    }

    // Update application status
    await ctx.db.patch(applicationId, updateData);

    // Log activity
    await logApplicationActivity(
        ctx,
        applicationId,
        `Application status updated to ${status}`,
        application.status,
        status
    );

    return applicationId;
}

/**
 * Retrieves all applications associated with a specific user.
 * 
 * @param ctx - The query context for database operations
 * @param userId - The ID of the user whose applications are being retrieved
 * @returns A promise that resolves to an array of application documents
 */
export async function getApplicationsForUser(
    ctx: QueryCtx,
    userId: Id<"users">
) {
    const applications = await ctx.db
        .query("applications")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();

    return applications;
}