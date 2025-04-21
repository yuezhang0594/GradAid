import { internalMutation, MutationCtx, query, QueryCtx } from "./_generated/server";
import { UserJSON } from "@clerk/backend";
import { v, Validator } from "convex/values";
import { createAiCredits } from "./aiCredits/model";
import { Id } from "./_generated/dataModel";
import { TABLES_WITH_USER_DATA } from "./validators";

export const current = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

export const upsertFromClerk = internalMutation({
  args: { data: v.any() as Validator<UserJSON> }, // no runtime validation, trust Clerk
  async handler(ctx, { data }) {
    const primary_email_address = data.email_addresses.find(
      email => email.id === data.primary_email_address_id
    )?.email_address || '';
    
    const userAttributes = {
      name: `${data.first_name} ${data.last_name}`,
      email: primary_email_address,
      clerkId: data.id,
    };

    const user = await userByClerkId(ctx, data.id);
    if (user === null) {
      const userId = await ctx.db.insert("users", userAttributes);
      await createAiCredits(ctx, userId);
    } else {
      await ctx.db.patch(user._id, userAttributes);
    }
  },
});

export const deleteFromClerk = internalMutation({
  args: { clerkUserId: v.string() },
  async handler(ctx, { clerkUserId }) {
    const user = await userByClerkId(ctx, clerkUserId);

    if (user !== null) {
      await deleteUserData(ctx, user._id);
      await ctx.db.delete(user._id);
    } else {
      console.warn(
        `Can't delete user, there is none for Clerk user ID: ${clerkUserId}`,
      );
    }
  },
});

export async function getCurrentUserIdOrThrow(ctx: QueryCtx | MutationCtx) {
  const userRecord = await getCurrentUser(ctx);
  if (!userRecord) throw new Error("Can't get current user ID");
  return userRecord._id;
}

export async function getCurrentUserId(ctx: QueryCtx | MutationCtx) {
  const userRecord = await getCurrentUser(ctx);
  return userRecord ? userRecord._id : null;
}

export async function getCurrentUserOrThrow(ctx: QueryCtx | MutationCtx) {
  const userRecord = await getCurrentUser(ctx);
  if (!userRecord) throw new Error("Can't get current user");
  return userRecord;
}

export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) {
    return null;
  }
  return await userByClerkId(ctx, identity.subject);
}

export async function userByClerkId(ctx: QueryCtx | MutationCtx, clerkId: string) {
  return await ctx.db
    .query("users")
    .withIndex("byClerkId", (q) => q.eq("clerkId", clerkId))
    .unique();
}

export async function deleteUserData(ctx: MutationCtx, userId: Id<"users">) {
  for (const table of TABLES_WITH_USER_DATA) {
    const documents = await ctx.db
      .query(table)
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    if (documents.length > 0) {
      for (const document of documents) {
        await ctx.db.delete(document._id);
      }
    }
  }
}