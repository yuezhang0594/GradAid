import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";

// Update application status
export const updateApplicationStatus = mutation({
  args: {
    applicationId: v.id("applications"),
    status: v.union(
      v.literal("draft"),
      v.literal("in_progress"),
      v.literal("submitted"),
      v.literal("accepted"),
      v.literal("rejected")
    ),
    submissionDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { applicationId, status, submissionDate } = args;
    
    // Get the current application to preserve other fields
    const application = await ctx.db.get(applicationId);
    if (!application) {
      throw new Error("Application not found");
    }

    // Update application status
    await ctx.db.patch(applicationId, {
      status,
      submissionDate: status === "submitted" ? submissionDate : undefined,
      lastUpdated: new Date().toISOString(),
    });

    // Log activity
    await ctx.db.insert("userActivity", {
      userId: application.userId,
      type: "application_update",
      description: `Application status updated to ${status}`,
      timestamp: new Date().toISOString(),
      metadata: {
        applicationId,
        oldStatus: application.status,
        newStatus: status,
      },
    });

    return true;
  },
});

// Update document progress
export const updateDocumentProgress = mutation({
  args: {
    documentId: v.id("applicationDocuments"),
    progress: v.number(),
    status: v.union(
      v.literal("draft"),
      v.literal("in_review"),
      v.literal("complete")
    ),
    content: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { documentId, progress, status, content } = args;

    // Get the current document to preserve other fields
    const document = await ctx.db.get(documentId);
    if (!document) {
      throw new Error("Document not found");
    }

    // Update document
    await ctx.db.patch(documentId, {
      progress,
      status,
      content: content !== undefined ? content : document.content,
      lastEdited: new Date().toISOString(),
    });

    // Log activity
    await ctx.db.insert("userActivity", {
      userId: document.userId,
      type: "document_edit",
      description: `Updated ${document.title} (${progress}% complete)`,
      timestamp: new Date().toISOString(),
      metadata: {
        documentId,
        oldProgress: document.progress,
        newProgress: progress,
      },
    });

    return true;
  },
});

// Update LOR status
export const updateLorStatus = mutation({
  args: {
    lorId: v.id("letterOfRecommendations"),
    status: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("submitted")
    ),
    submittedDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { lorId, status, submittedDate } = args;

    // Get the current LOR to preserve other fields
    const lor = await ctx.db.get(lorId);
    if (!lor) {
      throw new Error("LOR not found");
    }

    // Update LOR status
    await ctx.db.patch(lorId, {
      status,
      submittedDate: status === "submitted" ? submittedDate : undefined,
    });

    // Log activity
    await ctx.db.insert("userActivity", {
      userId: lor.userId,
      type: "lor_update",
      description: `LOR from ${lor.recommenderName} ${status === "submitted" ? "received" : "status updated"}`,
      timestamp: new Date().toISOString(),
      metadata: {
        lorId,
        oldStatus: lor.status,
        newStatus: status,
      },
    });

    return true;
  },
});

// Use AI credits
export const useAiCredits = mutation({
  args: {
    userId: v.string(),
    creditsUsed: v.number(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId, creditsUsed, description } = args;

    // Get current AI credits
    const aiCredits = await ctx.db
      .query("aiCredits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!aiCredits) {
      throw new Error("AI credits not found for user");
    }

    if (aiCredits.usedCredits + creditsUsed > aiCredits.totalCredits) {
      throw new Error("Not enough AI credits available");
    }

    // Update AI credits
    await ctx.db.patch(aiCredits._id, {
      usedCredits: aiCredits.usedCredits + creditsUsed,
      lastUpdated: new Date().toISOString(),
    });

    // Log activity
    await ctx.db.insert("userActivity", {
      userId,
      type: "ai_usage",
      description,
      timestamp: new Date().toISOString(),
      metadata: {
        creditsUsed,
        remainingCredits: aiCredits.totalCredits - (aiCredits.usedCredits + creditsUsed),
      },
    });

    return {
      remainingCredits: aiCredits.totalCredits - (aiCredits.usedCredits + creditsUsed),
    };
  },
});
