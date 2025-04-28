import { v } from "convex/values";
import { mutation, MutationCtx } from "../_generated/server";
import { documentTypeValidator, documentStatusValidator } from "../validators";
import * as DocumentsModel from "./model";


/**
 * Saves the draft content of an application document.
 * @param applicationDocumentId - The ID of the application document to update.
 * @param content - The new content for the document.
 */
export const saveDocumentDraft = mutation({
  args: {
    applicationDocumentId: v.id("applicationDocuments"),
    content: v.string(),
  },
  handler: async (ctx: MutationCtx, args) => {
    await DocumentsModel.updateDocumentContent(ctx, args.applicationDocumentId, args.content);
  }
});

/**
 * Creates a new application document record.
 * @param applicationId - The ID of the application this document belongs to.
 * @param type - The type of the document (e.g., 'personal_statement', 'recommendation_letter').
 * @returns The ID of the newly created document.
 */
export const createDocument = mutation({
  args: {
    applicationId: v.id("applications"),
    type: documentTypeValidator,
  },
  handler: async (ctx: MutationCtx, args) => {
    const documentId = await DocumentsModel.createApplicationDocument(ctx, args.applicationId, args.type);
    return documentId;
  }
});

/**
 * Updates the recommender details for a recommendation letter document.
 * @param documentId - The ID of the recommendation letter document.
 * @param recommenderName - The name of the recommender.
 * @param recommenderEmail - The email of the recommender.
 */
export const updateRecommender = mutation({
  args: {
    documentId: v.id("applicationDocuments"),
    recommenderName: v.string(),
    recommenderEmail: v.string(),
  },
  handler: async (ctx: MutationCtx, args) => {
    await DocumentsModel.updateRecommender(ctx, args.documentId, args.recommenderName, args.recommenderEmail);
  }
});

/**
 * Updates the status of an application document.
 * Also updates the parent application's status based on all its documents.
 * Requires document ownership verification.
 * @param documentId - The ID of the document to update.
 * @param status - The new status for the document.
 */
export const updateDocumentStatus = mutation({
  args: {
    documentId: v.id("applicationDocuments"),
    status: documentStatusValidator,
  },
  handler: async (ctx: MutationCtx, args) => {
    const { document } = await DocumentsModel.verifyDocumentOwnership(ctx, args.documentId);
    await DocumentsModel.updateDocumentStatus(ctx, args.documentId, args.status);
    await DocumentsModel.updateApplicationStatusBasedOnDocuments(ctx, document.applicationId);
  }
});

