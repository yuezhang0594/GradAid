import { Id } from "../_generated/dataModel";
import { ActionCtx, MutationCtx, QueryCtx } from "../_generated/server";
import { logApplicationActivity, verifyApplicationOwnership } from "../applications/model";
import { DocumentType, DocumentStatus } from "../validators";

export async function createApplicationDocument(
  ctx: MutationCtx,
  applicationId: Id<"applications">,
  docType: DocumentType,
) {
  const { userId } = await verifyApplicationOwnership(ctx, applicationId);

  const title = (docType === "sop") ? "Statement of Purpose" :
    (docType === "lor") ? "Letter of Recommendation" : "Error";

  const documentID = await ctx.db.insert("applicationDocuments", {
    applicationId,
    userId,
    type: docType as DocumentType,
    status: "not_started", // Initialize as not started
    progress: 0,
    content: "",
    title: title,
    lastEdited: new Date().toISOString()
  });
  logApplicationActivity(ctx, applicationId, `Document created: ${title}`, "draft");
  return documentID;
}

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

export async function updateDocumentStatus(
  ctx: MutationCtx,
  documentId: Id<"applicationDocuments">,
  status: DocumentStatus
) {
  const { userId, document } = await verifyDocumentOwnership(ctx, documentId);
  await ctx.db.patch(documentId, { status, lastEdited: new Date().toISOString() });
  logDocumentActivity(ctx, documentId, `Document status updated to ${status}`, status);
  return { success: true };
}

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
 * Updates the application status based on the status of all its documents
 * - If all documents are "not_started", application status is set to "draft"
 * - If any document is "draft", application status is set to "in_progress"
 * - Does not modify application if status is already "submitted", "accepted", "rejected", or "deleted"
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
    // No documents, keep as draft
    if (application.status !== "draft") {
      await ctx.db.patch(applicationId, { status: "draft" });
      await logApplicationActivity(ctx, applicationId, "Application status automatically updated to draft", "draft");
    }
    return { success: true, status: "draft" };
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
      newStatus
    );
  }

  return { success: true, status: newStatus };
}