import { query } from "../_generated/server";
import { getCurrentUserIdOrThrow, getDemoUserId } from "../users";
import { Id } from "../_generated/dataModel";
import { v } from "convex/values";

// Query to get applications for a specific user
export const getApplications = query({
  args: {},
  handler: async (ctx, args) => {
    const userId = await getCurrentUserIdOrThrow(ctx);

    // Get all applications for the user
    const applications = await ctx.db
      .query("applications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Get university and program details for each application
    const applicationsWithDetails = await Promise.all(
      applications.map(async (application) => {
        const university = await ctx.db.get(application.universityId);
        const program = await ctx.db.get(application.programId);

        // Get documents for this application
        const documents = await ctx.db
          .query("applicationDocuments")
          .withIndex("by_application", (q) => q.eq("applicationId", application._id))
          .collect();

        // Calculate document completion
        const totalDocuments = documents.length;
        const completeDocuments = documents.filter(doc => doc.status === "complete").length;
        const progress = totalDocuments > 0 ? Math.round((completeDocuments / totalDocuments) * 100) : 0;

        return {
          id: application._id,
          university: university?.name ?? "Unknown University",
          program: program?.name ?? "Unknown Program",
          degree: program?.degree ?? "Unknown Degree",
          status: application.status,
          priority: application.priority,
          deadline: application.deadline,
          documentsComplete: completeDocuments,
          totalDocuments,
          progress,
        };
      })
    );

    return applicationsWithDetails;
  },
});

// Query to get document details with application info
export const getDocumentDetails = query({
  args: {},
  handler: async (ctx, args) => {
    // Get user ID
    const userId = await getCurrentUserIdOrThrow(ctx);

    // Get all applications for the user
    const applications = await ctx.db
      .query("applications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Get documents for each application and group by university
    const universitiesMap = new Map();

    for (const application of applications) {
      const university = await ctx.db.get(application.universityId);
      const program = await ctx.db.get(application.programId);

      if (!university || !program) continue;

      // Get documents for this application
      const documents = await ctx.db
        .query("applicationDocuments")
        .withIndex("by_application", (q) => q.eq("applicationId", application._id))
        .collect();

      const universityData = universitiesMap.get(university.name) || {
        name: university.name,
        documents: [],
        programs: []
      };

      // Add program if not already present
      if (!universityData.programs.some((p: { applicationId: Id<"applications"> }) => p.applicationId === application._id)) {
        universityData.programs.push({
          applicationId: application._id,
          name: `${program.degree} in ${program.name}`
        });
      }

      // Add documents with their IDs
      for (const doc of documents) {
        universityData.documents.push({
          documentId: doc._id, // Include the applicationDocuments ID
          type: doc.type,
          status: doc.status,
          progress: doc.progress ?? 0,
          count: 1,
          program: `${program.degree} in ${program.name}`
        });
      }

      universitiesMap.set(university.name, universityData);
    }

    const result = Array.from(universitiesMap.values());
    console.log("Document details query output:", result);
    return result;
  },
});

// Query to get application details, documents, and LORs for a specific university
export const getApplicationDetails = query({
  args: {
    applicationId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get user ID
    const userId = await getCurrentUserIdOrThrow(ctx);

    // Get application details
    const application = await ctx.db
      .query("applications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("_id"), args.applicationId))
      .first();

    if (!application) {
      return null;
    }

    // Get university and program details
    const university = await ctx.db.get(application.universityId);
    const program = await ctx.db.get(application.programId);

    // Get documents
    const documents = await ctx.db
      .query("applicationDocuments")
      .withIndex("by_application", (q) => q.eq("applicationId", application._id))
      .collect();

    return {
      ...application,
      university: university?.name ?? "Unknown University",
      program: program?.name ?? "Unknown Program",
      degree: program?.degree ?? "Unknown Degree",
      documents: documents,
    };
  },
});

// Query to get university by name
export const getUniversityByName = query({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const university = await ctx.db
      .query("universities")
      .filter((q) => q.eq(q.field("name"), args.name))
      .first();
    return university;
  },
});

// Query to get document by ID
export const getDocumentById = query({
  args: {
    applicationDocumentId: v.id("applicationDocuments"),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserIdOrThrow(ctx);
    console.log("Getting document for:", { userId, ...args });

    // Get the document to verify ownership
    const document = await ctx.db.get(args.applicationDocumentId);
    console.log("Found document:", document);
    if (!document) {
      console.log("Document not found");
      return null;
    }

    // Get the application to verify ownership
    const application = await ctx.db.get(document.applicationId);
    if (!application || application.userId !== userId) {
      console.log("Application not found or unauthorized");
      return null;
    }

    return document;
  }
});

export const getApplication = query({
  args: {
    applicationId: v.id("applications"),
  },
  handler: async (ctx, args) => {
    const application = await ctx.db.get(args.applicationId);
    if (!application) {
      throw new Error("Application not found");
    }
    return application;
  }
});