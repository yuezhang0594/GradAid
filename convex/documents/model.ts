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