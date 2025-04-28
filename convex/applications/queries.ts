import { query } from "../_generated/server";
import { getCurrentUserIdOrThrow } from "../users";
import { v } from "convex/values";
import * as ApplicationModel from "./model";

/**
 * Retrieves all applications with their progress information for the currently authenticated user.
 * 
 * @remarks
 * This query fetches applications and their associated progress data from the database
 * for the currently authenticated user.
 * 
 * @throws Will throw an error if no authenticated user is found in the current context.
 * 
 * @returns A Promise that resolves to an array of application objects with their progress information.
 */
export const getApplications = query({
  args: {},
  handler: async (ctx, args) => {
    const userId = await getCurrentUserIdOrThrow(ctx);
    return await ApplicationModel.getApplicationsWithProgress(ctx, userId);
  },
});

/**
 * Retrieves application documents organized by university for the current authenticated user.
 * 
 * This query fetches all documents associated with the current user's university applications.
 * It requires user authentication and will throw an error if no user is currently logged in.
 * 
 * @throws {Error} If no authenticated user is found (from getCurrentUserIdOrThrow)
 * @returns {Promise<Array<ApplicationDocument>>} A promise that resolves to the user's application documents grouped by university
 */
export const getDocumentDetails = query({
  args: {},
  handler: async (ctx, args) => {
    const userId = await getCurrentUserIdOrThrow(ctx);
    return await ApplicationModel.getApplicationDocumentsByUniversity(ctx, userId);
  },
});

/**
 * Retrieves detailed information about a specific application.
 * 
 * This query fetches comprehensive details for an application identified by the provided ID,
 * ensuring that the requesting user has appropriate access permissions.
 * 
 * @param ctx - The Convex execution context
 * @param args - The arguments object
 * @param args.applicationId - The unique identifier of the application to retrieve
 * @returns Promise resolving to the application details
 * @throws Will throw an error if the current user doesn't exist or lacks permission to access the requested application
 */
export const getApplicationDetails = query({
  args: {
    applicationId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserIdOrThrow(ctx);
    return await ApplicationModel.getApplicationWithDetails(ctx, userId, args.applicationId);
  },
});

/**
 * Retrieves a single application by its ID, verifying that the current user has permission to access it.
 * 
 * @param ctx - The Convex execution context
 * @param args - The function arguments
 * @param args.applicationId - The unique identifier of the application to retrieve
 * @returns The requested application if the current user has access
 * @throws Will throw an error if the user doesn't have permission to access this application
 */
export const getApplication = query({
  args: {
    applicationId: v.id("applications"),
  },
  handler: async (ctx, args) => {
    const { application } = await ApplicationModel.verifyApplicationOwnership(ctx, args.applicationId);
    return application;
  }
});