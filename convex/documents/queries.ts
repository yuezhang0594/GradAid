import { v } from "convex/values";
import { query } from "../_generated/server";
import * as Document from "./model"

export const getDocumentById = query({
  args: {
    applicationDocumentId: v.id("applicationDocuments"),
  },
  handler: async (ctx, args) => {
    const { document } = await Document.verifyDocumentOwnership(ctx, args.applicationDocumentId);
    return document;
  }
});


/**
 * Get recommender information for a letter of recommendation document
 */
export const getRecommender = query({
  args: {
    documentId: v.id("applicationDocuments"),
  },
  handler: async (ctx, { documentId }) => {
    return await Document.getRecommender(ctx, documentId);
  },
});
