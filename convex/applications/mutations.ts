import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { DocumentType, DocumentStatus } from "./schema";
import { getCurrentUserIdOrThrow, getDemoUserId } from "../users";

export const saveDocumentDraft = mutation({
  args: {
    applicationId: v.id("applications"),
    documentType: v.string(),
    content: v.string(),
    demoMode: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    let userId: Id<"users">;
    
    // Get user ID from auth or use mock
    const identity = await ctx.auth.getUserIdentity();
    if (args.demoMode) {
      userId = await getDemoUserId(ctx);
    } else if (identity?.subject) {
      userId = await getCurrentUserIdOrThrow(ctx);
    } else {
      userId = "mock-user-id" as Id<"users">;
    }

    // Get the application to verify ownership
    const application = await ctx.db.get(args.applicationId);
    if (!application || application.userId !== userId) {
      throw new Error("Unauthorized: Cannot save document");
    }

    // Find the existing document
    const existingDoc = await ctx.db
      .query("applicationDocuments")
      .withIndex("by_application", (q) => 
        q.eq("applicationId", args.applicationId)
      )
      .filter((q) => q.eq(q.field("type"), args.documentType as DocumentType))
      .first();

    if (existingDoc) {
      // Update existing document
      await ctx.db.patch(existingDoc._id, {
        content: args.content,
        lastEdited: new Date().toISOString()
      });
      return existingDoc._id;
    } else {
      // Create new document
      const docId = await ctx.db.insert("applicationDocuments", {
        applicationId: args.applicationId,
        type: args.documentType as DocumentType,
        content: args.content,
        status: "draft" as DocumentStatus,
        progress: 0,
        lastEdited: new Date().toISOString(),
        userId,
        title: `${args.documentType.toUpperCase()} - Draft`
      });
      return docId;
    }
  }
});
