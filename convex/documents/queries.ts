import { v } from "convex/values";
import { query } from "../_generated/server";
import { verifyDocumentOwnership } from "./model"

export const getDocumentById = query({
  args: {
    applicationDocumentId: v.id("applicationDocuments"),
  },
  handler: async (ctx, args) => {
    const { document } = await verifyDocumentOwnership(ctx, args.applicationDocumentId);
    return document;
  }
});
