import { convexTest } from "convex-test";
import {
  describe,
  test,
  expect,
  beforeEach,
  afterEach,
  vi,
  beforeAll,
} from "vitest";
import schema from "../schema";
import { Id } from "../_generated/dataModel";
import * as ApplicationModel from "../applications/model";
import * as Validators from "../validators";
import { api } from "../_generated/api";

describe("Applications", () => {
  const t = convexTest(schema);
  let testUserId: Id<"users">;
  let otherUserId: Id<"users">;
  let universityId: Id<"universities">;
  let otherUniversityId: Id<"universities">;
  let programId1: Id<"programs">;
  let programId2: Id<"programs">;
  let otherProgramId: Id<"programs">; // Program at other university
  let applicationId1: Id<"applications">;
  let applicationId2: Id<"applications">;
  let docId1: Id<"applicationDocuments">;
  let docId2: Id<"applicationDocuments">;
  let completedDocId: Id<"applicationDocuments">;

  const clerkId = `clerk-model-test-${Date.now()}-${Math.random()}`;
  const otherClerkId = `clerk-other-model-${Date.now()}-${Math.random()}`;
  const asUser = t.withIdentity({ subject: clerkId });
  const asOtherUser = t.withIdentity({ subject: otherClerkId });
  const deadline1 = new Date(
    Date.now() + 10 * 24 * 60 * 60 * 1000
  ).toISOString(); // 10 days from now
  const deadline2 = new Date(
    Date.now() + 5 * 24 * 60 * 60 * 1000
  ).toISOString(); // 5 days from now

  beforeAll(async () => {
    // Create users, universities, programs
    [
      testUserId,
      otherUserId,
      universityId,
      otherUniversityId,
      programId1,
      programId2,
      otherProgramId,
    ] = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {
        name: "Model Test User",
        email: `model-test-${Date.now()}@example.com`,
        clerkId: clerkId,
      });
      const otherId = await ctx.db.insert("users", {
        name: "Other Model User",
        email: `other-model-${Date.now()}@example.com`,
        clerkId: otherClerkId,
      });
      const uniId = await ctx.db.insert("universities", {
        name: "Test University",
        location: { city: "Test City", state: "TS", country: "USA" },
        website: "http://testuni.edu",
      });
      const otherUniId = await ctx.db.insert("universities", {
        name: "Other University",
        location: { city: "Other City", state: "OT", country: "USA" },
        website: "http://otheruni.edu",
      });
      const progId1 = await ctx.db.insert("programs", {
        universityId: uniId,
        name: "Test Program 1",
        degree: "M.S.",
        department: "Testing",
        requirements: {},
        deadlines: { fall: deadline1 },
      });
      const progId2 = await ctx.db.insert("programs", {
        universityId: uniId,
        name: "Test Program 2",
        degree: "Ph.D.",
        department: "Testing",
        requirements: {},
        deadlines: { fall: deadline2 },
      });
      const otherProgId = await ctx.db.insert("programs", {
        universityId: otherUniId, // Belongs to other university
        name: "Other Program",
        degree: "M.Eng.",
        department: "Other Dept",
        requirements: {},
        deadlines: {},
      });
      return [
        userId,
        otherId,
        uniId,
        otherUniId,
        progId1,
        progId2,
        otherProgId,
      ];
    });
  });

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date());

    // Create applications and documents for testUser
    [applicationId1, applicationId2, docId1, docId2, completedDocId] = await t.run(
      async (ctx) => {
        const appId1 = await ctx.db.insert("applications", {
          userId: testUserId,
          universityId: universityId,
          programId: programId1,
          status: "draft",
          deadline: deadline1,
          priority: "medium",
          lastUpdated: new Date().toISOString(),
        });
        const appId2 = await ctx.db.insert("applications", {
          userId: testUserId,
          universityId: universityId,
          programId: programId2,
          status: "in_progress",
          deadline: deadline2,
          priority: "high",
          lastUpdated: new Date().toISOString(),
        });
        const dId1 = await ctx.db.insert("applicationDocuments", {
          applicationId: appId1,
          userId: testUserId,
          title: "SOP Draft 1",
          type: "sop",
          status: "draft",
          progress: 50,
          lastEdited: new Date().toISOString(),
        });
        const dId2 = await ctx.db.insert("applicationDocuments", {
          applicationId: appId2,
          userId: testUserId,
          title: "LOR Request 1",
          type: "lor",
          status: "not_started",
          progress: 0,
          lastEdited: new Date().toISOString(),
        });
        const compDocId = await ctx.db.insert("applicationDocuments", {
          applicationId: appId2,
          userId: testUserId,
          title: "LOR Request 2",
          type: "lor",
          status: "complete",
          progress: 100,
          lastEdited: new Date().toISOString(),
        });
        return [appId1, appId2, dId1, dId2, compDocId];
      }
    );
  });

  afterEach(async () => {
    vi.useRealTimers();
    vi.clearAllMocks();

    // Clean up database tables
    await t.run(async (ctx) => {
      // Delete all applications
      const apps = await ctx.db.query("applications").collect();
      await Promise.all(apps.map((app) => ctx.db.delete(app._id)));

      // Delete all application documents
      const docs = await ctx.db.query("applicationDocuments").collect();
      await Promise.all(docs.map((doc) => ctx.db.delete(doc._id)));

      // Delete all user activity records
      const activities = await ctx.db.query("userActivity").collect();
      await Promise.all(activities.map((act) => ctx.db.delete(act._id)));
    });
  });

  describe("Model", () => {
    describe("verifyApplicationOwnership", () => {
      test("should return userId and application for owner", async () => {
        const result = await asUser.run(async (ctx) => {
          return await ApplicationModel.verifyApplicationOwnership(
            ctx,
            applicationId1
          );
        });
        expect(result.userId).toBe(testUserId);
        expect(result.application._id).toBe(applicationId1);
      });

      test("should throw error if application not found", async () => {
        const nonExistentId = "j1234567890abcdefghij" as Id<"applications">;
        await expect(
          asUser.run(async (ctx) => {
            await ApplicationModel.verifyApplicationOwnership(
              ctx,
              nonExistentId
            );
          })
        ).rejects.toThrow("Application not found");
      });

      test("should throw error if user is not the owner", async () => {
        await expect(
          asOtherUser.run(async (ctx) => {
            // Use other user's identity
            await ApplicationModel.verifyApplicationOwnership(
              ctx,
              applicationId1
            );
          })
        ).rejects.toThrow(
          "Unauthorized: Application does not belong to the user"
        );
      });
    });

    describe("validateProgramBelongsToUniversity", () => {
      test("should return university and program if valid", async () => {
        const result = await t.run(async (ctx) => {
          return await ApplicationModel.validateProgramBelongsToUniversity(
            ctx,
            universityId,
            programId1
          );
        });
        expect(result.university._id).toBe(universityId);
        expect(result.program._id).toBe(programId1);
      });

      test("should throw error if university not found", async () => {
        const nonExistentUniId = "j1234567890abcdefghij" as Id<"universities">;
        await expect(
          t.run(async (ctx) => {
            await ApplicationModel.validateProgramBelongsToUniversity(
              ctx,
              nonExistentUniId,
              programId1
            );
          })
        ).rejects.toThrow("University not found");
      });

      test("should throw error if program not found", async () => {
        const nonExistentProgId = "j1234567890abcdefghij" as Id<"programs">;
        await expect(
          t.run(async (ctx) => {
            await ApplicationModel.validateProgramBelongsToUniversity(
              ctx,
              universityId,
              nonExistentProgId
            );
          })
        ).rejects.toThrow("Program not found");
      });

      test("should throw error if program does not belong to university", async () => {
        await expect(
          t.run(async (ctx) => {
            // Use programId1 (belongs to universityId) with otherUniversityId
            await ApplicationModel.validateProgramBelongsToUniversity(
              ctx,
              otherUniversityId,
              programId1
            );
          })
        ).rejects.toThrow(
          "Program does not belong to the specified university"
        );

        await expect(
          t.run(async (ctx) => {
            // Use otherProgramId (belongs to otherUniversityId) with universityId
            await ApplicationModel.validateProgramBelongsToUniversity(
              ctx,
              universityId,
              otherProgramId
            );
          })
        ).rejects.toThrow(
          "Program does not belong to the specified university"
        );
      });
    });

    describe("checkExistingApplication", () => {
      test("should not throw if no existing application", async () => {
        // Use a program for which the user doesn't have an application yet
        const newProgId = await t.run(
          async (ctx) =>
            await ctx.db.insert("programs", {
              universityId,
              name: "New Check Prog",
              degree: "X",
              department: "Y",
              requirements: {},
              deadlines: {},
            })
        );
        await expect(
          t.run(async (ctx) => {
            await ApplicationModel.checkExistingApplication(
              ctx,
              testUserId,
              newProgId
            );
          })
        ).resolves.toBeNull();
      });

      test("should throw if an application already exists for the program", async () => {
        // applicationId1 is for programId1 and testUserId
        await expect(
          t.run(async (ctx) => {
            await ApplicationModel.checkExistingApplication(
              ctx,
              testUserId,
              programId1
            );
          })
        ).rejects.toThrow("You already have an application for this program");
      });

      test("should not throw if another user has an application for the program", async () => {
        // Create an application for the other user for programId1
        await t.run(
          async (ctx) =>
            await ctx.db.insert("applications", {
              userId: otherUserId,
              universityId,
              programId: programId1,
              status: "draft",
              deadline: deadline1,
              priority: "low",
              lastUpdated: "",
            })
        );

        // Check if the *testUserId* can create one (should not throw based on other user's app)
        await expect(
          t.run(async (ctx) => {
            // Re-check for testUserId and programId1 (which testUserId already has, so it *should* throw for *that* reason)
            await ApplicationModel.checkExistingApplication(
              ctx,
              testUserId,
              programId1
            );
          })
        ).rejects.toThrow("You already have an application for this program");

        // Check if the *otherUserId* would be blocked (they should be)
        await expect(
          t.run(async (ctx) => {
            await ApplicationModel.checkExistingApplication(
              ctx,
              otherUserId,
              programId1
            );
          })
        ).rejects.toThrow("You already have an application for this program");

        // Check if testUserId can create for programId2 (they already have one)
        await expect(
          t.run(async (ctx) => {
            await ApplicationModel.checkExistingApplication(
              ctx,
              testUserId,
              programId2
            );
          })
        ).rejects.toThrow("You already have an application for this program");
      });
    });

    describe("logApplicationActivity", () => {
      test("should insert a userActivity record", async () => {
        const description = "Test activity log";
        const oldStatus = "draft";
        const newStatus = "submitted";

        await asUser.run(async (ctx) => {
          await ApplicationModel.logApplicationActivity(
            ctx,
            applicationId1,
            description,
            oldStatus,
            newStatus
          );
        });

        const activity = await t.run(
          async (ctx) =>
            await ctx.db
              .query("userActivity")
              .filter((q) =>
                q.eq(q.field("metadata.applicationId"), applicationId1)
              )
              .order("desc")
              .first()
        );

        expect(activity).not.toBeNull();
        expect(activity?.userId).toBe(testUserId);
        expect(activity?.type).toBe("application_update");
        expect(activity?.description).toBe(description);
        expect(activity?.metadata.applicationId).toBe(applicationId1);
        expect(activity?.metadata.oldStatus).toBe(oldStatus);
        expect(activity?.metadata.newStatus).toBe(newStatus);
      });
    });

    // --- Data Fetching Functions Tests ---

    describe("getApplicationsWithDetails", () => {
      test("should return applications with university, program, and document details", async () => {
        const apps = await t.run(async (ctx) => {
          return await ApplicationModel.getApplicationsWithDetails(
            ctx,
            testUserId
          );
        });

        expect(apps).toHaveLength(2);

        const app1 = apps.find((a) => a._id === applicationId1);
        const app2 = apps.find((a) => a._id === applicationId2);

        expect(app1).toBeDefined();
        expect(app1?.university).toBe("Test University");
        expect(app1?.program).toBe("Test Program 1");
        expect(app1?.applicationDocuments).toHaveLength(1);
        expect(app1?.applicationDocuments[0]._id).toBe(docId1);

        expect(app2).toBeDefined();
        expect(app2?.university).toBe("Test University");
        expect(app2?.program).toBe("Test Program 2");
        expect(app2?.applicationDocuments).toHaveLength(2); // docId2 + completed doc
      });

      test("should return empty array for user with no applications", async () => {
        const apps = await t.run(async (ctx) => {
          return await ApplicationModel.getApplicationsWithDetails(
            ctx,
            otherUserId
          );
        });
        expect(apps).toEqual([]);
      });
    });

    describe("getApplicationsWithProgress", () => {
      test("should return applications with calculated progress", async () => {
        const apps = await t.run(async (ctx) => {
          return await ApplicationModel.getApplicationsWithProgress(
            ctx,
            testUserId
          );
        });

        expect(apps).toHaveLength(2);

        const app1 = apps.find((a) => a.id === applicationId1);
        const app2 = apps.find((a) => a.id === applicationId2);

        // App1: 1 doc ('draft') -> 0 complete / 1 total = 0%
        expect(app1).toBeDefined();
        expect(app1?.university).toBe("Test University");
        expect(app1?.program).toBe("Test Program 1");
        expect(app1?.degree).toBe("M.S.");
        expect(app1?.documentsComplete).toBe(0);
        expect(app1?.totalDocuments).toBe(1);
        expect(app1?.progress).toBe(0);

        // App2: 2 docs ('not_started', 'complete') -> 1 complete / 2 total = 50%
        expect(app2).toBeDefined();
        expect(app2?.university).toBe("Test University");
        expect(app2?.program).toBe("Test Program 2");
        expect(app2?.degree).toBe("Ph.D.");
        expect(app2?.documentsComplete).toBe(1);
        expect(app2?.totalDocuments).toBe(2);
        expect(app2?.progress).toBe(50);
      });

      test("should return empty array for user with no applications", async () => {
        const apps = await t.run(async (ctx) => {
          return await ApplicationModel.getApplicationsWithProgress(
            ctx,
            otherUserId
          );
        });
        expect(apps).toEqual([]);
      });
    });

    describe("getApplicationDocumentsByUniversity", () => {
      test("should return documents grouped by university", async () => {
        // Add an application/doc at the other university for the same user
        const otherAppId = await t.run(
          async (ctx) =>
            await ctx.db.insert("applications", {
              userId: testUserId,
              universityId: otherUniversityId,
              programId: otherProgramId,
              status: "draft",
              deadline: deadline1,
              priority: "low",
              lastUpdated: "",
            })
        );
        const otherDocId = await t.run(
          async (ctx) =>
            await ctx.db.insert("applicationDocuments", {
              applicationId: otherAppId,
              userId: testUserId,
              title: "Other SOP",
              type: "sop",
              status: "draft",
              progress: 10,
              lastEdited: "",
            })
        );

        const groupedDocs = await t.run(async (ctx) => {
          return await ApplicationModel.getApplicationDocumentsByUniversity(
            ctx,
            testUserId
          );
        });

        expect(groupedDocs).toHaveLength(2); // Test University and Other University

        const testUniData = groupedDocs.find(
          (u) => u.name === "Test University"
        );
        const otherUniData = groupedDocs.find(
          (u) => u.name === "Other University"
        );

        expect(testUniData).toBeDefined();
        expect(testUniData?.programs).toHaveLength(2); // Prog 1 and Prog 2
        expect(testUniData?.documents).toHaveLength(3); // docId1, docId2, completed doc
        expect(testUniData?.documents).toMatchObject([
          {
            count: 1,
            documentId: "10087;applicationDocuments",
            program: "M.S. in Test Program 1",
            progress: 50,
            status: "draft",
            type: "sop",
          },
          {
            count: 1,
            documentId: "10088;applicationDocuments",
            program: "Ph.D. in Test Program 2",
            progress: 0,
            status: "not_started",
            type: "lor",
          },
          {
            count: 1,
            documentId: "10089;applicationDocuments",
            program: "Ph.D. in Test Program 2",
            progress: 100,
            status: "complete",
            type: "lor",
          },
        ]);

        expect(otherUniData).toBeDefined();
        expect(otherUniData?.programs).toHaveLength(1);
        expect(otherUniData?.documents).toHaveLength(1);
        expect(otherUniData?.documents).toMatchObject([
          {
            count: 1,
            documentId: "10091;applicationDocuments",
            program: "M.Eng. in Other Program",
            progress: 10,
            status: "draft",
            type: "sop",
          },
        ]);
      });

      test("should return empty array for user with no applications/documents", async () => {
        const groupedDocs = await t.run(async (ctx) => {
          return await ApplicationModel.getApplicationDocumentsByUniversity(
            ctx,
            otherUserId
          );
        });
        expect(groupedDocs).toEqual([]);
      });
    });

    describe("getApplicationWithDetails", () => {
      test("should return detailed info for a specific application", async () => {
        const details = await t.run(async (ctx) => {
          // Note: model function expects string ID from query args
          return await ApplicationModel.getApplicationWithDetails(
            ctx,
            testUserId,
            applicationId1.toString()
          );
        });

        expect(details).not.toBeNull();
        expect(details?._id).toBe(applicationId1);
        expect(details?.userId).toBe(testUserId);
        expect(details?.university).toBe("Test University");
        expect(details?.program).toBe("Test Program 1");
        expect(details?.degree).toBe("M.S.");
        expect(details?.department).toBe("Testing");
        expect(details?.documents).toHaveLength(1);
        expect(details?.documents[0]._id).toBe(docId1);
      });

      test("should return null if application not found for the user", async () => {
        const nonExistentId = "j1234567890abcdefghij";
        const details = await t.run(async (ctx) => {
          return await ApplicationModel.getApplicationWithDetails(
            ctx,
            testUserId,
            nonExistentId
          );
        });
        expect(details).toBeNull();
      });

      test("should return null if application belongs to another user", async () => {
        // Create app for other user
        const otherAppId = await t.run(
          async (ctx) =>
            await ctx.db.insert("applications", {
              userId: otherUserId,
              universityId,
              programId: programId1,
              status: "draft",
              deadline: deadline1,
              priority: "low",
              lastUpdated: "",
            })
        );

        const details = await t.run(async (ctx) => {
          // Try to fetch other user's app as testUserId
          return await ApplicationModel.getApplicationWithDetails(
            ctx,
            testUserId,
            otherAppId.toString()
          );
        });
        expect(details).toBeNull(); // Because the initial query filters by userId
      });
    });

    // --- Data Modification Functions Tests ---

    describe("createNewApplication", () => {
      let newProgId: Id<"programs">;
      const newDeadline = new Date(
        Date.now() + 20 * 24 * 60 * 60 * 1000
      ).toISOString();

      beforeEach(async () => {
        newProgId = await t.run(
          async (ctx) =>
            await ctx.db.insert("programs", {
              universityId,
              name: "New Create Prog",
              degree: "MFA",
              department: "Arts",
              requirements: {},
              deadlines: { fall: newDeadline },
            })
        );
      });

      test("should create application and default documents", async () => {
        const newAppId = await asUser.run(async (ctx) => {
          return await ApplicationModel.createNewApplication(
            ctx,
            testUserId,
            universityId,
            newProgId,
            newDeadline,
            "low"
          );
        });

        expect(newAppId).toBeDefined();

        const newApp = await t.run(async (ctx) => await ctx.db.get(newAppId));
        expect(newApp).not.toBeNull();
        expect(newApp?.userId).toBe(testUserId);
        expect(newApp?.programId).toBe(newProgId);
        expect(newApp?.status).toBe("draft");

        const docs = await t.run(
          async (ctx) =>
            await ctx.db
              .query("applicationDocuments")
              .withIndex("by_application", (q) =>
                q.eq("applicationId", newAppId)
              )
              .collect()
        );
        expect(docs).toHaveLength(3); // Default: 1 SOP, 2 LOR
        expect(docs.filter((d) => d.type === "sop")).toHaveLength(1);
        expect(docs.filter((d) => d.type === "lor")).toHaveLength(2);
        expect(docs.every((d) => d.status === "not_started")).toBe(true);

        const activity = await t.run(
          async (ctx) =>
            await ctx.db
              .query("userActivity")
              .filter((q) => q.eq(q.field("metadata.applicationId"), newAppId))
              .first()
        );
        expect(activity?.description).toBe("Application created");
      });

      test("should create application with specified documents", async () => {
        const customDocs = [
          {
            type: "sop" as Validators.DocumentType,
            status: "draft" as Validators.DocumentStatus,
          },
          {
            type: "lor" as Validators.DocumentType,
            status: "complete" as Validators.DocumentStatus,
          },
        ];
        const newAppId = await asUser.run(async (ctx) => {
          return await ApplicationModel.createNewApplication(
            ctx,
            testUserId,
            universityId,
            newProgId,
            newDeadline,
            "high",
            "Custom notes",
            customDocs
          );
        });

        const newApp = await t.run(async (ctx) => await ctx.db.get(newAppId));
        expect(newApp?.notes).toBe("Custom notes");

        const docs = await t.run(
          async (ctx) =>
            await ctx.db
              .query("applicationDocuments")
              .withIndex("by_application", (q) =>
                q.eq("applicationId", newAppId)
              )
              .collect()
        );
        expect(docs).toHaveLength(2);
        expect(docs.find((d) => d.type === "sop")?.status).toBe("not_started");
        expect(docs.find((d) => d.type === "lor")?.status).toBe("not_started");
      });

      test("should throw if program does not belong to university", async () => {
        await expect(
          asUser.run(async (ctx) => {
            await ApplicationModel.createNewApplication(
              ctx,
              testUserId,
              otherUniversityId,
              newProgId,
              newDeadline,
              "low" // Wrong university
            );
          })
        ).rejects.toThrow(
          "Program does not belong to the specified university"
        );
      });

      test("should throw if application already exists for program", async () => {
        // Create it once
        await asUser.run(async (ctx) => {
          await ApplicationModel.createNewApplication(
            ctx,
            testUserId,
            universityId,
            newProgId,
            newDeadline,
            "low"
          );
        });
        // Try again
        await expect(
          asUser.run(async (ctx) => {
            await ApplicationModel.createNewApplication(
              ctx,
              testUserId,
              universityId,
              newProgId,
              newDeadline,
              "medium"
            );
          })
        ).rejects.toThrow("You already have an application for this program");
      });
    });

    describe("deleteApplicationWithDocuments", () => {
      test("should delete application and associated documents", async () => {
        const docsBefore = await t.run(
          async (ctx) =>
            await ctx.db
              .query("applicationDocuments")
              .withIndex("by_application", (q) =>
                q.eq("applicationId", applicationId1)
              )
              .collect()
        );
        expect(docsBefore.length).toBeGreaterThan(0);

        const result = await asUser.run(async (ctx) => {
          return await ApplicationModel.deleteApplicationWithDocuments(
            ctx,
            applicationId1
          );
        });

        expect(result.success).toBe(true);

        const appAfter = await t.run(
          async (ctx) => await ctx.db.get(applicationId1)
        );
        expect(appAfter).toBeNull();

        const docsAfter = await t.run(
          async (ctx) =>
            await ctx.db
              .query("applicationDocuments")
              .withIndex("by_application", (q) =>
                q.eq("applicationId", applicationId1)
              )
              .collect()
        );
        expect(docsAfter).toHaveLength(0);

        const activity = await t.run(
          async (ctx) =>
            await ctx.db
              .query("userActivity")
              .filter((q) =>
                q.eq(q.field("metadata.applicationId"), applicationId1)
              )
              .order("desc")
              .first()
        );
        expect(activity?.description).toBe("Application deleted");
        expect(activity?.metadata.newStatus).toBe("deleted");
      });

      test("should throw if application not found", async () => {
        const nonExistentId = "j1234567890abcdefghij" as Id<"applications">;
        await expect(
          asUser.run(async (ctx) => {
            await ApplicationModel.deleteApplicationWithDocuments(
              ctx,
              nonExistentId
            );
          })
        ).rejects.toThrow("Application not found");
      });

      test("should throw if user is not owner", async () => {
        await expect(
          asOtherUser.run(async (ctx) => {
            // Use other user
            await ApplicationModel.deleteApplicationWithDocuments(
              ctx,
              applicationId1
            );
          })
        ).rejects.toThrow(
          "Unauthorized: Application does not belong to the user"
        );
      });
    });

    describe("updateApplicationStatusWithMetadata", () => {
      test("should update status, notes, submissionDate, and log activity", async () => {
        const newStatus = "submitted";
        const newNotes = "Submitted via portal";
        const submissionDate = new Date().toISOString();

        const initialApp = await asUser.query(
          api.applications.queries.getApplication,
          { applicationId: applicationId1 }
        );
        vi.advanceTimersByTime(1000); // Simulate time passing for lastUpdated

        const updatedAppId = await asUser.run(async (ctx) => {
          return await ApplicationModel.updateApplicationStatusWithMetadata(
            ctx,
            applicationId1,
            newStatus,
            newNotes,
            submissionDate
          );
        });

        expect(updatedAppId).toBe(applicationId1);

        const updatedApp = await t.run(
          async (ctx) => await ctx.db.get(applicationId1)
        );
        expect(updatedApp?.status).toBe(newStatus);
        expect(updatedApp?.notes).toBe(newNotes);
        expect(updatedApp?.submissionDate).toBe(submissionDate);
        expect(updatedApp?.lastUpdated).not.toBe(initialApp?.lastUpdated); // Check if lastUpdated changed

        const activity = await t.run(
          async (ctx) =>
            await ctx.db
              .query("userActivity")
              .filter((q) =>
                q.eq(q.field("metadata.applicationId"), applicationId1)
              )
              .order("desc")
              .first()
        );
        expect(activity?.description).toBe(
          `Application status updated to ${newStatus}`
        );
        expect(activity?.metadata.oldStatus).toBe("draft"); // Initial status
        expect(activity?.metadata.newStatus).toBe(newStatus);
      });

      test("should update status only if other fields are undefined", async () => {
        const newStatus = "accepted";
        const initialApp = await t.run(
          async (ctx) => await ctx.db.get(applicationId1)
        );

        await asUser.run(async (ctx) => {
          await ApplicationModel.updateApplicationStatusWithMetadata(
            ctx,
            applicationId1,
            newStatus,
            undefined,
            undefined
          );
        });

        const updatedApp = await t.run(
          async (ctx) => await ctx.db.get(applicationId1)
        );
        expect(updatedApp?.status).toBe(newStatus);
        expect(updatedApp?.notes).toBe(initialApp?.notes); // Should remain unchanged
        expect(updatedApp?.submissionDate).toBe(initialApp?.submissionDate); // Should remain unchanged
      });

      test("should not set submissionDate if status is not 'submitted'", async () => {
        const newStatus = "accepted";
        const submissionDate = new Date().toISOString();

        await asUser.run(async (ctx) => {
          await ApplicationModel.updateApplicationStatusWithMetadata(
            ctx,
            applicationId1,
            newStatus,
            "Got acceptance!",
            submissionDate
          );
        });

        const updatedApp = await t.run(
          async (ctx) => await ctx.db.get(applicationId1)
        );
        expect(updatedApp?.status).toBe(newStatus);
        expect(updatedApp?.notes).toBe("Got acceptance!");
        expect(updatedApp?.submissionDate).toBeUndefined(); // Should not be set
      });

      test("should throw if application not found", async () => {
        const nonExistentId = "j1234567890abcdefghij" as Id<"applications">;
        await expect(
          asUser.run(async (ctx) => {
            await ApplicationModel.updateApplicationStatusWithMetadata(
              ctx,
              nonExistentId,
              "submitted"
            );
          })
        ).rejects.toThrow("Application not found");
      });

      test("should throw if user is not owner", async () => {
        await expect(
          asOtherUser.run(async (ctx) => {
            // Use other user
            await ApplicationModel.updateApplicationStatusWithMetadata(
              ctx,
              applicationId1,
              "submitted"
            );
          })
        ).rejects.toThrow(
          "Unauthorized: Application does not belong to the user"
        );
      });
    });

    describe("getApplicationsForUser", () => {
      test("should return all applications for the specified user", async () => {
        const apps = await t.run(async (ctx) => {
          return await ApplicationModel.getApplicationsForUser(ctx, testUserId);
        });
        expect(apps).toHaveLength(2);
        expect(apps.some((a) => a._id === applicationId1)).toBe(true);
        expect(apps.some((a) => a._id === applicationId2)).toBe(true);
        expect(apps.every((a) => a.userId === testUserId)).toBe(true);
      });

      test("should return empty array for user with no applications", async () => {
        const apps = await t.run(async (ctx) => {
          return await ApplicationModel.getApplicationsForUser(
            ctx,
            otherUserId
          );
        });
        expect(apps).toEqual([]);
      });
    });
  });

  describe("Queries", () => {
    describe("getApplications", () => {
      test("should return applications with progress for the authenticated user", async () => {
        const apps = await asUser.query(
          api.applications.queries.getApplications
        );

        expect(apps).toHaveLength(2);

        const app1 = apps.find((a) => a.id === applicationId1);
        const app2 = apps.find((a) => a.id === applicationId2);

        expect(app1).toBeDefined();
        expect(app1?.university).toBe("Test University");
        expect(app1?.program).toBe("Test Program 1");
        expect(app1?.progress).toBe(0); // 0/1 complete
        expect(app1?.documentsComplete).toBe(0);
        expect(app1?.totalDocuments).toBe(1);

        expect(app2).toBeDefined();
        expect(app2?.university).toBe("Test University");
        expect(app2?.program).toBe("Test Program 2");
        expect(app2?.progress).toBe(50); // 1/2 complete
        expect(app2?.documentsComplete).toBe(1);
        expect(app2?.totalDocuments).toBe(2);
      });

      test("should return empty array for user with no applications", async () => {
        const apps = await asOtherUser.query(
          api.applications.queries.getApplications
        );
        expect(apps).toEqual([]);
      });
    });

    describe("getDocumentDetails", () => {
      test("should return documents grouped by university for the authenticated user", async () => {
        // Add an app/doc at another university for the same user
        const otherAppId = await t.run(
          async (ctx) =>
            await ctx.db.insert("applications", {
              userId: testUserId,
              universityId: otherUniversityId,
              programId: otherProgramId,
              status: "draft",
              deadline: deadline1,
              priority: "low",
              lastUpdated: "",
            })
        );
        const otherDocId = await t.run(
          async (ctx) =>
            await ctx.db.insert("applicationDocuments", {
              applicationId: otherAppId,
              userId: testUserId,
              title: "Other SOP",
              type: "sop",
              status: "draft",
              progress: 10,
              lastEdited: "",
            })
        );

        const groupedDocs = await asUser.query(
          api.applications.queries.getDocumentDetails
        );

        expect(groupedDocs).toHaveLength(2); // Test University and Other University

        const testUniData = groupedDocs.find(
          (u) => u.name === "Test University"
        );
        const otherUniData = groupedDocs.find(
          (u) => u.name === "Other University"
        );

        expect(testUniData).toBeDefined();
        expect(testUniData?.programs).toHaveLength(2);
        expect(testUniData?.documents).toHaveLength(3);
        // Check if specific document IDs are present and associated correctly
        expect(testUniData?.documents).toMatchObject([
          {
            count: 1,
            documentId: `${docId1}`,
            program: "M.S. in Test Program 1",
            progress: 50,
            status: "draft",
          },
          {
            count: 1,
            documentId: `${docId2}`,
            program: "Ph.D. in Test Program 2",
            progress: 0,
            status: "not_started",
          },
          {
            count: 1,
            documentId: `${completedDocId}`,
            program: "Ph.D. in Test Program 2",
            progress: 100,
            status: "complete",
          },
        ]);
        expect(otherUniData).toBeDefined();
        expect(otherUniData?.programs).toHaveLength(1);
        expect(otherUniData?.documents).toHaveLength(1);
        expect(otherUniData?.documents).toMatchObject([
          {
            count: 1,
            documentId: `${otherDocId}`,
            program: "M.Eng. in Other Program",
            progress: 10,
            status: "draft",
          },
        ]);
      });

      test("should return empty array for user with no documents", async () => {
        const groupedDocs = await asOtherUser.query(
          api.applications.queries.getDocumentDetails
        );
        expect(groupedDocs).toEqual([]);
      });
    });

    describe("getApplicationDetails", () => {
      test("should return detailed info for a specific application owned by the user", async () => {
        const details = await asUser.query(
          api.applications.queries.getApplicationDetails,
          {
            applicationId: applicationId1.toString(), // Query expects string ID
          }
        );

        expect(details).not.toBeNull();
        expect(details?._id).toBe(applicationId1);
        expect(details?.userId).toBe(testUserId);
        expect(details?.university).toBe("Test University");
        expect(details?.program).toBe("Test Program 1");
        expect(details?.degree).toBe("M.S.");
        expect(details?.documents).toHaveLength(1);
        expect(details?.documents[0]._id).toBe(docId1);
      });

      test("should return null if application ID does not exist", async () => {
        const nonExistentId = "j1234567890abcdefghij";
        const details = await asUser.query(
          api.applications.queries.getApplicationDetails,
          {
            applicationId: nonExistentId,
          }
        );
        expect(details).toBeNull();
      });

      test("should return null if application belongs to another user", async () => {
        // Try to fetch applicationId1 (owned by testUser) as otherUser
        const details = await asOtherUser.query(
          api.applications.queries.getApplicationDetails,
          {
            applicationId: applicationId1.toString(),
          }
        );
        expect(details).toBeNull(); // Because the underlying model function filters by userId
      });
    });

    describe("getApplication", () => {
      test("should return the application if owned by the user", async () => {
        const app = await asUser.query(
          api.applications.queries.getApplication,
          {
            applicationId: applicationId1,
          }
        );

        expect(app).not.toBeNull();
        expect(app?._id).toBe(applicationId1);
        expect(app?.userId).toBe(testUserId);
        expect(app?.status).toBe("draft");
      });

      test("should throw error if application ID does not exist", async () => {
        await asUser.mutation(api.applications.mutations.deleteApplication, {
          applicationId: applicationId1,
        });
        await expect(
          asUser.query(api.applications.queries.getApplication, {
            applicationId: applicationId1,
          })
        ).rejects.toThrow("Application not found"); // Error from verifyApplicationOwnership
      });

      test("should throw error if application belongs to another user", async () => {
        // Try to fetch applicationId1 (owned by testUser) as otherUser
        await expect(
          asOtherUser.query(api.applications.queries.getApplication, {
            applicationId: applicationId1,
          })
        ).rejects.toThrow(
          "Unauthorized: Application does not belong to the user"
        ); // Error from verifyApplicationOwnership
      });
    });
  });

  describe("Mutations", () => {
    describe("createApplication", () => {
      let newProgId: Id<"programs">;
      const newDeadline = new Date(
        Date.now() + 20 * 24 * 60 * 60 * 1000
      ).toISOString();

      beforeEach(async () => {
        // Create a program specifically for creation tests to avoid conflicts
        newProgId = await t.run(
          async (ctx) =>
            await ctx.db.insert("programs", {
              universityId,
              name: "New Create Prog Mut",
              degree: "MFA",
              department: "Arts",
              requirements: {},
              deadlines: { fall: newDeadline },
            })
        );
      });

      test("should create application with specified documents", async () => {
        const customDocs = [
          {
            type: "sop" as Validators.DocumentType,
            status: "draft" as Validators.DocumentStatus,
          },
          {
            type: "lor" as Validators.DocumentType,
            status: "complete" as Validators.DocumentStatus,
          },
        ];
        const newAppId = await asUser.mutation(
          api.applications.mutations.createApplication,
          {
            universityId: universityId,
            programId: newProgId,
            deadline: newDeadline,
            priority: "high",
            applicationDocuments: customDocs,
          }
        );

        const docs = await t.run(
          async (ctx) =>
            await ctx.db
              .query("applicationDocuments")
              .withIndex("by_application", (q) =>
                q.eq("applicationId", newAppId)
              )
              .collect()
        );
        expect(docs).toHaveLength(2);
        // Note: createApplicationDocuments currently defaults status to 'not_started' regardless of input
        expect(docs.find((d) => d.type === "sop")?.status).toBe("not_started");
        expect(docs.find((d) => d.type === "lor")?.status).toBe("not_started");
      });

      test("should throw if program does not belong to university", async () => {
        await expect(
          asUser.mutation(api.applications.mutations.createApplication, {
            universityId: otherUniversityId, // Wrong university
            programId: newProgId,
            deadline: newDeadline,
            priority: "low",
            applicationDocuments: [],
          })
        ).rejects.toThrow(
          "Program does not belong to the specified university"
        );
      });

      test("should throw if application already exists for the program", async () => {
        // Use programId1 which already has an application (applicationId1) for testUser
        await expect(
          asUser.mutation(api.applications.mutations.createApplication, {
            universityId: universityId,
            programId: programId1, // Existing application
            deadline: deadline1,
            priority: "medium",
            applicationDocuments: [],
          })
        ).rejects.toThrow("You already have an application for this program");
      });

      test("should throw if not authenticated", async () => {
        // Use t without identity
        await expect(
          t.mutation(api.applications.mutations.createApplication, {
            universityId: universityId,
            programId: newProgId,
            deadline: newDeadline,
            priority: "low",
            applicationDocuments: [],
          })
        ).rejects.toThrow(); // Should throw auth error
      });
    });

    describe("deleteApplication", () => {
      test("should delete application and associated documents successfully by owner", async () => {
        const docsBefore = await t.run(
          async (ctx) =>
            await ctx.db
              .query("applicationDocuments")
              .withIndex("by_application", (q) =>
                q.eq("applicationId", applicationId1)
              )
              .collect()
        );
        expect(docsBefore.length).toBeGreaterThan(0);

        const result = await asUser.mutation(
          api.applications.mutations.deleteApplication,
          {
            applicationId: applicationId1,
          }
        );

        expect(result.success).toBe(true);

        const appAfter = await t.run(
          async (ctx) => await ctx.db.get(applicationId1)
        );
        expect(appAfter).toBeNull();

        const docsAfter = await t.run(
          async (ctx) =>
            await ctx.db
              .query("applicationDocuments")
              .withIndex("by_application", (q) =>
                q.eq("applicationId", applicationId1)
              )
              .collect()
        );
        expect(docsAfter).toHaveLength(0);

        const activity = await t.run(
          async (ctx) =>
            await ctx.db
              .query("userActivity")
              .filter((q) =>
                q.eq(q.field("metadata.applicationId"), applicationId1)
              )
              .order("desc")
              .first()
        );
        expect(activity?.description).toBe("Application deleted");
        expect(activity?.metadata.newStatus).toBe("deleted");
      });

      test("should throw if trying to delete non-existent application", async () => {
        await asUser.mutation(api.applications.mutations.deleteApplication, {
          applicationId: applicationId1,
        });
        await expect(
          asUser.mutation(api.applications.mutations.deleteApplication, {
            applicationId: applicationId1,
          })
        ).rejects.toThrow("Application not found");
      });

      test("should throw if trying to delete application owned by another user", async () => {
        await expect(
          asOtherUser.mutation(api.applications.mutations.deleteApplication, {
            // Use other user
            applicationId: applicationId1,
          })
        ).rejects.toThrow(
          "Unauthorized: Application does not belong to the user"
        );
      });

      test("should throw if not authenticated", async () => {
        await expect(
          t.mutation(api.applications.mutations.deleteApplication, {
            // Use t without identity
            applicationId: applicationId1,
          })
        ).rejects.toThrow(); // Auth error
      });
    });

    describe("updateApplicationStatus", () => {
      test("should update status, notes, submissionDate, and log activity by owner", async () => {
        const newStatus = "submitted";
        const newNotes = "Submitted via portal";
        const submissionDate = new Date().toISOString();
        const initialApp = await t.run(
          async (ctx) => await ctx.db.get(applicationId1)
        );
        vi.advanceTimersByTime(1000); // Ensure lastUpdated changes

        const updatedAppId = await asUser.mutation(
          api.applications.mutations.updateApplicationStatus,
          {
            applicationId: applicationId1,
            status: newStatus,
            notes: newNotes,
            submissionDate: submissionDate,
          }
        );

        expect(updatedAppId).toBe(applicationId1);

        const updatedApp = await t.run(
          async (ctx) => await ctx.db.get(applicationId1)
        );
        expect(updatedApp?.status).toBe(newStatus);
        expect(updatedApp?.notes).toBe(newNotes);
        expect(updatedApp?.submissionDate).toBe(submissionDate);
        expect(updatedApp?.lastUpdated).not.toBe(initialApp?.lastUpdated);

        const activity = await t.run(
          async (ctx) =>
            await ctx.db
              .query("userActivity")
              .filter((q) =>
                q.eq(q.field("metadata.applicationId"), applicationId1)
              )
              .order("desc")
              .first()
        );
        expect(activity?.description).toBe(
          `Application status updated to ${newStatus}`
        );
        expect(activity?.metadata.oldStatus).toBe("draft");
        expect(activity?.metadata.newStatus).toBe(newStatus);
      });

      test("should update status only if other fields are undefined", async () => {
        const newStatus = "accepted";
        const initialApp = await t.run(
          async (ctx) => await ctx.db.get(applicationId1)
        );

        await asUser.mutation(
          api.applications.mutations.updateApplicationStatus,
          {
            applicationId: applicationId1,
            status: newStatus,
            // notes and submissionDate are omitted (undefined)
          }
        );

        const updatedApp = await t.run(
          async (ctx) => await ctx.db.get(applicationId1)
        );
        expect(updatedApp?.status).toBe(newStatus);
        expect(updatedApp?.notes).toBe(initialApp?.notes); // Should remain unchanged
        expect(updatedApp?.submissionDate).toBe(initialApp?.submissionDate); // Should remain unchanged
      });

      test("should not set submissionDate if status is not 'submitted'", async () => {
        const newStatus = "accepted";
        const submissionDate = new Date().toISOString();

        await asUser.mutation(
          api.applications.mutations.updateApplicationStatus,
          {
            applicationId: applicationId1,
            status: newStatus,
            notes: "Got acceptance!",
            submissionDate: submissionDate, // Provide date even though status isn't submitted
          }
        );

        const updatedApp = await t.run(
          async (ctx) => await ctx.db.get(applicationId1)
        );
        expect(updatedApp?.status).toBe(newStatus);
        expect(updatedApp?.notes).toBe("Got acceptance!");
        expect(updatedApp?.submissionDate).toBeUndefined(); // Should not be set by the model function
      });

      test("should throw if trying to update non-existent application", async () => {
        await asUser.mutation(api.applications.mutations.deleteApplication, {
          applicationId: applicationId1,
        });
        await expect(
          asUser.mutation(api.applications.mutations.updateApplicationStatus, {
            applicationId: applicationId1,
            status: "submitted",
          })
        ).rejects.toThrow("Application not found");
      });

      test("should throw if trying to update application owned by another user", async () => {
        await expect(
          asOtherUser.mutation(
            api.applications.mutations.updateApplicationStatus,
            {
              // Use other user
              applicationId: applicationId1,
              status: "submitted",
            }
          )
        ).rejects.toThrow(
          "Unauthorized: Application does not belong to the user"
        );
      });

      test("should throw if not authenticated", async () => {
        await expect(
          t.mutation(api.applications.mutations.updateApplicationStatus, {
            // Use t without identity
            applicationId: applicationId1,
            status: "submitted",
          })
        ).rejects.toThrow(); // Auth error
      });
    });
  });

  describe("Timeline", () => {
    test("getTimeline: should return applications sorted by deadline (earliest first)", async () => {
      const timeline = await asUser.query(
        api.applications.timeline.getTimeline
      );

      expect(timeline).toHaveLength(2);
      // Check the order based on deadlines
      expect(timeline[0]._id).toBe(applicationId2); // deadline2 (+5 days)
      expect(timeline[1]._id).toBe(applicationId1); // deadline1 (+10 days)

      // Check if details are included (e.g., university, program, documents)
      const app2Details = timeline.find((app) => app._id === applicationId2);
      expect(app2Details?.university).toBe("Test University");
      expect(app2Details?.program).toBe("Test Program 2");
    });

    test("getTimeline: should return empty array for user with no applications", async () => {
      const timeline = await asOtherUser.query(
        api.applications.timeline.getTimeline
      );
      expect(timeline).toEqual([]);
    });

    test("getTimeline: should throw error if not authenticated", async () => {
      // Use t without identity
      await expect(
        t.query(api.applications.timeline.getTimeline)
      ).rejects.toThrow(); // Auth error from getCurrentUserIdOrThrow
    });
  });
});
