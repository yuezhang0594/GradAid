import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { AiCreditUsageType, DEFAULT_AI_CREDITS, RESET_DAYS_IN_MILLISECONDS } from "../validators";

export interface AiCreditSummary {
  totalCredits: number;
  usedCredits: number;
  resetDate: string;
}

export interface AiCreditUsageStat {
  type: string;
  used: number;
  percentage: number;
}

// Get the AI credits for a specific user
export async function getUserAiCredits(
  ctx: QueryCtx,
  userId: Id<"users">
): Promise<AiCreditSummary> {
  // Get AI credits for the user
  const aiCredits = await ctx.db
    .query("aiCredits")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();

  if (!aiCredits) {
    return {
      totalCredits: DEFAULT_AI_CREDITS,
      usedCredits: 0,
      resetDate: new Date(Date.now() + RESET_DAYS_IN_MILLISECONDS).toISOString(),
    };
  }

  return {
    totalCredits: aiCredits.totalCredits,
    usedCredits: aiCredits.usedCredits,
    resetDate: aiCredits.resetDate,
  };
}

// Get detailed usage statistics for a specific user
export async function getUserAiCreditUsage(
  ctx: QueryCtx,
  userId: Id<"users">
): Promise<AiCreditUsageStat[]> {
  // Get all AI credit usage records for the user
  const usageStats = await ctx.db
    .query("aiCreditUsage")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();

  // Group usage by type
  const usageByType = new Map<AiCreditUsageType, number>();
  let totalUsed = 0;

  usageStats.forEach((usage) => {
    const currentAmount = usageByType.get(usage.type) || 0;
    usageByType.set(usage.type, currentAmount + usage.credits);
    totalUsed += usage.credits;
  });

  // Convert to array and calculate percentages
  const usageArray = Array.from(usageByType.entries()).map(([type, used]) => ({
    type,
    used,
    percentage: totalUsed > 0 ? Math.round((used / totalUsed) * 100) : 0,
  }));
  
  return usageArray;
}

// Calculate remaining AI credits for a specific user
export async function getUserRemainingAiCredits(
  ctx: QueryCtx,
  userId: Id<"users">
): Promise<number> {
  // Fetch AI credits directly from the database
  const aiCredits = await ctx.db
    .query("aiCredits")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();

  if (!aiCredits) {
    return DEFAULT_AI_CREDITS;
  }

  // Calculate remaining credits
  const remainingCredits = aiCredits.totalCredits - aiCredits.usedCredits;
  
  // Ensure remaining credits are not negative
  return remainingCredits > 0 ? remainingCredits : 0;
}

/**
 * Update AI credits for a user by incrementing the used credits amount
 * Creates a new record if one doesn't exist yet
 */
export async function updateUserAiCredits(
  ctx: MutationCtx,
  userId: Id<"users">,
  creditsToUse: number
): Promise<AiCreditSummary> {
  // Get the existing credits document for the user
  const aiCredits = await ctx.db
    .query("aiCredits")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();

  
  if (!aiCredits) {
    // Create new credits record if one doesn't exist
    const resetDate = new Date(Date.now() + RESET_DAYS_IN_MILLISECONDS).toISOString();
    await createAiCredits(ctx, userId, DEFAULT_AI_CREDITS, creditsToUse, resetDate);
    
    // Return the newly created credits
    return {
      totalCredits: DEFAULT_AI_CREDITS,
      usedCredits: creditsToUse,
      resetDate
    };
  } else {
    // Update existing credits record
    const newUsedCredits = aiCredits.usedCredits + creditsToUse;
    
    // Update the record in the database
    await ctx.db.patch(aiCredits._id, {
      usedCredits: newUsedCredits
    });
    
    // Return updated credits summary
    return {
      totalCredits: aiCredits.totalCredits,
      usedCredits: newUsedCredits,
      resetDate: aiCredits.resetDate
    };
  }
}

/**
 * Record AI credit usage for tracking and reporting purposes
 */
export async function recordAiCreditUsage(
  ctx: MutationCtx,
  userId: Id<"users">,
  type: AiCreditUsageType,
  credits: number,
  description?: string
): Promise<void> {
  // Insert a new usage record
  await ctx.db.insert("aiCreditUsage", {
    userId,
    type,
    credits,
    timestamp: new Date().toISOString(),
    description
  });
}

/**
 * Use AI credits for a specific action
 * This is a compound function that both updates credit balance and records usage
 */
export async function useAiCredits(
  ctx: MutationCtx,
  userId: Id<"users">,
  type: AiCreditUsageType,
  creditsToUse: number,
  description?: string
): Promise<AiCreditSummary> {
  // First record the usage
  await recordAiCreditUsage(ctx, userId, type, creditsToUse, description);
  
  // Then update the user's credit balance
  return await updateUserAiCredits(ctx, userId, creditsToUse);
}

export async function createAiCredits(
  ctx: MutationCtx,
  userId: Id<"users">,
  totalCredits: number = DEFAULT_AI_CREDITS,
  usedCredits: number = 0,
  resetDate: string = new Date(Date.now() + RESET_DAYS_IN_MILLISECONDS).toISOString()
): Promise<Id<"aiCredits">> {
  return await ctx.db.insert("aiCredits", {
    userId,
    totalCredits,
    usedCredits,
    resetDate
  });
}