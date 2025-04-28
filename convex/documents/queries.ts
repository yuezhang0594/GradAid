import { v } from "convex/values";
import { query } from "../_generated/server";
import * as Document from "./model"

/**
 * Retrieves a document by its ID, ensuring the requester has ownership access.
 * 
 * @param ctx - The Convex query context
 * @param args - Query arguments containing the document ID
 * @returns The document object if the requester has appropriate permissions
 */
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
 * Retrieves the recommender details for a specific document.
 * 
 * @param ctx - The Convex query context
 * @param args - Query arguments containing the document ID
 * @returns The recommender details for the specified document
 */
export const getRecommender = query({
  args: {
    documentId: v.id("applicationDocuments"),
  },
  handler: async (ctx, { documentId }) => {
    return await Document.getRecommender(ctx, documentId);
  },
});
