import { query } from "../_generated/server";
import { getCurrentUserIdOrThrow, getDemoUserId } from "../users";
import { v } from "convex/values";
// Query to get applications for a specific user
export const getApplications = query({
    args: {
        demoMode: v.optional(v.boolean())
    },
    handler: async (ctx, args) => {
        // Try to get current user, if not available or demo mode is on, use mock user
        let userId;
        try {
            if (args.demoMode) {
                userId = await getDemoUserId(ctx);
            }
            else {
                userId = await getCurrentUserIdOrThrow(ctx);
            }
        }
        catch {
            // Use mock user ID if authentication fails
            userId = "mock-user-id";
        }
        // Get all applications for the user
        const applications = await ctx.db
            .query("applications")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();
        // Get university and program details for each application
        const applicationsWithDetails = await Promise.all(applications.map(async (application) => {
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
        }));
        return applicationsWithDetails;
    },
});
// Query to get documents grouped by university
export const getDocumentsByUniversity = query({
    args: {
        demoMode: v.optional(v.boolean())
    },
    handler: async (ctx, args) => {
        // Get user ID
        let userId;
        try {
            if (args.demoMode) {
                userId = await getDemoUserId(ctx);
            }
            else {
                userId = await getCurrentUserIdOrThrow(ctx);
            }
        }
        catch {
            userId = "mock-user-id";
        }
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
            if (!university || !program)
                continue;
            const documents = await ctx.db
                .query("applicationDocuments")
                .withIndex("by_application", (q) => q.eq("applicationId", application._id))
                .collect();
            const universityKey = university.name;
            if (!universitiesMap.has(universityKey)) {
                universitiesMap.set(universityKey, {
                    name: university.name,
                    programs: [{
                            name: `${program.degree} in ${program.name}`,
                            applicationId: application._id
                        }],
                    documents: new Map()
                });
            }
            else {
                // Add program if it doesn't exist
                const uniData = universitiesMap.get(universityKey);
                if (!uniData.programs.find((p) => p.name === `${program.degree} in ${program.name}`)) {
                    uniData.programs.push({
                        name: `${program.degree} in ${program.name}`,
                        applicationId: application._id
                    });
                }
            }
            // Group documents by type
            const docsByType = new Map();
            for (const doc of documents) {
                const docKey = `${doc.type}-${application._id}`;
                docsByType.set(docKey, {
                    type: doc.type,
                    status: doc.status === "complete" ? "Complete" :
                        doc.status === "in_review" ? "In Review" : "Draft",
                    progress: doc.progress,
                    count: 1,
                    applicationId: application._id,
                    program: `${program.degree} in ${program.name}`
                });
            }
            // Merge documents into university's document map
            const uniData = universitiesMap.get(universityKey);
            docsByType.forEach((doc, key) => {
                uniData.documents.set(key, doc);
            });
        }
        // Convert map to array and format documents
        const result = Array.from(universitiesMap.values()).map(uni => ({
            ...uni,
            documents: Array.from(uni.documents.values())
        }));
        console.log("Universities with documents:", result);
        return result;
    }
});
// Query to get application details, documents, and LORs for a specific university
export const getApplicationDetails = query({
    args: {
        applicationId: v.string(),
        demoMode: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        // Get user ID
        let userId;
        try {
            if (args.demoMode) {
                userId = await getDemoUserId(ctx);
            }
            else {
                userId = await getCurrentUserIdOrThrow(ctx);
            }
        }
        catch {
            userId = "mock-user-id";
        }
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
        // Get LORs
        const lors = await ctx.db
            .query("letterOfRecommendations")
            .withIndex("by_application", (q) => q.eq("applicationId", application._id))
            .collect();
        return {
            ...application,
            university: university?.name ?? "Unknown University",
            program: program?.name ?? "Unknown Program",
            degree: program?.degree ?? "Unknown Degree",
            documents: documents.map(doc => ({
                id: doc._id,
                type: doc.type,
                title: doc.title,
                status: doc.status,
                progress: doc.progress,
                lastEdited: doc.lastEdited,
                aiSuggestions: doc.aiSuggestionsCount,
            })),
            lors: lors.map(lor => ({
                id: lor._id,
                status: lor.status,
                requestedDate: lor.requestedDate,
                submittedDate: lor.submittedDate,
                remindersSent: lor.remindersSent,
            })),
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
        applicationId: v.id("applications"),
        documentType: v.string(),
        demoMode: v.optional(v.boolean())
    },
    handler: async (ctx, args) => {
        let userId;
        try {
            if (args.demoMode) {
                userId = await getDemoUserId(ctx);
            }
            else {
                userId = await getCurrentUserIdOrThrow(ctx);
            }
        }
        catch {
            userId = "mock-user-id";
        }
        console.log("Getting document for:", { userId, ...args });
        // Get the application to verify ownership
        const application = await ctx.db.get(args.applicationId);
        console.log("Found application:", application);
        if (!application || application.userId !== userId) {
            console.log("Application not found or unauthorized");
            return null;
        }
        // Get university and program info
        const university = await ctx.db.get(application.universityId);
        const program = await ctx.db.get(application.programId);
        console.log("Found university and program:", { university, program });
        if (!university || !program) {
            console.log("University or program not found");
            return null;
        }
        // Get the document
        const document = await ctx.db
            .query("applicationDocuments")
            .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
            .filter((q) => q.eq(q.field("type"), args.documentType))
            .first();
        console.log("Found document:", document);
        if (!document) {
            console.log("Document not found");
            return null;
        }
        const result = {
            type: document.type,
            university: university.name,
            program: `${program.degree} in ${program.name}`,
            lastEdited: document.lastEdited,
            status: document.status,
            content: document.content ?? "",
            aiSuggestionsCount: document.aiSuggestionsCount ?? 0,
        };
        console.log("Returning document data:", result);
        return result;
    }
});
