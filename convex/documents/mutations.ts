import { v } from "convex/values";
import { mutation, MutationCtx } from "../_generated/server";
import { documentTypeValidator, documentStatusValidator } from "../validators";
import * as DocumentsModel from "./model";
import { getDocumentById } from "./queries";


export const saveDocumentDraft = mutation({
  args: {
    applicationDocumentId: v.id("applicationDocuments"),
    content: v.string(),
  },
  handler: async (ctx: MutationCtx, args) => {
    await DocumentsModel.updateDocumentContent(ctx, args.applicationDocumentId, args.content);
  }
});

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

