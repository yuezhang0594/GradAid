import { Id } from "../_generated/dataModel";
import { MutationCtx, QueryCtx } from "../_generated/server";
import { logApplicationActivity, verifyApplicationOwnership } from "../applications/model";
import { DocumentType, DocumentStatus } from "../validators";

/**
 * Creates a new application document associated with a specific application.
 *
 * @param ctx - The mutation context for the database operation
 * @param applicationId - The ID of the application to associate the document with
 * @param docType - The type of document to create (e.g., "sop" or "lor")
 * 
 * @remarks
 * This function will first verify that the current user owns the application.
 * The document is initialized with a status of "not_started", 0% progress, and empty content.
 * The title is automatically set based on the document type.
 * 
 * @throws Will throw an error if the user doesn't own the specified application
 * 
 * @returns A Promise that resolves to the ID of the newly created document
 */
export async function createApplicationDocument(
  ctx: MutationCtx,
  applicationId: Id<"applications">,
  docType: DocumentType,
) {
  const { userId } = await verifyApplicationOwnership(ctx, applicationId);

  const title = (docType === "sop") ? "Statement of Purpose" :
    (docType === "lor") ? "Letter of Recommendation" : "Error";

  const documentId = await ctx.db.insert("applicationDocuments", {
    applicationId,
    userId,
    type: docType as DocumentType,
    status: "not_started", // Initialize as not started
    progress: 0,
    content: "",
    title: title,
    lastEdited: new Date().toISOString()
  });
  await logDocumentActivity(ctx, documentId, `Document created: ${title}`, "draft");
  return documentId;
}

/**
 * Creates multiple application documents for a given application.
 * 
 * @param ctx - The mutation context for database operations
 * @param applicationId - The ID of the application to associate documents with
 * @param applicationDocuments - Array of document configurations with type and status
 * @returns Promise resolving to an array of created application documents
 * 
 * @remarks
 * This function creates multiple documents in parallel by mapping over the provided
 * applicationDocuments array. Note that while the input contains document status,
 * only the document type is passed to the underlying createApplicationDocument function.
 */
export async function createApplicationDocuments(
  ctx: MutationCtx,
  applicationId: Id<"applications">,
  applicationDocuments: Array<{ type: DocumentType, status: DocumentStatus }>
) {
  const documentPromises = applicationDocuments.map(document =>
    createApplicationDocument(ctx, applicationId, document.type)
  );

  return Promise.all(documentPromises);
}

/**
 * Verifies ownership of a document by checking if the user owns the application associated with it.
 * 
 * @param ctx - The Convex query or mutation context
 * @param documentId - The ID of the document to verify ownership for
 * @returns An object containing the verified user ID and the document object
 * @throws {Error} When the document is not found
 * @see verifyApplicationOwnership - This function is used to verify the application ownership
 */
export async function verifyDocumentOwnership(
  ctx: QueryCtx | MutationCtx,
  documentId: Id<"applicationDocuments">
) {
  const document = await ctx.db.get(documentId);
  if (!document) {
    throw new Error("Document not found");
  }
  const { userId } = await verifyApplicationOwnership(ctx, document.applicationId);
  return { userId, document };
}

/**
 * Updates the status of an application document and automatically adjusts its progress.
 * 
 * This function will:
 * - Verify the user has appropriate ownership of the document
 * - Calculate the appropriate progress value based on the new status
 * - Update the document's status, progress, and lastEdited timestamp
 * - Log activity for the status change
 * - Log an additional progress activity if the progress value changes
 *
 * @param ctx - The Convex mutation context
 * @param documentId - The ID of the application document to update
 * @param status - The new status to set for the document
 * 
 * @throws Will throw an error if the user does not have ownership of the document
 */
export async function updateDocumentStatus(
  ctx: MutationCtx,
  documentId: Id<"applicationDocuments">,
  status: DocumentStatus
) {
  const { document } = await verifyDocumentOwnership(ctx, documentId);

  const progress = determineProgressByStatus(status);

  // Update both status and progress
  await ctx.db.patch(documentId, {
    status: status,
    progress: progress,
    lastEdited: new Date().toISOString()
  });
  await logDocumentActivity(ctx, documentId, `Document status updated to ${status}`, status);

  // Log progress update activity if progress changed
  if (document.progress !== progress) {
    await logDocumentProgressActivity(ctx, documentId, document.progress || 0, progress);
  }
}

