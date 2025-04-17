import { query } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentUserIdOrThrow } from "../users";
import * as AiCreditsModel from "./model";

export const getAiCredits = query({
  args: {},
  returns: v.object({
    totalCredits: v.number(),
    usedCredits: v.number(),
    resetDate: v.string(),
  }),
  handler: async (ctx) => {
    const userId = await getCurrentUserIdOrThrow(ctx);
    return await AiCreditsModel.getUserAiCredits(ctx, userId);
  },
});

export const getAiCreditUsage = query({
  args: {},
  returns: v.array(
    v.object({
      type: v.string(),
      used: v.number(),
      percentage: v.number(),
    })
  ),
  handler: async (ctx) => {
    const userId = await getCurrentUserIdOrThrow(ctx);
    return await AiCreditsModel.getUserAiCreditUsage(ctx, userId);
  },
});

export const getAiCreditsRemaining = query({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const userId = await getCurrentUserIdOrThrow(ctx);
    return await AiCreditsModel.getUserRemainingAiCredits(ctx, userId);
  },
});
