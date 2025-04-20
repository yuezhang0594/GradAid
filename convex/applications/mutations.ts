import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { DocumentType, DocumentStatus, documentStatusValidator, documentTypeValidator, applicationPriorityValidator, applicationStatusValidator } from "../validators";
import { getCurrentUserIdOrThrow } from "../users";
import { createNewApplication, deleteApplicationWithDocuments, updateApplicationStatusWithMetadata, verifyApplicationOwnership } from "./model";
import { Id } from "../_generated/dataModel";
import { verify } from "crypto";
import { verifyDocumentOwnership } from "../documents/model";

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
  returns: v.id("applications"),
  handler: async (ctx, args) => {
    const userId = await getCurrentUserIdOrThrow(ctx);
    return await createNewApplication(
      ctx,
      userId,
      args.universityId,
      args.programId,
      args.deadline,
      args.priority,
      args.notes,
      args.applicationDocuments
    );
  }
});

export const deleteApplication = mutation({
  args: {
    applicationId: v.id("applications"),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    return await deleteApplicationWithDocuments(ctx, args.applicationId);
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
    await verifyApplicationOwnership(ctx, args.applicationId);
    return await updateApplicationStatusWithMetadata(
      ctx,
      args.applicationId,
      args.status,
      args.notes,
      args.submissionDate
    );
  }
});