/**
 * Logs an activity record when a document's status changes.
 * 
 * This function records activity in the userActivity table, storing information
 * about a document status change including who performed the action, what changed,
 * and when it occurred.
 *
 * @param ctx - The mutation context providing access to the database
 * @param documentId - The ID of the document being updated
 * @param description - A human-readable description of the status change
 * @param status - The new status being applied to the document
 * 
 * @throws Will throw an error if the user doesn't have permission to access the document
 * 
 * @example
 * await logDocumentActivity(
 *   ctx,
 *   documentId,
 *   "Document marked as reviewed",
 *   "reviewed"
 * );
 */
export async function logDocumentActivity(
  ctx: MutationCtx,
  documentId: Id<"applicationDocuments">,
  description: string,
  status: DocumentStatus
) {
  const { userId, document } = await verifyDocumentOwnership(ctx, documentId);
  await ctx.db.insert("userActivity", {
    userId,
    type: "document_status_update",
    description: description,
    timestamp: new Date().toISOString(),
    metadata: {
      documentId: documentId,
      oldStatus: document.status,
      newStatus: status
    }
  });
}

/**
 * Logs a user activity entry when a document's progress percentage changes.
 * 
 * This function verifies document ownership before creating an activity record.
 * The activity is categorized as "document_edit" type and includes the percentage change details.
 *
 * @param ctx - The mutation context for database operations
 * @param documentId - The ID of the document whose progress is being updated
 * @param oldProgress - The previous progress percentage value
 * @param newProgress - The new progress percentage value
 * 
 * @throws Will throw an error if the user doesn't own the specified document
 */
async function logDocumentProgressActivity(
  ctx: MutationCtx,
  documentId: Id<"applicationDocuments">,
  oldProgress: number,
  newProgress: number
) {
  const { userId } = await verifyDocumentOwnership(ctx, documentId);
  await ctx.db.insert("userActivity", {
    userId,
    type: "document_edit",
    description: `Document progress updated from ${oldProgress}% to ${newProgress}%`,
    timestamp: new Date().toISOString(),
    metadata: {
      documentId: documentId,
      oldProgress: oldProgress,
      newProgress: newProgress
    }
  });
}

/**
 * Converts a document status to a numeric progress percentage.
 *
 * @param status - The current status of the document
 * @returns A number representing the percentage of completion:
 *   - 0 for "not_started" or unknown status
 *   - 33 for "draft"
 *   - 66 for "in_review"
 *   - 100 for "complete"
 */
function determineProgressByStatus(status: DocumentStatus): number {
  switch (status) {
    case "not_started":
      return 0;
    case "draft":
      return 33;
    case "in_review":
      return 66;
    case "complete":
      return 100;
    default:
      return 0; // Default to 0 if status is unknown
  }
}

/**
 * Retrieves all application documents associated with a specific user.
 * 
 * @param ctx - The query context for database operations
 * @param userId - The unique identifier of the user whose documents are being retrieved
 * @returns A promise that resolves to an array of application document objects
 */
export async function getDocumentsForUser(
  ctx: QueryCtx,
  userId: Id<"users">,
) {
  return await ctx.db
    .query("applicationDocuments")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();
}

/**
 * Updates the content of a specific application document.
 * 
 * This function verifies the user's ownership of the document before updating its content
 * and the last edited timestamp. It also logs the update activity.
 *
 * @param ctx - The mutation context for database operations
 * @param documentId - The ID of the document to update
 * @param content - The new content for the document
 * @throws Will throw an error if the user does not own the document
 */
export async function updateDocumentContent(
  ctx: MutationCtx,
  documentId: Id<"applicationDocuments">,
  content: string,
) {
  const { document } = await verifyDocumentOwnership(ctx, documentId);
  await ctx.db.patch(document._id, { content: content, lastEdited: new Date().toISOString() });
  await logDocumentActivity(ctx, document._id, `Document content updated`, document.status);
}

/**
 * Retrieves the recommender's name and email for a Letter of Recommendation (LOR) document.
 * 
 * This function first verifies the user's ownership of the document.
 * It then checks if the document type is "lor". If not, it throws an error.
 * Otherwise, it returns the recommender's details stored in the document.
 *
 * @param ctx - The query context for database operations
 * @param documentId - The ID of the LOR document
 * @returns A promise resolving to an object containing the recommender's name and email
 * @throws Will throw an error if the user does not own the document
 * @throws Will throw an error if the document type is not "lor"
 */
