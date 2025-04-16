import { Id } from "../_generated/dataModel";
import { MutationCtx } from "../_generated/server";
import { getCurrentUserIdOrThrow } from "../users";
import { DocumentStatus, DocumentType, ApplicationStatus } from "../validators";

export async function verifyApplicationOwnership(
    ctx: MutationCtx,
    applicationId: Id<"applications">
): Promise<{ userId: Id<"users">, application: any }> {
    // Get user ID from auth
    const userId = await getCurrentUserIdOrThrow(ctx);

    // Get the application to verify ownership
    const application = await ctx.db.get(applicationId);
    if (!application) {
        throw new Error("Application not found");
    }

    if (application.userId !== userId) {
        throw new Error("Unauthorized: Cannot delete application");
    }

    return { userId, application };
}

export async function validateProgramBelongsToUniversity(
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

export async function checkExistingApplication(
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

export async function createApplicationDocument(
  ctx: MutationCtx,
  applicationId: Id<"applications">,
  docType: DocumentType,
) {
  const { userId } = await verifyApplicationOwnership(ctx, applicationId);

  const title = (docType === "sop") ? "Statement of Purpose" :
    (docType === "lor") ? "Letter of Recommendation" : "Error";

  return await ctx.db.insert("applicationDocuments", {
    applicationId,
    userId,
    type: docType as DocumentType,
    status: "not_started", // Initialize as not started
    progress: 0,
    content: "",
    title: title,
    lastEdited: new Date().toISOString()
  });
}

export async function createApplicationDocuments(
  ctx: MutationCtx,
  applicationId: Id<"applications">,
  applicationDocuments: Array<{ type: DocumentType, status: DocumentStatus }>
) {
  const documentPromises = applicationDocuments.map(document =>
    createApplicationDocument(ctx, applicationId, document.type)
  );

  return Promise.all(documentPromises);
}

export async function logApplicationActivity(
  ctx: MutationCtx,
  userId: Id<"users">,
  applicationId: Id<"applications">,
  description: string,
  status: ApplicationStatus
) {
  await ctx.db.insert("userActivity", {
    userId,
    type: "application_update",
    description: description,
    timestamp: new Date().toISOString(),
    metadata: {
      applicationId: applicationId,
      newStatus: status
    }
  });
}