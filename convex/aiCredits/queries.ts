import { query } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentUserIdOrThrow } from "../users";
import * as AiCreditsModel from "./model";

/**
 * Retrieves the AI credits information for the current authenticated user.
 * 
 * @returns An object containing:
 * - totalCredits - The total number of AI credits allocated to the user
 * - usedCredits - The number of AI credits the user has consumed
 * - resetDate - The date when the user's credits will reset (as string)
 * @throws Error if no authenticated user is found
 */
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

/**
 * Retrieves detailed AI credit usage breakdown for the current authenticated user.
 * 
 * @returns An array of usage objects, each containing:
 * - type - The category/type of AI credit usage
 * - used - The number of credits used for this type
 * - percentage - The percentage this usage represents of total consumption
 * @throws Error if no authenticated user is found
 */
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

/**
 * Retrieves the remaining AI credits for the current authenticated user.
 * 
 * @returns A number representing the remaining available AI credits
 * @throws Error if no authenticated user is found
 */
export const getAiCreditsRemaining = query({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const userId = await getCurrentUserIdOrThrow(ctx);
    return await AiCreditsModel.getUserRemainingAiCredits(ctx, userId);
  },
});