export async function getRecommender(
  ctx: QueryCtx,
  documentId: Id<"applicationDocuments">,
) {
  const { document } = await verifyDocumentOwnership(ctx, documentId);
  if (document.type !== "lor") {
    throw new Error("Cannot get recommender information for non-LOR documents");
  }
  return {
    name: document.recommenderName,
    email: document.recommenderEmail
  };
}

/**
 * Updates the recommender's name and email for a Letter of Recommendation (LOR) document.
 * 
 * This function verifies the user's ownership of the document and ensures it's an LOR type.
 * It then updates the recommender details and the last edited timestamp in the database.
 * Finally, it logs the update activity.
 *
 * @param ctx - The mutation context for database operations
 * @param documentId - The ID of the LOR document to update
 * @param recommenderName - The new name of the recommender
 * @param recommenderEmail - The new email address of the recommender
 * @throws Will throw an error if the user does not own the document
 * @throws Will throw an error if the document type is not "lor"
 */
export async function updateRecommender(
  ctx: MutationCtx,
  documentId: Id<"applicationDocuments">,
  recommenderName: string,
  recommenderEmail: string,
) {
  // Verify document ownership
  const { document } = await verifyDocumentOwnership(ctx, documentId);

  // Check if document is a LOR
  if (document.type !== "lor") {
    throw new Error("Cannot update recommender information for non-LOR documents");
  }

  // Update the document with recommender information
  await ctx.db.patch(document._id, {
    recommenderName: recommenderName,
    recommenderEmail: recommenderEmail,
    lastEdited: new Date().toISOString()
  });

  await logDocumentActivity(ctx, document._id, `Recommender updated`, document.status);
}

/**
 * Updates the application status based on the collective status of its associated documents.
 * 
 * This function determines the appropriate application status ("not_started", "draft", "in_progress")
 * based on the statuses of all documents linked to the application.
 * - If there are no documents, the status is set to "not_started".
 * - If all documents are "not_started", the application status is set to "draft".
 * - If any document is "draft" or "in_review", the application status is set to "in_progress".
 * 
 * The function does not modify the application status if it is already in a terminal state
 * ("submitted", "accepted", "rejected", "deleted").
 * It logs an activity entry if the application status is changed.
 *
 * @param ctx - The mutation context for database operations
 * @param applicationId - The ID of the application whose status needs to be updated
 * @returns A promise resolving to an object indicating success and the final application status
 * @throws Will throw an error if the application with the given ID is not found
 */
export async function updateApplicationStatusBasedOnDocuments(
  ctx: MutationCtx,
  applicationId: Id<"applications">
) {
  // Get the application
  const application = await ctx.db.get(applicationId);
  if (!application) {
    throw new Error(`Application with ID ${applicationId} not found`);
  }

  // Don't modify application status if it's already in a terminal state
  if (
    application.status === "submitted" ||
    application.status === "accepted" ||
    application.status === "rejected" ||
    application.status === "deleted"
  ) {
    return { success: true, status: application.status };
  }

  // Get all documents for this application
  const documents = await ctx.db
    .query("applicationDocuments")
    .filter((q) => q.eq(q.field("applicationId"), applicationId))
    .collect();

  if (documents.length === 0) {
    // No documents, keep as not_started
    if (application.status !== "not_started") {
      await ctx.db.patch(applicationId, { status: "not_started" });
      await logApplicationActivity(
        ctx,
        applicationId,
        "Application status automatically updated to not_started",
        application.status,
        "not_started"
      );
    }
    return { success: true, status: "not_started" };
  }

  // Check document statuses
  const allNotStarted = documents.every((doc) => doc.status === "not_started");
  const anyDraft = documents.some((doc) => doc.status === "draft" || doc.status === "in_review");

  let newStatus = application.status;

  if (allNotStarted) {
    newStatus = "draft";
  } else if (anyDraft) {
    newStatus = "in_progress";
  }

  // Update application status if it changed
  if (newStatus !== application.status) {
    await ctx.db.patch(applicationId, { status: newStatus });
    await logApplicationActivity(
      ctx,
      applicationId,
      `Application status automatically updated to ${newStatus}`,
      application.status,
      newStatus
    );
  }

  return { success: true, status: newStatus };
}