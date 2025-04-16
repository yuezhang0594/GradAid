import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { DocumentType, DocumentStatus, documentStatusValidator, documentTypeValidator, applicationPriorityValidator, applicationStatusValidator } from "../validators";
import { getCurrentUserIdOrThrow } from "../users";
import { checkExistingApplication, createApplicationDocument, createApplicationDocuments, logApplicationActivity, validateProgramBelongsToUniversity, verifyApplicationOwnership } from "./helpers";

export const saveDocumentDraft = mutation({
  args: {
    applicationDocumentId: v.id("applicationDocuments"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the document
    const document = await ctx.db.get(args.applicationDocumentId);
    if (!document) {
      throw new Error("Document not found");
    }

    // Verify application ownership
    await verifyApplicationOwnership(ctx, document.applicationId);

    // Update the document
    await ctx.db.patch(args.applicationDocumentId, {
      content: args.content,
      lastEdited: new Date().toISOString()
    });

    return { success: true };
  }
});

export const updateApplicationStatus = mutation({
  args: {
    applicationId: v.id("applications"),
    status: applicationStatusValidator,
    notes: v.optional(v.string()),
    submissionDate: v.optional(v.string()),
  },
  returns: v.id("applications"),
  handler: async (ctx, args) => {
    // Verify application ownership
    const { userId, application } = await verifyApplicationOwnership(ctx, args.applicationId);

    // Create update object
    const updateData: Record<string, any> = {
      status: args.status,
      lastUpdated: new Date().toISOString()
    };

    // Add optional fields if provided
    if (args.notes !== undefined) {
      updateData.notes = args.notes;
    }

    if (args.status === "submitted" && args.submissionDate) {
      updateData.submissionDate = args.submissionDate;
    }

    // Update application status
    await ctx.db.patch(args.applicationId, updateData);

    // Log activity
    await ctx.db.insert("userActivity", {
      userId,
      type: "application_update",
      description: `Application status updated to ${args.status}`,
      timestamp: new Date().toISOString(),
      metadata: {
        applicationId: args.applicationId,
        oldStatus: application.status,
        newStatus: args.status
      }
    });

    return args.applicationId;
  }
});

export const createApplication = mutation({
  args: {
    universityId: v.id("universities"),
    programId: v.id("programs"),
    deadline: v.string(),
    priority: applicationPriorityValidator,
    notes: v.optional(v.string()),
    applicationDocuments: v.array(
      v.object({
        type: documentTypeValidator,
        status: documentStatusValidator,
      })
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserIdOrThrow(ctx);
    await validateProgramBelongsToUniversity(ctx, args.universityId, args.programId);
    await checkExistingApplication(ctx, userId, args.programId);
    const defaultApplicationDocuments = [
      {
        type: "sop" as DocumentType,
        status: "not_started" as DocumentStatus
      },
      {
        type: "lor" as DocumentType,
        status: "not_started" as DocumentStatus
      },
      {
        type: "lor" as DocumentType,
        status: "not_started" as DocumentStatus
      }
    ];

    const applicationId = await ctx.db.insert("applications", {
      userId,
      universityId: args.universityId,
      programId: args.programId,
      deadline: args.deadline,
      priority: args.priority,
      notes: args.notes ?? "",
      status: "in_progress",
      submissionDate: undefined,
      lastUpdated: new Date().toISOString(),
    });
    await createApplicationDocuments(ctx, applicationId, args.applicationDocuments || defaultApplicationDocuments);
    await logApplicationActivity(ctx, userId, applicationId, "Application created", "draft");
    return applicationId;
  }
});

export const deleteApplication = mutation({
  args: {
    applicationId: v.id("applications"),
  },
  handler: async (ctx, args) => {
    const { userId } = await verifyApplicationOwnership(ctx, args.applicationId);

    // Delete the application and its documents
    await ctx.db.delete(args.applicationId);
    const applicationDocuments = await ctx.db
      .query("applicationDocuments")
      .filter((q) => q.eq(q.field("applicationId"), args.applicationId))
      .collect();
    for (const doc of applicationDocuments) {
      await ctx.db.delete(doc._id);
    }

    await logApplicationActivity(ctx, userId, args.applicationId, "Application deleted", "deleted");

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