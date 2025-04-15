import { v } from "convex/values";
import { mutation, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { DocumentType, DocumentStatus, documentStatusValidator, documentTypeValidator, applicationPriorityValidator } from "../validators";
import { getCurrentUserIdOrThrow, getDemoUserId } from "../users";

export const saveDocumentDraft = mutation({
  args: {
    applicationDocumentId: v.id("applicationDocuments"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserIdOrThrow(ctx);

    // Get the document
    const document = await ctx.db.get(args.applicationDocumentId);
    if (!document) {
      throw new Error("Document not found");
    }

    // Get the application to verify ownership
    const application = await ctx.db.get(document.applicationId);
    if (!application || application.userId !== userId) {
      throw new Error("Unauthorized: Cannot save document");
    }

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
    status: v.union(
      v.literal("draft"),
      v.literal("in_progress"),
      v.literal("submitted"),
      v.literal("accepted"),
      v.literal("rejected")
    ),
    notes: v.optional(v.string()),
    submissionDate: v.optional(v.string()),
  },
  returns: v.id("applications"),
  handler: async (ctx, args) => {
    // Get user ID from auth
    const userId = await getCurrentUserIdOrThrow(ctx);

    // Get the application to verify ownership
    const application = await ctx.db.get(args.applicationId);
    if (!application) {
      throw new Error("Application not found");
    }

    if (application.userId !== userId) {
      throw new Error("Unauthorized: Cannot update application status");
    }

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

// Helper function to validate university and program
async function validateProgramBelongsToUniversity(
  ctx: MutationCtx,
  universityId: Id<"universities">,
  programId: Id<"programs">
) {
  // Verify the university and program exist
  const university = await ctx.db.get(universityId);
  if (!university) {
    throw new Error("University not found");
  }

  const program = await ctx.db.get(programId);
  if (!program) {
    throw new Error("Program not found");
  }

  // Ensure the program belongs to the specified university
  if (program.universityId !== universityId) {
    throw new Error("Program does not belong to the specified university");
  }

  return { university, program };
}

// Helper function to check for existing application
async function checkExistingApplication(
  ctx: MutationCtx,
  userId: Id<"users">,
  programId: Id<"programs">
) {
  const existingApplication = await ctx.db
    .query("applications")
    .withIndex("by_user", (q) =>
      q.eq("userId", userId)
    )
    .filter((q) => q.eq(q.field("programId"), programId))
    .first();

  if (existingApplication) {
    throw new Error("You already have an application for this program");
  }
}

// Helper function to create application documents
async function createApplicationDocuments(
  ctx: MutationCtx,
  applicationId: Id<"applications">,
  userId: Id<"users">,
  requirements: Array<{ type: string, status: string }>
) {
  for (const requirement of requirements) {
    const docType = requirement.type.startsWith("lor") ? "lor" : requirement.type;
    await ctx.db.insert("applicationDocuments", {
      applicationId,
      userId,
      type: docType as DocumentType,
      status: "not_started", // Initialize as not started
      progress: 0,
      content: "",
      title: requirement.type === "sop" ?
        "Statement of Purpose" :
        requirement.type === "lor" ?
          "Letter of Recommendation" :
          "An error has occurred",
      lastEdited: new Date().toISOString()
    });
  }
}

// Helper function to log application creation activity
async function logApplicationActivity(
  ctx: MutationCtx,
  userId: Id<"users">,
  applicationId: Id<"applications">,
  description: string
) {
  await ctx.db.insert("userActivity", {
    userId,
    type: "application_update",
    description: description,
    timestamp: new Date().toISOString(),
    metadata: {
      applicationId: applicationId,
      newStatus: "in_progress"
    }
  });
}

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
    // Get user ID from auth
    const userId = await getCurrentUserIdOrThrow(ctx);

    // Validate university and program
    await validateProgramBelongsToUniversity(ctx, args.universityId, args.programId);

    // Check for existing application
    await checkExistingApplication(ctx, userId, args.programId);

    // Set default requirements if not provided
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

    // Create application record
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

    // Log activity
    await logApplicationActivity(ctx, userId, applicationId, "Application created");

    // Create application documents
    await createApplicationDocuments(ctx, applicationId, userId, args.applicationDocuments || defaultApplicationDocuments);

    return applicationId;
  }
});
