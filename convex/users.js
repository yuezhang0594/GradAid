import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
export const current = query({
    args: {},
    handler: async (ctx) => {
        return await getCurrentUser(ctx);
    },
});
export const upsertFromClerk = internalMutation({
    args: { data: v.any() }, // no runtime validation, trust Clerk
    async handler(ctx, { data }) {
        const primary_email_address = data.email_addresses.find(email => email.id === data.primary_email_address_id)?.email_address || '';
        const userAttributes = {
            name: `${data.first_name} ${data.last_name}`,
            email: primary_email_address,
            clerkId: data.id,
        };
        const user = await userByClerkId(ctx, data.id);
        if (user === null) {
            await ctx.db.insert("users", userAttributes);
        }
        else {
            await ctx.db.patch(user._id, userAttributes);
        }
    },
});
export const deleteFromClerk = internalMutation({
    args: { clerkUserId: v.string() },
    async handler(ctx, { clerkUserId }) {
        const user = await userByClerkId(ctx, clerkUserId);
        if (user !== null) {
            await ctx.db.delete(user._id);
        }
        else {
            console.warn(`Can't delete user, there is none for Clerk user ID: ${clerkUserId}`);
        }
    },
});
export async function getCurrentUserIdOrThrow(ctx) {
    const userRecord = await getCurrentUser(ctx);
    if (!userRecord)
        throw new Error("Can't get current user ID");
    return userRecord._id;
}
export async function getCurrentUserId(ctx) {
    const userRecord = await getCurrentUser(ctx);
    return userRecord ? userRecord._id : null;
}
export async function getCurrentUserOrThrow(ctx) {
    const userRecord = await getCurrentUser(ctx);
    if (!userRecord)
        throw new Error("Can't get current user");
    return userRecord;
}
export async function getCurrentUser(ctx) {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
        return null;
    }
    return await userByClerkId(ctx, identity.subject);
}
export async function userByClerkId(ctx, clerkId) {
    return await ctx.db
        .query("users")
        .withIndex("byClerkId", (q) => q.eq("clerkId", clerkId))
        .unique();
}
export async function getDemoUserId(ctx) {
    const demoUser = await ctx.db
        .query("users")
        .filter(q => q.eq(q.field("name"), "Demo User"))
        .first();
    if (!demoUser) {
        throw new Error("Demo user not found");
    }
    return demoUser._id;
}
