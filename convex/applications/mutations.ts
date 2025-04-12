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
    demoMode: v.optional(v.boolean())
  },
  returns: v.id("applications"),
  handler: async (ctx, args) => {
    let userId: Id<"users">;
    
    // Get user ID from auth or use demo mode
    if (args.demoMode) {
      userId = await getDemoUserId(ctx);
    } else {
      userId = await getCurrentUserIdOrThrow(ctx);
    }

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

export const createApplication = mutation({
  args: {
    universityId: v.id("universities"),
    programId: v.id("programs"),
    deadline: v.string(),
    priority: v.union(
      v.literal("high"), 
      v.literal("medium"), 
      v.literal("low")
    ),
    notes: v.optional(v.string()),
    requirements: v.array(
      v.object({
      type: v.string(),
      status: v.union(
        v.literal("completed"),
        v.literal("in_progress"),
        v.literal("pending"),
        v.literal("not_started")
        ),
      }
    ))
  },
  handler: async (ctx, args) => {
    // Get user ID from auth
    const userId = await getCurrentUserIdOrThrow(ctx);
    
    // Verify the university and program exist
    const university = await ctx.db.get(args.universityId);
    if (!university) {
      throw new Error("University not found");
    }
    
    const program = await ctx.db.get(args.programId);
    if (!program) {
      throw new Error("Program not found");
    }
    
    // Ensure the program belongs to the specified university
    if (program.universityId !== args.universityId) {
      throw new Error("Program does not belong to the specified university");
    }

    // Check if the user already has an application for this program
    const existingApplication = await ctx.db
      .query("applications")
      .withIndex("by_user", (q) => 
        q.eq("userId", userId)
      )
      .filter((q) => q.eq(q.field("programId"), args.programId))
      .first();
    if (existingApplication) {
      throw new Error("You already have an application for this program");
    }

    // Set default requirements if not provided
    const defaultRequirements = [
      {
        type: "sop",
        status: "not_started" as const
      },
      {
        type: "lor",
        status: "not_started" as const
      },
      {
        type: "lor",
        status: "not_started" as const
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
      requirements: args.requirements || defaultRequirements
    });

    // Log activity
    await ctx.db.insert("userActivity", {
      userId,
      type: "application_update",
      description: "Application created",
      timestamp: new Date().toISOString(),
      metadata: {
        applicationId: applicationId,
        newStatus: "in_progress"
      }
    });

    // Create application documents for each requirement
    const requirements = args.requirements || defaultRequirements;
    for (const requirement of requirements) {
      const docType = requirement.type.startsWith("lor") ? "lor" : requirement.type;
      await ctx.db.insert("applicationDocuments", {
        applicationId,
        userId,
        type: docType as DocumentType,
        status: "draft", // Initialize as draft
        progress: 0,
        content: "",
        title: `${requirement.type.toUpperCase()} - Draft`, // Keep original type in title
        lastEdited: new Date().toISOString()
      });
    }

    return applicationId;
  }
});
