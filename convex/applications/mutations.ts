import { v } from "convex/values";
import { mutation } from "../_generated/server";
import * as Validators from "../validators";
import { getCurrentUserIdOrThrow } from "../users";
import * as ApplicationModel from "./model";

/**
 * Creates a new application for a university program.
 * 
 * @param ctx - The mutation context
 * @param args - The application details
 * @param args.universityId - The ID of the university the application is for
 * @param args.programId - The ID of the program the application is for
 * @param args.deadline - The deadline for the application
 * @param args.priority - The priority level of the application
 * @param args.notes - Optional notes about the application
 * @param args.applicationDocuments - Documents required for the application
 * @param args.applicationDocuments[].type - The type of document
 * @param args.applicationDocuments[].status - The status of the document
 * 
 * @returns The ID of the newly created application
 * 
 * @throws Will throw an error if the user is not authenticated
 */
export const createApplication = mutation({
  args: {
    universityId: v.id("universities"),
    programId: v.id("programs"),
    deadline: v.string(),
    priority: Validators.applicationPriorityValidator,
    notes: v.optional(v.string()),
    applicationDocuments: v.array(
      v.object({
        type: Validators.documentTypeValidator,
        status: Validators.documentStatusValidator,
      })
    ),
  },
  returns: v.id("applications"),
  handler: async (ctx, args) => {
    const userId = await getCurrentUserIdOrThrow(ctx);
    return await ApplicationModel.createNewApplication(
      ctx,
      userId,
      args.universityId,
      args.programId,
      args.deadline,
      args.priority,
      args.notes,
      args.applicationDocuments
    );
  }
});

/**
 * Deletes an application and all associated documents from the database.
 * 
 * @param ctx - The Convex execution context
 * @param args - The mutation arguments
 * @param args.applicationId - The ID of the application to delete
 * @returns An object containing a success boolean indicating whether the deletion was successful
 * @throws Will throw an error if the application does not exist or if the operation fails
 * 
 * @example
 * ```ts
 * await client.mutation.deleteApplication({ applicationId: "applications:abc123" });
 * ```
 */
export const deleteApplication = mutation({
  args: {
    applicationId: v.id("applications"),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    return await ApplicationModel.deleteApplicationWithDocuments(ctx, args.applicationId);
  }
});

/**
 * Updates the status of an application along with optional metadata.
 * 
 * This mutation first verifies that the current user has ownership of the application,
 * then updates the application's status and associated metadata.
 * 
 * @param args.applicationId - The ID of the application to update
 * @param args.status - The new application status
 * @param args.notes - Optional notes to add to the application status update
 * @param args.submissionDate - Optional submission date associated with the status update
 * 
 * @returns The ID of the updated application
 * @throws Will throw an error if the user doesn't have ownership of the application
 */
export const updateApplicationStatus = mutation({
  args: {
    applicationId: v.id("applications"),
    status: Validators.applicationStatusValidator,
    notes: v.optional(v.string()),
    submissionDate: v.optional(v.string()),
  },
  returns: v.id("applications"),
  handler: async (ctx, args) => {
    await ApplicationModel.verifyApplicationOwnership(ctx, args.applicationId);
    return await ApplicationModel.updateApplicationStatusWithMetadata(
      ctx,
      args.applicationId,
      args.status,
      args.notes,
      args.submissionDate
    );
  }
});