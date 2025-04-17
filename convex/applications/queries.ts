import { query } from "../_generated/server";
import { getCurrentUserIdOrThrow } from "../users";
import { Id } from "../_generated/dataModel";
import { v } from "convex/values";
import { getApplicationDocumentsByUniversity, getApplicationWithDetails, getApplicationsWithProgress, verifyApplicationOwnership } from "./model";

// Query to get applications for a specific user
export const getApplications = query({
  args: {},
  handler: async (ctx, args) => {
    const userId = await getCurrentUserIdOrThrow(ctx);
    return await getApplicationsWithProgress(ctx, userId);
  },
});

// Query to get document details with application info
export const getDocumentDetails = query({
  args: {},
  handler: async (ctx, args) => {
    const userId = await getCurrentUserIdOrThrow(ctx);
    return await getApplicationDocumentsByUniversity(ctx, userId);
  },
});

// Query to get application details, documents, and LORs for a specific university
export const getApplicationDetails = query({
  args: {
    applicationId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserIdOrThrow(ctx);
    return await getApplicationWithDetails(ctx, userId, args.applicationId);
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

export const getApplication = query({
  args: {
    applicationId: v.id("applications"),
  },
  handler: async (ctx, args) => {
    const { application } = await verifyApplicationOwnership(ctx, args.applicationId);
    return application;
  }
});