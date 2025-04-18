import { v } from "convex/values";
import { mutation, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { verifyApplicationOwnership } from "../applications/model";
import { documentTypeValidator, documentStatusValidator } from "../validators";
import { createApplicationDocument, logDocumentActivity, verifyDocumentOwnership, updateApplicationStatusBasedOnDocuments } from "./model";


export const saveDocumentDraft = mutation({
  args: {
    applicationDocumentId: v.id("applicationDocuments"),
    content: v.string(),
  },
  handler: async (ctx: MutationCtx, args) => {
    await verifyDocumentOwnership(ctx, args.applicationDocumentId);
    await ctx.db.patch(args.applicationDocumentId, {
      content: args.content,
      lastEdited: new Date().toISOString()
    });
    return { success: true };
  }
});

export const createDocument = mutation({
  args: {
    applicationId: v.id("applications"),
    type: documentTypeValidator,
  },
  handler: async (ctx: MutationCtx, args) => {
    await verifyApplicationOwnership(ctx, args.applicationId);
    const documentId = await createApplicationDocument(ctx, args.applicationId, args.type);
    return documentId;
  }
});

export const updateRecommender = mutation({
  args: {
    documentId: v.id("applicationDocuments"),
    recommenderName: v.string(),
    recommenderEmail: v.string(),
  },
  handler: async (ctx: MutationCtx, args) => {
    const { document } = await verifyDocumentOwnership(ctx, args.documentId);

    // Check if document is a LOR
    if (document.type !== "lor") {
      throw new Error("Cannot update recommender information for non-LOR documents");
    }

    // Update the document with recommender information
    await ctx.db.patch(args.documentId, {
      recommenderName: args.recommenderName,
      recommenderEmail: args.recommenderEmail,
      lastEdited: new Date().toISOString()
    });

    return { success: true };
  }
});

export const updateDocumentStatus = mutation({
  args: {
    documentId: v.id("applicationDocuments"),
    status: documentStatusValidator,
  },
  handler: async (ctx: MutationCtx, args) => {
    const { document } = await verifyDocumentOwnership(ctx, args.documentId);
    
    // Determine progress percentage based on status
    let progress = document.progress || 0;
    if (args.status === "draft") {
      progress = 33;
    } else if (args.status === "in_review") {
      progress = 66;
    } else if (args.status === "complete") {
      progress = 100;
    } else if (args.status === "not_started") {
      progress = 0;
    }
    
    // Update both status and progress
    await ctx.db.patch(args.documentId, { 
      status: args.status, 
      progress: progress,
      lastEdited: new Date().toISOString() 
    });
    
    // Log status update activity
    logDocumentActivity(ctx, args.documentId, `Document status updated to ${args.status}`, args.status);
    
    // Log progress update activity if progress changed
    if (document.progress !== progress) {
      await logDocumentProgressActivity(ctx, args.documentId, document.progress || 0, progress);
    }
    
    // Automatically update application status based on document statuses
    await updateApplicationStatusBasedOnDocuments(ctx, document.applicationId);
    
    return { success: true, progress };
  }
});

// Helper function to log document progress changes
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