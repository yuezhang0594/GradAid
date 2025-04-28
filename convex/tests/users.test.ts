import { convexTest } from "convex-test";
import { describe, expect, it, vi } from "vitest";
import schema from "../schema";
import { api, internal } from "../_generated/api";
import { UserJSON } from "@clerk/backend";
import { Id } from "../_generated/dataModel";
import { getCurrentUserId, getCurrentUserIdOrThrow, getCurrentUserOrThrow, userByClerkId } from "../users";
import { QueryCtx } from "../_generated/server";

// Mock the createAiCredits function
vi.mock("../aiCredits/model", () => ({
    createAiCredits: vi.fn().mockResolvedValue(undefined),
    getUserAiCredits: vi.fn().mockResolvedValue({ credits: 10, _id: "dummyCreditId" }),
}));

const mockClerkUser = (
    id: string,
    email: string,
    firstName: string,
    lastName: string,
    provider: "oauth_google" | "password" = "password"
): UserJSON => {
    const isOauth = provider === "oauth_google";
    const emailId = `idn_${id}_email`;
    const externalAccountId = isOauth ? `idn_${id}_oauth` : undefined;
    const verificationStrategy = isOauth ? "from_oauth_google" : "ticket";

    return {
        id,
        first_name: firstName,
        last_name: lastName,
        email_addresses: [
            {
                id: emailId,
                email_address: email,
                verification: {
                    status: "verified",
                    strategy: verificationStrategy,
                    attempts: null,
                    expire_at: null,
                    object: "email_address",
                    id: ""
                },
                linked_to: isOauth ? [{ id: externalAccountId!, type: "oauth_google", object: "google_account" }] : [],
                object: "email_address",
            },
        ],
        primary_email_address_id: emailId,
        username: null,
        password_enabled: !isOauth,
        totp_enabled: false,
        backup_code_enabled: false,
        two_factor_enabled: false,
        banned: false,
        created_at: Date.now() - 10000,
        updated_at: Date.now(),
        image_url: `https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2V4YW1wbGUuY29tL2ltZy_${id}.pngInsecure`, // Sample format
        has_image: true,
        public_metadata: {},
        private_metadata: {},
        unsafe_metadata: {},
        last_sign_in_at: null,
        phone_numbers: [],
        primary_phone_number_id: null,
        web3_wallets: [],
        primary_web3_wallet_id: null,
        external_accounts: isOauth ? [
            {
                id: externalAccountId!,
                provider: "oauth_google",
                identification_id: externalAccountId!,
                approved_scopes: "email https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid profile",
                email_address: email,
                first_name: firstName,
                last_name: lastName,
                image_url: `https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NMQ1VYYWE0YlhaT2h0MThoZS1LUWhRbFZVWlRjRUJtY0FfOW1TNXBQTTRzdExVSTg4Yz1zMTAwMC1jIn0`, // Sample format
                provider_user_id: `google_${id}`,
                object: "external_account",
                public_metadata: {},
                label: null,
                verification: {
                    status: "verified",
                    strategy: "oauth_google",
                    attempts: null,
                    expire_at: Date.now() + 3600000,
                    object: "email_address",
                    id: "",
                },
                username: null,
            }
        ] : [],
        external_id: null,
        last_active_at: Date.now() - 500,
        object: "user",
        // Additional fields from sample
        create_organization_enabled: true,
        delete_self_enabled: true,
        legal_accepted_at: null,
        locked: false,
        lockout_expires_in_seconds: null,
        saml_accounts: [],
        verification_attempts_remaining: 100,
        organization_memberships: [], 
        password_last_updated_at: null, 
        create_organizations_limit: 1,
    };
};

