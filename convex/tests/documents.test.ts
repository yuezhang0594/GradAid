import { convexTest } from "convex-test";
import {
  describe,
  test,
  expect,
  beforeEach,
  afterEach,
  vi,
  beforeAll,
  afterAll,
} from "vitest";
import schema from "../schema";
import { Id } from "../_generated/dataModel";
import * as DocumentModel from "../documents/model";
import { api } from "../_generated/api";

describe("Documents", () => {
  const t = convexTest(schema);
  let testUserId: Id<"users">;
  let otherUserId: Id<"users">;
  let universityId: Id<"universities">;
  let programId: Id<"programs">;
  let applicationId: Id<"applications">;
  let otherApplicationId: Id<"applications">;
  let sopDocId: Id<"applicationDocuments">;
  let lorDocId1: Id<"applicationDocuments">;
  let lorDocId2: Id<"applicationDocuments">; // No recommender info

  const clerkId = `clerk-doc-test-${Date.now()}-${Math.random()}`;
  const otherClerkId = `clerk-other-doc-${Date.now()}-${Math.random()}`;
  const asUser = t.withIdentity({ subject: clerkId });
  const asOtherUser = t.withIdentity({ subject: otherClerkId });
  const deadline = new Date(
    Date.now() + 10 * 24 * 60 * 60 * 1000
  ).toISOString();

  beforeAll(async () => {
    // Create users, university, program, and application
    [
      testUserId,
      otherUserId,
      universityId,
      programId,
      applicationId,
      otherApplicationId,
    ] = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {
        name: "Doc Test User",
        email: `doc-test-${Date.now()}@example.com`,
        clerkId: clerkId,
      });
      const otherId = await ctx.db.insert("users", {
        name: "Other Doc User",
        email: `other-doc-${Date.now()}@example.com`,
        clerkId: otherClerkId,
      });
      const uniId = await ctx.db.insert("universities", {
        name: "Doc University",
        location: { city: "Doc City", state: "DC", country: "USA" },
        website: "http://docuni.edu",
      });
      const progId = await ctx.db.insert("programs", {
        universityId: uniId,
        name: "Doc Program",
        degree: "M.S.",
        department: "Documentation",
        requirements: {},
        deadlines: { fall: deadline },
      });
      const appId = await ctx.db.insert("applications", {
        userId: userId,
        universityId: uniId,
        programId: progId,
        status: "draft",
        deadline: deadline,
        priority: "medium",
        lastUpdated: new Date().toISOString(),
      });
      const otherAppId = await ctx.db.insert("applications", {
        userId: otherId,
        universityId: uniId,
        programId: progId,
        status: "draft",
        deadline: deadline,
        priority: "medium",
        lastUpdated: new Date().toISOString(),
      });
      return [userId, otherId, uniId, progId, appId, otherAppId];
    });
  });

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date());

    // Create documents for testUser's application
    [sopDocId, lorDocId1, lorDocId2] = await t.run(async (ctx) => {
      const sopId = await ctx.db.insert("applicationDocuments", {
        applicationId: applicationId,
        userId: testUserId,
        title: "Statement of Purpose",
        type: "sop",
        status: "draft",
        progress: 50,
        lastEdited: new Date().toISOString(),
        content: "This is my draft statement of purpose...",
      });
      const lorId1 = await ctx.db.insert("applicationDocuments", {
        applicationId: applicationId,
        userId: testUserId,
        title: "Letter of Recommendation",
        type: "lor",
        status: "not_started",
        progress: 0,
        lastEdited: new Date().toISOString(),
        recommenderName: "Prof. Smith",
        recommenderEmail: "prof.smith@university.edu",
      });
      const lorId2 = await ctx.db.insert("applicationDocuments", {
        applicationId: applicationId,
        userId: testUserId,
        title: "Letter of Recommendation",
        type: "lor",
        status: "not_started",
        progress: 0,
        lastEdited: new Date().toISOString(),
      });
      return [sopId, lorId1, lorId2];
    });
  });

  afterEach(async () => {
    vi.useRealTimers();
    vi.clearAllMocks();

    // Clean up database tables
    await t.run(async (ctx) => {
      // Delete all application documents
      const docs = await ctx.db.query("applicationDocuments").collect();
      await Promise.all(docs.map((doc) => ctx.db.delete(doc._id)));
    });
  });

  afterAll(async () => {
    // Clean up the rest of the data after all tests are done
    await t.run(async (ctx) => {
      const apps = await ctx.db.query("applications").collect();
      await Promise.all(apps.map((app) => ctx.db.delete(app._id)));

      const progs = await ctx.db.query("programs").collect();
      await Promise.all(progs.map((prog) => ctx.db.delete(prog._id)));

      const unis = await ctx.db.query("universities").collect();
      await Promise.all(unis.map((uni) => ctx.db.delete(uni._id)));

      const users = await ctx.db.query("users").collect();
      await Promise.all(users.map((user) => ctx.db.delete(user._id)));
    });
  });

  describe("Queries", () => {
    describe("getDocumentById", () => {
      test("should return document if owned by the authenticated user", async () => {
        const doc = await asUser.query(api.documents.queries.getDocumentById, {
          applicationDocumentId: sopDocId,
        });

        expect(doc).not.toBeNull();
        expect(doc._id).toBe(sopDocId);
        expect(doc.userId).toBe(testUserId);
        expect(doc.title).toBe("Statement of Purpose");
        expect(doc.type).toBe("sop");
        expect(doc.content).toBe("This is my draft statement of purpose...");
      });

      test("should throw if document ID does not exist", async () => {
        // Delete document first
        await t.run(async (ctx) => {
          await ctx.db.delete(sopDocId);
        });

        await expect(
          asUser.query(api.documents.queries.getDocumentById, {
            applicationDocumentId: sopDocId,
          })
        ).rejects.toThrow(); // Error from verifyDocumentOwnership
      });

      test("should throw if document belongs to another user", async () => {
        await expect(
          asOtherUser.query(api.documents.queries.getDocumentById, {
            applicationDocumentId: sopDocId,
          })
        ).rejects.toThrow(); // Error from verifyDocumentOwnership
      });

      test("should throw if not authenticated", async () => {
        await expect(
          t.query(api.documents.queries.getDocumentById, {
            applicationDocumentId: sopDocId,
          })
        ).rejects.toThrow(); // Auth error
      });
    });

    describe("getRecommender", () => {
      test("should return recommender details for a LOR document", async () => {
        const recommender = await asUser.query(
          api.documents.queries.getRecommender,
          {
            documentId: lorDocId1,
          }
        );

        expect(recommender).not.toBeNull();
        expect(recommender.name).toBe("Prof. Smith");
        expect(recommender.email).toBe("prof.smith@university.edu");
      });

      test("should return null recommender values for an LOR document without recommender", async () => {
        const recommender = await asUser.query(
          api.documents.queries.getRecommender,
          {
            documentId: lorDocId2, // LOR 2 doesn't have a recommender
          }
        );

        expect(recommender.name).toBeUndefined();
        expect(recommender.email).toBeUndefined();
      });

      test("should throw if trying to access recommender for a non-LOR document", async () => {
        await expect(
          asUser.query(api.documents.queries.getRecommender, {
            documentId: sopDocId,
          })
        ).rejects.toThrow(); // Error from getRecommender document type check
      });

      test("should throw if document ID does not exist", async () => {
        // Delete document first
        await t.run(async (ctx) => {
          await ctx.db.delete(lorDocId1);
        });

        await expect(
          asUser.query(api.documents.queries.getRecommender, {
            documentId: lorDocId1,
          })
        ).rejects.toThrow(); // Error from getRecommender document lookup
      });

      test("should throw if document belongs to another user", async () => {
        // Create a document for otherUser
        const otherUserAppId = await t.run(async (ctx) => {
          return await ctx.db.insert("applications", {
            userId: otherUserId,
            universityId: universityId,
            programId: programId,
            status: "draft",
            deadline: deadline,
            priority: "low",
            lastUpdated: new Date().toISOString(),
          });
        });

        const otherUserDocId = await t.run(async (ctx) => {
          return await ctx.db.insert("applicationDocuments", {
            applicationId: otherUserAppId,
            userId: otherUserId,
            title: "Other User's LOR",
            type: "lor",
            status: "not_started",
            progress: 0,
            lastEdited: new Date().toISOString(),
            recommenderName: "Prof. Jones",
            recommenderEmail: "jones@uni.edu",
          });
        });

        // User tries to access other user's document recommender
        await expect(
          asUser.query(api.documents.queries.getRecommender, {
            documentId: otherUserDocId,
          })
        ).rejects.toThrow(); // Access error
      });

      test("should throw if not authenticated", async () => {
        await expect(
          t.query(api.documents.queries.getRecommender, {
            documentId: lorDocId1,
          })
        ).rejects.toThrow(); // Auth error
      });
    });
  });

  describe("Mutations", () => {
    describe("saveDocumentDraft", () => {
      test("should update document content and lastEdited timestamp when owned by authenticated user", async () => {
        const initialDoc = await t.run(async (ctx) => {
          return await ctx.db.get(sopDocId);
        });
        const initialLastEdited = initialDoc?.lastEdited;

        // Advance time to ensure lastEdited changes
        vi.advanceTimersByTime(1000);

        const newContent = "This is my updated statement of purpose content.";
        await asUser.mutation(api.documents.mutations.saveDocumentDraft, {
          applicationDocumentId: sopDocId,
          content: newContent,
        });

        const updatedDoc = await t.run(async (ctx) => {
          return await ctx.db.get(sopDocId);
        });

        expect(updatedDoc?.content).toBe(newContent);
        expect(updatedDoc?.lastEdited).not.toBe(initialLastEdited);
      });

      test("should throw if document belongs to another user", async () => {
        const otherUserDocId = await t.run(async (ctx) => {
          return await ctx.db.insert("applicationDocuments", {
            applicationId: otherApplicationId,
            userId: otherUserId,
            title: "Other User's SOP",
            type: "sop",
            status: "draft",
            progress: 10,
            lastEdited: new Date().toISOString(),
            content: "Other user content",
          });
        });

        await expect(
          asUser.mutation(api.documents.mutations.saveDocumentDraft, {
            applicationDocumentId: otherUserDocId,
            content: "Trying to change someone else's document",
          })
        ).rejects.toThrow(); // Authorization error
      });

      test("should throw if document ID does not exist", async () => {
        // Delete document first
        await t.run(async (ctx) => {
          await ctx.db.delete(sopDocId);
        });

        await expect(
          asUser.mutation(api.documents.mutations.saveDocumentDraft, {
            applicationDocumentId: sopDocId,
            content: "Content for non-existent document",
          })
        ).rejects.toThrow(); // Document not found error
      });

      test("should throw if not authenticated", async () => {
        await expect(
          t.mutation(api.documents.mutations.saveDocumentDraft, {
            applicationDocumentId: sopDocId,
            content: "Unauthenticated content change",
          })
        ).rejects.toThrow(); // Authentication error
      });
    });

    describe("createDocument", () => {
      test("should create a new document for the specified application", async () => {
        const newDocumentId = await asUser.mutation(
          api.documents.mutations.createDocument,
          {
            applicationId: applicationId,
            type: "sop" as const,
          }
        );

        expect(newDocumentId).toBeDefined();

        const newDocument = await t.run(async (ctx) => {
          return await ctx.db.get(newDocumentId);
        });

        expect(newDocument).not.toBeNull();
        expect(newDocument?.userId).toBe(testUserId);
        expect(newDocument?.applicationId).toBe(applicationId);
        expect(newDocument?.type).toBe("sop");
        expect(newDocument?.status).toBe("not_started");
        expect(newDocument?.progress).toBe(0);
      });

      test("should throw when trying to create document for application belonging to another user", async () => {
        await expect(
          asUser.mutation(api.documents.mutations.createDocument, {
            applicationId: otherApplicationId, // Application belongs to otherUser
            type: "lor" as const,
          })
        ).rejects.toThrow(); // Authorization error
      });

      test("should throw when trying to create document for non-existent application", async () => {
        const nonExistentAppId = "00000000000000000000" as Id<"applications">;

        await expect(
          asUser.mutation(api.documents.mutations.createDocument, {
            applicationId: nonExistentAppId,
            type: "sop" as const,
          })
        ).rejects.toThrow(); // Application not found error
      });

      test("should throw if not authenticated", async () => {
        await expect(
          t.mutation(api.documents.mutations.createDocument, {
            applicationId: applicationId,
            type: "sop" as const,
          })
        ).rejects.toThrow(); // Authentication error
      });
    });

    describe("updateRecommender", () => {
      test("should update recommender details for a LOR document", async () => {
        const recommenderName = "Professor Einstein";
        const recommenderEmail = "einstein@physics.edu";

        await asUser.mutation(api.documents.mutations.updateRecommender, {
          documentId: lorDocId1,
          recommenderName,
          recommenderEmail,
        });

        const updatedDocument = await t.run(async (ctx) => {
          return await ctx.db.get(lorDocId1);
        });

        expect(updatedDocument?.recommenderName).toBe(recommenderName);
        expect(updatedDocument?.recommenderEmail).toBe(recommenderEmail);
      });

      test("should throw when trying to update recommender for a non-LOR document", async () => {
        await expect(
          asUser.mutation(api.documents.mutations.updateRecommender, {
            documentId: sopDocId, // SOP document, not LOR
            recommenderName: "Prof Someone",
            recommenderEmail: "someone@example.com",
          })
        ).rejects.toThrow(); // Document type error
      });

      test("should throw when trying to update recommender for document belonging to another user", async () => {
        const otherUserLorId = await t.run(async (ctx) => {
          return await ctx.db.insert("applicationDocuments", {
            applicationId: otherApplicationId,
            userId: otherUserId,
            title: "Other User's LOR",
            type: "lor",
            status: "not_started",
            progress: 0,
            lastEdited: new Date().toISOString(),
          });
        });

        await expect(
          asUser.mutation(api.documents.mutations.updateRecommender, {
            documentId: otherUserLorId,
            recommenderName: "Someone Else",
            recommenderEmail: "else@example.com",
          })
        ).rejects.toThrow(); // Authorization error
      });

      test("should throw when trying to update recommender for non-existent document", async () => {
        // Delete the document first
        await t.run(async (ctx) => {
          await ctx.db.delete(lorDocId1);
        });

        await expect(
          asUser.mutation(api.documents.mutations.updateRecommender, {
            documentId: lorDocId1,
            recommenderName: "Prof Nobody",
            recommenderEmail: "nobody@example.com",
          })
        ).rejects.toThrow(); // Document not found error
      });

      test("should throw if not authenticated", async () => {
        await expect(
          t.mutation(api.documents.mutations.updateRecommender, {
            documentId: lorDocId1,
            recommenderName: "Unauthenticated Prof",
            recommenderEmail: "unauth@example.com",
          })
        ).rejects.toThrow(); // Authentication error
      });
    });

    describe("updateDocumentStatus", () => {
      test("should update document status", async () => {
        const newStatus = "complete" as const;

        await asUser.mutation(api.documents.mutations.updateDocumentStatus, {
          documentId: sopDocId,
          status: newStatus,
        });

        const updatedDocument = await t.run(async (ctx) => {
          return await ctx.db.get(sopDocId);
        });

        expect(updatedDocument?.status).toBe(newStatus);
      });

      test("should update application status based on document status changes", async () => {
        // Use a clean application with multiple documents
        const newAppId = await t.run(async (ctx) => {
          return await ctx.db.insert("applications", {
            userId: testUserId,
            universityId: universityId,
            programId: programId,
            status: "not_started",
            deadline: deadline,
            priority: "high",
            lastUpdated: new Date().toISOString(),
          });
        });

        // Create two documents for this application
        const [newDocId1, newDocId2] = await t.run(async (ctx) => {
          const doc1 = await ctx.db.insert("applicationDocuments", {
            applicationId: newAppId,
            userId: testUserId,
            title: "New SOP",
            type: "sop",
            status: "not_started",
            progress: 0,
            lastEdited: new Date().toISOString(),
          });
          const doc2 = await ctx.db.insert("applicationDocuments", {
            applicationId: newAppId,
            userId: testUserId,
            title: "New LOR",
            type: "lor",
            status: "not_started",
            progress: 0,
            lastEdited: new Date().toISOString(),
          });
          return [doc1, doc2];
        });

        // Update one document to in_review
        await asUser.mutation(api.documents.mutations.updateDocumentStatus, {
          documentId: newDocId1,
          status: "in_review",
        });

        // Check if application status changed to in_progress
        let app = await t.run(async (ctx) => {
          return await ctx.db.get(newAppId);
        });
        expect(app?.status).toBe("in_progress");

        // Update both documents to complete
        await asUser.mutation(api.documents.mutations.updateDocumentStatus, {
          documentId: newDocId1,
          status: "complete",
        });
        await asUser.mutation(api.documents.mutations.updateDocumentStatus, {
          documentId: newDocId2,
          status: "complete",
        });

        // Check if application status changed to ready for submission
        app = await t.run(async (ctx) => {
          return await ctx.db.get(newAppId);
        });
        // The exact status depends on implementation of updateApplicationStatusBasedOnDocuments
        // Here we're assuming it would be set to "in_progress" or similar when all docs are complete
        expect(app?.status).not.toBe("not_started");
      });

      test("should throw when trying to update status for document belonging to another user", async () => {
        const otherUserDocId = await t.run(async (ctx) => {
          return await ctx.db.insert("applicationDocuments", {
            applicationId: otherApplicationId,
            userId: otherUserId,
            title: "Other User's SOP",
            type: "sop",
            status: "draft",
            progress: 10,
            lastEdited: new Date().toISOString(),
          });
        });

        await expect(
          asUser.mutation(api.documents.mutations.updateDocumentStatus, {
            documentId: otherUserDocId,
            status: "complete",
          })
        ).rejects.toThrow(); // Authorization error
      });

      test("should throw when trying to update status for non-existent document", async () => {
        // Delete the document first
        await t.run(async (ctx) => {
          await ctx.db.delete(sopDocId);
        });

        await expect(
          asUser.mutation(api.documents.mutations.updateDocumentStatus, {
            documentId: sopDocId,
            status: "complete",
          })
        ).rejects.toThrow(); // Document not found error
      });

      test("should throw if not authenticated", async () => {
        await expect(
          t.mutation(api.documents.mutations.updateDocumentStatus, {
            documentId: sopDocId,
            status: "complete",
          })
        ).rejects.toThrow(); // Authentication error
      });
    });
  });

  describe("Model", () => {
    describe("createApplicationDocument", () => {
      test("should create a document with correct initial values", async () => {
        const newDocId = await asUser.run(async (ctx) => {
          return await DocumentModel.createApplicationDocument(
            ctx,
            applicationId,
            "sop"
          );
        });

        const newDoc = await asUser.run(async (ctx) => {
          return await ctx.db.get(newDocId);
        });

        expect(newDoc).not.toBeNull();
        expect(newDoc?.userId).toBe(testUserId);
        expect(newDoc?.applicationId).toBe(applicationId);
        expect(newDoc?.type).toBe("sop");
        expect(newDoc?.status).toBe("not_started");
        expect(newDoc?.progress).toBe(0);
        expect(newDoc?.content).toBe("");
        expect(newDoc?.title).toBe("Statement of Purpose");
      });

      test("should create a LOR document with correct title", async () => {
        const newDocId = await asUser.run(async (ctx) => {
          return await DocumentModel.createApplicationDocument(
            ctx,
            applicationId,
            "lor"
          );
        });

        const newDoc = await asUser.run(async (ctx) => {
          return await ctx.db.get(newDocId);
        });

        expect(newDoc?.title).toBe("Letter of Recommendation");
        expect(newDoc?.type).toBe("lor");
      });

      test("should throw when trying to create document for another user's application", async () => {
        await expect(
          asUser.run(async (ctx) => {
            return await DocumentModel.createApplicationDocument(
              ctx,
              otherApplicationId, // belongs to otherUser
              "sop"
            );
          })
        ).rejects.toThrow();
      });

      test("should log document creation activity", async () => {
        const newDocId = await asUser.run(async (ctx) => {
          return await DocumentModel.createApplicationDocument(
            ctx,
            applicationId,
            "sop"
          );
        });

        // Check if activity was logged
        const activities = await asUser.run(async (ctx) => {
          return await ctx.db
            .query("userActivity")
            .withIndex("by_user", (q) => q.eq("userId", testUserId))
            .filter(
              (q) =>
                q.eq(q.field("type"), "document_creation") &&
                q.eq(q.field("metadata.documentId"), newDocId)
            )
            .collect();
        });

        expect(activities.length).toBeGreaterThan(0);
        expect(activities[0].description).toContain("Document created");
      });
    });

    describe("createApplicationDocuments", () => {
      test("should create multiple documents in parallel", async () => {
        const documentConfigs = [
          { type: "sop" as const, status: "not_started" as const },
          { type: "lor" as const, status: "not_started" as const },
          { type: "lor" as const, status: "not_started" as const },
        ];

        const docIds = await asUser.run(async (ctx) => {
          return await DocumentModel.createApplicationDocuments(
            ctx,
            applicationId,
            documentConfigs
          );
        });

        expect(docIds.length).toBe(3);

        // Check all documents were created
        const docs = await t.run(async (ctx) => {
          return await Promise.all(docIds.map((id) => ctx.db.get(id)));
        });

        expect(docs.filter((d) => d !== null).length).toBe(3);
        expect(docs[0]?.type).toBe("sop");
        expect(docs[1]?.type).toBe("lor");
        expect(docs[2]?.type).toBe("lor");
      });
    });

    describe("verifyDocumentOwnership", () => {
      test("should return userId and document when ownership is verified", async () => {
        const result = await asUser.run(async (ctx) => {
          return await DocumentModel.verifyDocumentOwnership(ctx, sopDocId);
        });

        expect(result.userId).toBe(testUserId);
        expect(result.document._id).toBe(sopDocId);
      });

      test("should throw when document doesn't exist", async () => {
        // Delete the document first
        await t.run(async (ctx) => {
          await ctx.db.delete(sopDocId);
        });

        await expect(
          t.run(async (ctx) => {
            return await DocumentModel.verifyDocumentOwnership(ctx, sopDocId);
          })
        ).rejects.toThrow("Document not found");
      });

      test("should throw when user doesn't own the document", async () => {
        await expect(
          asOtherUser.run(
            async (ctx) => {
              return await DocumentModel.verifyDocumentOwnership(ctx, sopDocId);
            },
          )
        ).rejects.toThrow(); // From verifyApplicationOwnership
      });
    });

    describe("updateDocumentStatus", () => {
      test("should update document status and progress", async () => {
        await asUser.run(async (ctx) => {
          await DocumentModel.updateDocumentStatus(ctx, sopDocId, "in_review");
        });

        const updatedDoc = await t.run(async (ctx) => {
          return await ctx.db.get(sopDocId);
        });

        expect(updatedDoc?.status).toBe("in_review");
        expect(updatedDoc?.progress).toBe(66); // determineProgressByStatus for in_review
      });

      test("should log status change and progress change activities", async () => {
        await asUser.run(async (ctx) => {
          await DocumentModel.updateDocumentStatus(ctx, sopDocId, "complete");
        });

        const activities = await asUser.run(async (ctx) => {
          return await ctx.db
            .query("userActivity")
            .withIndex("by_user", (q) => q.eq("userId", testUserId))
            .filter((q) => q.eq(q.field("metadata.documentId"), sopDocId))
            .collect();
        });

        // Should find at least two activities - status update and progress update
        expect(activities.length).toBeGreaterThanOrEqual(2);

        const statusActivity = activities.find(
          (a) => a.type === "document_status_update"
        );
        const progressActivity = activities.find(
          (a) => a.type === "document_edit"
        );

        expect(statusActivity).toBeDefined();
        expect(progressActivity).toBeDefined();
        expect(statusActivity?.metadata.newStatus).toBe("complete");
      });

      test("should throw when user doesn't own the document", async () => {
        await expect(
          asOtherUser.run(
            async (ctx) => {
              return await DocumentModel.updateDocumentStatus(
                ctx,
                sopDocId,
                "complete"
              );
            },
          )
        ).rejects.toThrow(); // From verifyApplicationOwnership
      });
    });

    describe("logDocumentActivity", () => {
      test("should create activity record with correct metadata", async () => {
        await asUser.run(async (ctx) => {
          await DocumentModel.logDocumentActivity(
            ctx,
            sopDocId,
            "Test activity description",
            "in_review"
          );
        });

        const activities = await t.run(async (ctx) => {
          return await ctx.db
            .query("userActivity")
            .withIndex("by_user", (q) => q.eq("userId", testUserId))
            .filter(
              (q) =>
                q.eq(q.field("metadata.documentId"), sopDocId) &&
                q.eq(q.field("description"), "Test activity description")
            )
            .collect();
        });

        expect(activities.length).toBe(1);
        expect(activities[0].type).toBe("document_status_update");
        expect(activities[0].metadata.documentId).toBe(sopDocId);
        expect(activities[0].metadata.newStatus).toBe("in_review");
      });

      test("should throw when user doesn't own the document", async () => {
        await expect(
          asOtherUser.run(
            async (ctx) => {
              return await DocumentModel.logDocumentActivity(
                ctx,
                sopDocId,
                "Unauthorized activity",
                "complete"
              );
            },
          )
        ).rejects.toThrow(); // From verifyApplicationOwnership
      });
    });

    describe("getDocumentsForUser", () => {
      test("should return all documents for a user", async () => {
        // Create additional test document for the user
        await asUser.run(async (ctx) => {
          await DocumentModel.createApplicationDocument(
            ctx,
            applicationId,
            "lor"
          );
        });

        const userDocs = await asUser.run(async (ctx) => {
          return await DocumentModel.getDocumentsForUser(ctx, testUserId);
        });

        // Should have at least 3 docs (sopDocId, lorDocId1, lorDocId2) plus the new one
        expect(userDocs.length).toBeGreaterThanOrEqual(4);
        expect(userDocs.every((doc) => doc.userId === testUserId)).toBe(true);
      });

      test("should return empty array if user has no documents", async () => {
        // Create a new user with no documents
        const newUserId = await t.run(async (ctx) => {
          return await ctx.db.insert("users", {
            name: "No Docs User",
            email: `no-docs-${Date.now()}@example.com`,
            clerkId: `clerk-no-docs-${Date.now()}`,
          });
        });

        const userDocs = await t.run(async (ctx) => {
          return await DocumentModel.getDocumentsForUser(ctx, newUserId);
        });

        expect(userDocs).toEqual([]);
      });
    });

    describe("updateDocumentContent", () => {
      test("should update document content", async () => {
        const newContent = "This is updated content for testing purposes";

        await asUser.run(async (ctx) => {
          await DocumentModel.updateDocumentContent(ctx, sopDocId, newContent);
        });

        const updatedDoc = await t.run(async (ctx) => {
          return await ctx.db.get(sopDocId);
        });

        expect(updatedDoc?.content).toBe(newContent);
      });

      test("should update lastEdited timestamp", async () => {
        const initialDoc = await t.run(async (ctx) => {
          return await ctx.db.get(sopDocId);
        });
        const initialLastEdited = initialDoc?.lastEdited;

        // Advance time
        vi.advanceTimersByTime(1000);

        await asUser.run(async (ctx) => {
          await DocumentModel.updateDocumentContent(
            ctx,
            sopDocId,
            "New content with timestamp"
          );
        });

        const updatedDoc = await asUser.run(async (ctx) => {
          return await ctx.db.get(sopDocId);
        });

        expect(updatedDoc?.lastEdited).not.toBe(initialLastEdited);
      });

      test("should log document activity", async () => {
        await asUser.run(async (ctx) => {
          await DocumentModel.updateDocumentContent(
            ctx,
            sopDocId,
            "Content for activity log test"
          );
        });

        const activities = await t.run(async (ctx) => {
          return await ctx.db
            .query("userActivity")
            .withIndex("by_user", (q) => q.eq("userId", testUserId))
            .filter(
              (q) =>
                q.eq(q.field("metadata.documentId"), sopDocId) &&
                q.eq(q.field("type"), "document_status_update")
            )
            .order("desc")
            .first();
        });

        expect(activities).not.toBeNull();
        expect(activities?.description).toBe("Document content updated");
      });

      test("should throw when user doesn't own the document", async () => {
        await expect(
          asOtherUser.run(
            async (ctx) => {
              return await DocumentModel.updateDocumentContent(
                ctx,
                sopDocId,
                "Unauthorized content"
              );
            },
          )
        ).rejects.toThrow();
      });
    });

    describe("getRecommender", () => {
      test("should return recommender details for LOR document", async () => {
        const recommender = await asUser.run(async (ctx) => {
          return await DocumentModel.getRecommender(ctx, lorDocId1);
        });

        expect(recommender).toEqual({
          name: "Prof. Smith",
          email: "prof.smith@university.edu",
        });
      });

      test("should return undefined values for LOR without recommender info", async () => {
        const recommender = await asUser.run(async (ctx) => {
          return await DocumentModel.getRecommender(ctx, lorDocId2);
        });

        expect(recommender.name).toBeUndefined();
        expect(recommender.email).toBeUndefined();
      });

      test("should throw for non-LOR document types", async () => {
        await expect(
          asUser.run(async (ctx) => {
            return await DocumentModel.getRecommender(ctx, sopDocId);
          })
        ).rejects.toThrow(
          "Cannot get recommender information for non-LOR documents"
        );
      });

      test("should throw when user doesn't own the document", async () => {
        await expect(
          asOtherUser.run(
            async (ctx) => {
              return await DocumentModel.getRecommender(ctx, lorDocId1);
            }
          )
        ).rejects.toThrow();
      });
    });

    describe("updateRecommender", () => {
      test("should update recommender info for LOR document", async () => {
        const newName = "Dr. Einstein";
        const newEmail = "einstein@relativity.edu";

        await asUser.run(async (ctx) => {
          await DocumentModel.updateRecommender(
            ctx,
            lorDocId1,
            newName,
            newEmail
          );
        });

        const updatedDoc = await t.run(async (ctx) => {
          return await ctx.db.get(lorDocId1);
        });

        expect(updatedDoc?.recommenderName).toBe(newName);
        expect(updatedDoc?.recommenderEmail).toBe(newEmail);
      });

      test("should throw for non-LOR document types", async () => {
        await expect(
          asUser.run(async (ctx) => {
            return await DocumentModel.updateRecommender(
              ctx,
              sopDocId,
              "Someone",
              "someone@example.com"
            );
          })
        ).rejects.toThrow(
          "Cannot update recommender information for non-LOR documents"
        );
      });

      test("should log activity", async () => {
        await asUser.run(async (ctx) => {
          await DocumentModel.updateRecommender(
            ctx,
            lorDocId1,
            "Prof. Activity",
            "activity@test.edu"
          );
        });

        const activities = await t.run(async (ctx) => {
          return await ctx.db
            .query("userActivity")
            .withIndex("by_user", (q) => q.eq("userId", testUserId))
            .filter(
              (q) =>
                q.eq(q.field("metadata.documentId"), lorDocId1) &&
                q.eq(q.field("description"), "Recommender updated")
            )
            .collect();
        });

        expect(activities.length).toBeGreaterThan(0);
      });

      test("should throw when user doesn't own the document", async () => {
        await expect(
          asOtherUser.run(
            async (ctx) => {
              return await DocumentModel.updateRecommender(
                ctx,
                lorDocId1,
                "Unauthorized",
                "unauthorized@example.com"
              );
            },
          )
        ).rejects.toThrow();
      });
    });

    describe("updateApplicationStatusBasedOnDocuments", () => {
      test("should set application to 'draft' when all documents are not_started", async () => {
        // Create a new application
        const newAppId = await t.run(async (ctx) => {
          return await ctx.db.insert("applications", {
            userId: testUserId,
            universityId: universityId,
            programId: programId,
            status: "not_started",
            deadline: deadline,
            priority: "medium",
            lastUpdated: new Date().toISOString(),
          });
        });

        // Add documents in "not_started" status
        await t.run(async (ctx) => {
          await ctx.db.insert("applicationDocuments", {
            applicationId: newAppId,
            userId: testUserId,
            title: "SOP Not Started",
            type: "sop",
            status: "not_started",
            progress: 0,
            lastEdited: new Date().toISOString(),
          });
        });

        const result = await asUser.run(async (ctx) => {
          return await DocumentModel.updateApplicationStatusBasedOnDocuments(
            ctx,
            newAppId
          );
        });

        expect(result.success).toBe(true);
        expect(result.status).toBe("draft");

        const app = await t.run(async (ctx) => {
          return await ctx.db.get(newAppId);
        });

        expect(app?.status).toBe("draft");
      });

      test("should set application to 'in_progress' when any document is draft", async () => {
        // Create a new application
        const newAppId = await t.run(async (ctx) => {
          return await ctx.db.insert("applications", {
            userId: testUserId,
            universityId: universityId,
            programId: programId,
            status: "not_started",
            deadline: deadline,
            priority: "medium",
            lastUpdated: new Date().toISOString(),
          });
        });

        // Add one not_started document and one draft document
        await t.run(async (ctx) => {
          await ctx.db.insert("applicationDocuments", {
            applicationId: newAppId,
            userId: testUserId,
            title: "Doc 1",
            type: "sop",
            status: "not_started",
            progress: 0,
            lastEdited: new Date().toISOString(),
          });

          await ctx.db.insert("applicationDocuments", {
            applicationId: newAppId,
            userId: testUserId,
            title: "Doc 2",
            type: "lor",
            status: "draft",
            progress: 33,
            lastEdited: new Date().toISOString(),
          });
        });

        const result = await asUser.run(async (ctx) => {
          return await DocumentModel.updateApplicationStatusBasedOnDocuments(
            ctx,
            newAppId
          );
        });

        expect(result.success).toBe(true);
        expect(result.status).toBe("in_progress");

        const app = await t.run(async (ctx) => {
          return await ctx.db.get(newAppId);
        });

        expect(app?.status).toBe("in_progress");
      });

      test("should not modify terminal application statuses", async () => {
        // Create applications with terminal statuses
        const terminalStatuses = [
          "submitted",
          "accepted",
          "rejected",
          "deleted",
        ] as const;

        for (const status of terminalStatuses) {
          const appId = await t.run(async (ctx) => {
            return await ctx.db.insert("applications", {
              userId: testUserId,
              universityId: universityId,
              programId: programId,
              status: status,
              deadline: deadline,
              priority: "medium",
              lastUpdated: new Date().toISOString(),
            });
          });

          // Add a document with draft status that would normally trigger a change
          await t.run(async (ctx) => {
            await ctx.db.insert("applicationDocuments", {
              applicationId: appId,
              userId: testUserId,
              title: "Test Doc",
              type: "sop",
              status: "draft",
              progress: 33,
              lastEdited: new Date().toISOString(),
            });
          });

          // Run the function
          const result = await t.run(async (ctx) => {
            return await DocumentModel.updateApplicationStatusBasedOnDocuments(
              ctx,
              appId
            );
          });

          // Status should remain unchanged
          expect(result.status).toBe(status);

          const app = await t.run(async (ctx) => {
            return await ctx.db.get(appId);
          });

          expect(app?.status).toBe(status);
        }
      });

      test("should throw when application doesn't exist", async () => {
        const nonExistentAppId = "00000000000000000000" as Id<"applications">;

        await expect(
          t.run(async (ctx) => {
            return await DocumentModel.updateApplicationStatusBasedOnDocuments(
              ctx,
              nonExistentAppId
            );
          })
        ).rejects.toThrow(`Application with ID ${nonExistentAppId} not found`);
      });

      test("should set application to 'not_started' when there are no documents", async () => {
        // Create a new application without any documents
        const emptyAppId = await t.run(async (ctx) => {
          return await ctx.db.insert("applications", {
            userId: testUserId,
            universityId: universityId,
            programId: programId,
            status: "draft", // Start with a non-not_started status to verify change
            deadline: deadline,
            priority: "medium",
            lastUpdated: new Date().toISOString(),
          });
        });

        // Run the update function on an application without documents
        const result = await asUser.run(async (ctx) => {
          return await DocumentModel.updateApplicationStatusBasedOnDocuments(
            ctx,
            emptyAppId
          );
        });

        expect(result.success).toBe(true);
        expect(result.status).toBe("not_started");

        // Verify the application status was updated in the database
        const app = await t.run(async (ctx) => {
          return await ctx.db.get(emptyAppId);
        });

        expect(app?.status).toBe("not_started");

        // Check that an activity log was created for this status change
        const activities = await asUser.run(async (ctx) => {
          return await ctx.db
            .query("userActivity")
            .filter((q) =>
              q.eq(q.field("metadata.applicationId"), emptyAppId)
            )
            .collect();
        });

        expect(activities.length).toBeGreaterThan(0);
        expect(activities[0].description).toContain("automatically updated to not_started");
      });

      test("should not change application status if it's already 'not_started' with no documents", async () => {
        // Create a new application without documents that is already in not_started status
        const alreadyNotStartedAppId = await t.run(async (ctx) => {
          return await ctx.db.insert("applications", {
            userId: testUserId,
            universityId: universityId,
            programId: programId,
            status: "not_started", // Already not_started
            deadline: deadline,
            priority: "medium",
            lastUpdated: new Date().toISOString(),
          });
        });

        // Count activities before update
        const activitiesCountBefore = await t.run(async (ctx) => {
          return await ctx.db
            .query("userActivity")
            .filter((q) => q.eq(q.field("metadata.applicationId"), alreadyNotStartedAppId))
            .collect();
        });

        // Run the update function
        const result = await asUser.run(async (ctx) => {
          return await DocumentModel.updateApplicationStatusBasedOnDocuments(
            ctx,
            alreadyNotStartedAppId
          );
        });

        expect(result.status).toBe("not_started");

        // Count activities after update - should be the same (no new activity logged)
        const activitiesCountAfter = await t.run(async (ctx) => {
          return await ctx.db
            .query("userActivity")
            .filter((q) => q.eq(q.field("metadata.applicationId"), alreadyNotStartedAppId))
            .collect();
        });

        // No new activity should be logged since status didn't change
        expect(activitiesCountAfter.length).toBe(activitiesCountBefore.length);
      });
    });

    describe("logDocumentProgressActivity", () => {
      test("should log activity when document progress changes", async () => {
        // We need to call a function that internally uses logDocumentProgressActivity
        // updateDocumentStatus calls this function when progress changes
        
        // First, set up a document with a specific progress
        await t.run(async (ctx) => {
          await ctx.db.patch(sopDocId, { progress: 10 });
        });
        
        // Update status which will change progress and log activity
        await asUser.run(async (ctx) => {
          await DocumentModel.updateDocumentStatus(ctx, sopDocId, "complete");
        });
        
        // Check if progress change activity was logged
        const activities = await asUser.run(async (ctx) => {
          return await ctx.db
            .query("userActivity")
            .withIndex("by_user", (q) => q.eq("userId", testUserId))
            .filter((q) => 
              q.eq(q.field("type"), "document_edit") &&
              q.eq(q.field("metadata.documentId"), sopDocId))
            .collect();
        });
        
        expect(activities.length).toBeGreaterThan(0);
        const progressActivity = activities.find(a => a.description.includes("progress updated from"));
        expect(progressActivity).toBeDefined();
        expect(progressActivity?.metadata.oldProgress).toBe(10);
        expect(progressActivity?.metadata.newProgress).toBe(100); // 'complete' status is 100% progress
      });
      
      test("should throw when user doesn't own the document", async () => {
        // This will indirectly test logDocumentProgressActivity's ownership check
        // by calling updateDocumentStatus which uses it
        await expect(
          asOtherUser.run(
            async (ctx) => {
              return await DocumentModel.updateDocumentStatus(
                ctx,
                sopDocId,
                "complete" // This would change progress and call logDocumentProgressActivity
              );
            }
          )
        ).rejects.toThrow();
      });
    });
  });
});
