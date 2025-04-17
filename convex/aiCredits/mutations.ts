import { internalMutation, mutation } from "../_generated/server";
import { v } from "convex/values";
import { AiCreditUsageType, aiCreditUsageTypeValidator, DEFAULT_AI_CREDITS, RESET_DAYS_IN_MILLISECONDS } from "../validators";
import { getCurrentUserIdOrThrow } from "../users";
import * as AiCreditsModel from "./model";

/**
 * Use AI credits for a specific action
 * This mutation allows consuming AI credits and recording their usage
 * 
 * @param args.type - The type of action consuming the credits
 * @param args.credits - Number of credits to consume
 * @param args.description - Optional description of the usage
 * @returns An object containing updated credit information
 */
export const useCredits = mutation({
  args: {
    type: aiCreditUsageTypeValidator,
    credits: v.number(),
    description: v.optional(v.string()),
  },
  returns: v.object({
    totalCredits: v.number(),
    usedCredits: v.number(),
    resetDate: v.string(),
    remainingCredits: v.number(),
  }),
  handler: async (ctx, args) => {
    // Get the authenticated user ID
    const userId = await getCurrentUserIdOrThrow(ctx);
    
    // Validate credit amount is positive
    if (args.credits <= 0) {
      throw new Error("Credit amount must be positive");
    }
    
    // Check if user has sufficient credits
    const currentCredits = await AiCreditsModel.getUserRemainingAiCredits(ctx, userId);
    if (currentCredits < args.credits) {
      throw new Error(`Insufficient credits. You have ${currentCredits} credits available.`);
    }
    
    // Use the credits
    const updatedSummary = await AiCreditsModel.useAiCredits(
      ctx,
      userId,
      args.type,
      args.credits,
      args.description
    );
    
    // TODO: Move this to userActivity model
    await ctx.db.insert("userActivity", {
      userId,
      type: "ai_usage",
      description: `Used ${args.credits} credits for ${args.type}${args.description ? `: ${args.description}` : ''}`,
      timestamp: new Date().toISOString(),
      metadata: {
        creditsUsed: args.credits,
        remainingCredits: updatedSummary.totalCredits - updatedSummary.usedCredits
      }
    });
    
    return {
      ...updatedSummary,
      remainingCredits: updatedSummary.totalCredits - updatedSummary.usedCredits
    };
  },
});

/**
 * Reset user's AI credits to the default amount
 * This mutation will reset the usage counter and update the reset date
 * Typically used for subscription renewals or manual admin resets
 */
export const resetCredits = internalMutation({
  args: {
    userId: v.id("users"),
  },
  returns: v.object({
    totalCredits: v.number(),
    usedCredits: v.number(),
    resetDate: v.string(),
  }),
  handler: async (ctx, args) => {
    // Get the authenticated user (to verify admin status)
    const adminId = await getCurrentUserIdOrThrow(ctx);
    
    // TODO: In a production app, we would check if the current user is an admin
    // For now, this is a simplified version that allows resetting without admin checks
    
    // Reset the user's credits
    const aiCredits = await ctx.db
      .query("aiCredits")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
    
    const resetDate = new Date(Date.now() + RESET_DAYS_IN_MILLISECONDS).toISOString();
    
    if (!aiCredits) {
      // If no credit record exists, create a new one
      const newAiCredits = await ctx.db.insert("aiCredits", {
        userId: args.userId,
        totalCredits: DEFAULT_AI_CREDITS,
        usedCredits: 0,
        resetDate
      });
      
      // Log this credit reset
      await AiCreditsModel.recordAiCreditUsage(
        ctx, 
        args.userId, 
        "ai_credits_reset" as AiCreditUsageType,
        0, 
        "Credits automatically replenished."
      );
      
      return {
        totalCredits: DEFAULT_AI_CREDITS,
        usedCredits: 0,
        resetDate
      };
    } else {
      // Update the existing record
      await ctx.db.patch(aiCredits._id, {
        usedCredits: 0,
        resetDate
      });
      
      // Log this credit reset
      await AiCreditsModel.recordAiCreditUsage(
        ctx, 
        args.userId, 
        "ai_credits_reset" as AiCreditUsageType,
        0, 
        "Credits automatically replenished."
      );
      
      return {
        totalCredits: aiCredits.totalCredits,
        usedCredits: 0,
        resetDate
      };
    }
  }
});