describe("User Management", () => {
    it("should return null for current user when not authenticated", async () => {
        const t = convexTest(schema);
        // No identity provided, should return null
        const user = await t.query(api.users.current, {});
        expect(user).toBeNull();
    });

    it("should upsert a user from Clerk webhook (Password Auth)", async () => {
        const t = convexTest(schema);
        const clerkUser = mockClerkUser("clerkPass123", "testpass@example.com", "Test", "Password", "password");

        // Run the internal mutation
        await t.mutation(internal.users.upsertFromClerk, { data: clerkUser });

        // Verify user exists in the database
        const user = await t.run(async (ctx) => {
            return await userByClerkId(ctx, "clerkPass123");
        });
        expect(user).not.toBeNull();
        expect(user?.clerkId).toBe("clerkPass123");
        expect(user?.name).toBe("Test Password");
        expect(user?.email).toBe("testpass@example.com");

        // Verify AI credits were created
        const { createAiCredits } = await import("../aiCredits/model");
        expect(createAiCredits).toHaveBeenCalledTimes(1);
        expect(createAiCredits).toHaveBeenCalledWith(expect.anything(), user?._id);

        vi.clearAllMocks(); // Clear mocks including call counts
    });

    it("should upsert a user from Clerk webhook (OAuth)", async () => {
        const t = convexTest(schema);
        const clerkUser = mockClerkUser("clerkOauth456", "testoauth@example.com", "Test", "OAuth", "oauth_google");

        // Run the internal mutation
        await t.mutation(internal.users.upsertFromClerk, { data: clerkUser });

        // Verify user exists in the database
        const user = await t.run(async (ctx) => {
            return await userByClerkId(ctx, "clerkOauth456");
        });
        expect(user).not.toBeNull();
        expect(user?.clerkId).toBe("clerkOauth456");
        expect(user?.name).toBe("Test OAuth");
        expect(user?.email).toBe("testoauth@example.com");

        // Verify AI credits were created
        const { createAiCredits } = await import("../aiCredits/model");
        expect(createAiCredits).toHaveBeenCalledTimes(1);
        expect(createAiCredits).toHaveBeenCalledWith(expect.anything(), user?._id);

        vi.clearAllMocks(); // Clear mocks including call counts
    });


    it("should update an existing user from Clerk webhook", async () => {
        const t = convexTest(schema);
        const initialClerkUser = mockClerkUser("clerkUpdate789", "update@example.com", "Initial", "Name");
        const { createAiCredits } = await import("../aiCredits/model");
        
        await t.mutation(internal.users.upsertFromClerk, { data: initialClerkUser });
        
        // Reset mock call count before the update operation
        vi.clearAllMocks(); // Clear mocks including call counts

        const updatedClerkUser = mockClerkUser("clerkUpdate789", "updated@example.com", "Updated", "Name");
        // Simulate an update event - change name and email
        updatedClerkUser.updated_at = Date.now() + 1000;

        await t.mutation(internal.users.upsertFromClerk, { data: updatedClerkUser });

        const user = await t.run(async (ctx) => {
            return await userByClerkId(ctx, "clerkUpdate789");
        });
        expect(user).not.toBeNull();
        expect(user?.name).toBe("Updated Name");
        expect(user?.email).toBe("updated@example.com");

        // Verify AI credits were NOT created again for update
        expect(createAiCredits).not.toHaveBeenCalled();
    });

    it("should return the current user when authenticated", async () => {
        const t = convexTest(schema);
        const clerkId = "clerkCurrent1";
        const clerkUser = mockClerkUser(clerkId, "current@example.com", "Current", "User");
        await t.mutation(internal.users.upsertFromClerk, { data: clerkUser });
        const asUser = t.withIdentity({ subject: clerkId});

        const user = await asUser.query(api.users.current, {});

        expect(user).not.toBeNull();
        expect(user?.clerkId).toBe("clerkCurrent1");
        expect(user?.name).toBe("Current User");
        expect(user?.email).toBe("current@example.com");
    });

    it("should delete a user and associated data from Clerk webhook", async () => {
        const t = convexTest(schema);
        const clerkId = "clerkDeleteMe";
        const clerkUser = mockClerkUser(clerkId, "delete@example.com", "Delete", "Me");
        await t.mutation(internal.users.upsertFromClerk, { data: clerkUser });
        const asUser = t.withIdentity({ subject: clerkId });

        const userBeforeDelete = await asUser.query(api.users.current, {});
        expect(userBeforeDelete).not.toBeNull();
        const userId = userBeforeDelete!._id;
        
        // Add dummy data associated with the user
        await t.run(async (ctx) => {
                const universityId = await ctx.db.insert("universities", {
                    name: "Test University",
                        location: {
                          city: "Test City",
                          state: "Test State",
                          country: "Test Country",
                        },
                        ranking: 1,
                        website: "testuniversity.com",
                });
                const programId = await ctx.db.insert("programs", {
                        universityId: universityId,
                            name: "Test Program",
                            degree: "M.S.", // e.g. "M.S.", "Ph.D.", "M.Eng."
                            department: "Test Department",
                            requirements: {
                              minimumGPA: 2.5,
                              gre: false,
                              toefl: false,
                              recommendationLetters: 0,
                            },
                            deadlines: {
                              fall: "December 1",
                              spring: "April 1",
                            },
                });
                const applicationId = await ctx.db.insert("applications", {
                        userId: userId,
                        universityId: universityId,
                        programId: programId,
                        status: "not_started",
                        deadline: "2024-01-01T00:00:00Z",
                        priority: "high",
                        lastUpdated: new Date().toISOString(),
                });
                const documentId = await ctx.db.insert("applicationDocuments", { 
                       applicationId: applicationId,
                       userId: userId,
                       title: "Test Document",
                       type: "sop",
                       status: "not_started",
                       progress: 0,
                       lastEdited: new Date().toISOString(),
                });
        });
        
        // aiCredits are created during upsert, verify they exist
        const creditsBefore = await asUser.query(api.aiCredits.queries.getAiCredits, {});
        expect(creditsBefore).toBeTypeOf("object");


        // Run the delete mutation
        await t.mutation(internal.users.deleteFromClerk, { clerkUserId: "clerkDeleteMe" });

        // Verify user is deleted
        const userAfterDelete = await t.run(async (ctx) => {
            return await userByClerkId(ctx, "clerkDeleteMe");
        });
        expect(userAfterDelete).toBeNull();

        // Verify associated data is deleted
        const applicationsAfterDelete = await t.run(async (ctx) => {
            const applications = await ctx.db
                .query("applications")
                .filter((q) => q.eq(q.field("userId"), userId))
                .collect();
            return applications.length;
        });
        const documentsAfterDelete = await t.run(async (ctx) => {
            const documents = await ctx.db
                .query("applicationDocuments")
                .filter((q) => q.eq(q.field("userId"), userId))
                .collect();
            return documents.length;
        });
        const creditsAfterDelete = await t.run(async (ctx) => {
            const credits = await ctx.db
            .query("aiCredits")
            .filter((q) => q.eq(q.field("userId"), userId))
            .collect();
            return credits.length;
        });
        expect(applicationsAfterDelete).toBe(0);
        expect(documentsAfterDelete).toBe(0);
        expect(creditsAfterDelete).toBe(0);
    });

    it("should handle deleting a non-existent user gracefully", async () => {
        const t = convexTest(schema);
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

        // Attempt to delete a user that doesn't exist
        await t.mutation(internal.users.deleteFromClerk, { clerkUserId: "clerkNotFound" });

        // Verify no error was thrown and a warning was logged
        expect(consoleWarnSpy).toHaveBeenCalledWith(
            "Can't delete user, there is none for Clerk user ID: clerkNotFound"
        );

        consoleWarnSpy.mockRestore(); // Clean up spy
    });

    it("should return null for current user ID if not authenticated (getCurrentUserId)", async () => {
        const t = convexTest(schema);
        // Test the exported helper function via a query that uses it
        const userId = await t.query(api.users.current, {});
        expect(userId).toBeNull();
    });

    it("should handle upsert when primary email is not found (edge case)", async () => {
        const t = convexTest(schema);
        const clerkId = "clerkNoPrimaryEmail";
        const clerkUser = mockClerkUser(clerkId, "noprimary@example.com", "No", "Primary");
        // Simulate case where primary_email_address_id doesn't match any email_addresses id
        clerkUser.primary_email_address_id = "non_existent_email_id";

        const asUser = t.withIdentity({ subject: clerkId });
        await t.mutation(internal.users.upsertFromClerk, { data: clerkUser });

        const user = await asUser.query(api.users.current, {});
        expect(user).not.toBeNull();
        expect(user?.clerkId).toBe("clerkNoPrimaryEmail");
        expect(user?.name).toBe("No Primary");
        // Should default to empty string as per current logic in users.ts
        expect(user?.email).toBe("");
    });

    it("should find user by Clerk ID using userByClerkId", async () => {
        const t = convexTest(schema);
        const clerkUser = mockClerkUser("clerkFindMe", "findme@example.com", "Find", "Me");
        await t.mutation(internal.users.upsertFromClerk, { data: clerkUser });

        // Use the helper query directly
        const user = await t.run(async (ctx) => {
            return await userByClerkId(ctx, "clerkFindMe");
        });

        expect(user).not.toBeNull();
        expect(user?.clerkId).toBe("clerkFindMe");
        expect(user?.name).toBe("Find Me");
    });

    it("should return null from userByClerkId if user does not exist", async () => {
        const t = convexTest(schema);
        // Use the helper query directly with a non-existent ID
        const user = await t.run(async (ctx) => {
            return await userByClerkId(ctx, "clerkDoesNotExist");
        });
        expect(user).toBeNull();
    });

    // New tests for the getCurrentUser* helper functions
    describe("getCurrentUser* Helper Functions", () => {
        // Helper to set up a test user
        async function setupTestUser(t: any, clerkId: string) {
            const clerkUser = mockClerkUser(clerkId, "helper@example.com", "Helper", "User");
            await t.mutation(internal.users.upsertFromClerk, { data: clerkUser });
            return t.withIdentity({ subject: clerkId });
        }

        it("should return user ID with getCurrentUserId when authenticated", async () => {
            const t = convexTest(schema);
            const clerkId = "clerkIdHelper1";
            const asUser = await setupTestUser(t, clerkId);

            const result = await asUser.run(async (ctx: QueryCtx) => {
                // First get the user to compare IDs
                const user = await userByClerkId(ctx, clerkId);
                // Then test getCurrentUserId with identity
                const userId = await getCurrentUserId(ctx);
                return { user, userId };
            });

            expect(result.userId).not.toBeNull();
            expect(result.userId).toEqual(result.user?._id);
        });

        it("should return null with getCurrentUserId when not authenticated", async () => {
            const t = convexTest(schema);
            
            const userId = await t.run(async (ctx) => {
                return await getCurrentUserId(ctx);
            });
            
            expect(userId).toBeNull();
        });

        it("should return user with getCurrentUserOrThrow when authenticated", async () => {
            const t = convexTest(schema);
            const clerkId = "clerkIdHelper2";
            const asUser = await setupTestUser(t, clerkId);

            const user = await asUser.run(async (ctx: QueryCtx) => {
                return await getCurrentUserOrThrow(ctx);
            });

            expect(user).not.toBeNull();
            expect(user.clerkId).toBe(clerkId);
            expect(user.name).toBe("Helper User");
        });

        it("should throw with getCurrentUserOrThrow when not authenticated", async () => {
            const t = convexTest(schema);
            
            await expect(t.run(async (ctx) => {
                return await getCurrentUserOrThrow(ctx);
            })).rejects.toThrow("Can't get current user");
        });

        it("should return user ID with getCurrentUserIdOrThrow when authenticated", async () => {
            const t = convexTest(schema);
            const clerkId = "clerkIdHelper3";
            const asUser = await setupTestUser(t, clerkId);

            const result = await asUser.run(async (ctx: QueryCtx) => {
                // First get the user to compare IDs
                const user = await userByClerkId(ctx, clerkId);
                // Then test getCurrentUserIdOrThrow with identity
                const userId = await getCurrentUserIdOrThrow(ctx);
                return { user, userId };
            });

            expect(result.userId).toEqual(result.user?._id);
        });

        it("should throw with getCurrentUserIdOrThrow when not authenticated", async () => {
            const t = convexTest(schema);
            
            await expect(t.run(async (ctx) => {
                return await getCurrentUserIdOrThrow(ctx);
            })).rejects.toThrow("Can't get current user ID");
        });
    });
});