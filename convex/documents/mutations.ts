import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { verifyApplicationOwnership } from "../applications/model";
import { documentTypeValidator, documentStatusValidator } from "../validators";
import { createApplicationDocument, logDocumentActivity, verifyDocumentOwnership } from "./model";


export const saveDocumentDraft = mutation({
  args: {
    applicationDocumentId: v.id("applicationDocuments"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
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
  handler: async (ctx, args) => {
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
  handler: async (ctx, args) => {
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
  handler: async (ctx, args) => {
    await verifyDocumentOwnership(ctx, args.documentId);
    await ctx.db.patch(args.documentId, { status: args.status, lastEdited: new Date().toISOString() });
    logDocumentActivity(ctx, args.documentId, `Document status updated to ${args.status}`, args.status);
    return { success: true };
  }
});