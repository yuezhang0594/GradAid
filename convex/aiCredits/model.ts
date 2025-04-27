import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { AiCreditUsageType, DEFAULT_AI_CREDITS, RESET_DAYS_IN_MILLISECONDS } from "../validators";

export interface AiCreditSummary {
  totalCredits: number;
  usedCredits: number;
  resetDate: string;
}

export interface AiCreditUsageStat {
  type: AiCreditUsageType;
  used: number;
  percentage: number;
}

// Get the AI credits for a specific user
/**
 * Retrieves the AI credit summary for a specific user.
 * 
 * This function queries the database for the user's AI credits. If no credit record
 * exists for the user, it returns default values with a reset date set to the default
 * interval from the current time.
 * 
 * @param ctx - The query context used to access the database
 * @param userId - The unique identifier of the user whose credits to retrieve
 * @returns A promise that resolves to an object containing the user's total credits,
 *          used credits, and the date when credits will reset
 */
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
/**
 * Retrieves and aggregates AI credit usage statistics for a specific user.
 * 
 * This function fetches all AI credit usage records for the given user ID,
 * groups them by usage type, calculates the total credits used for each type,
 * and provides percentage information relative to total usage.
 * 
 * @param ctx - The query context for database operations
 * @param userId - The user ID to retrieve AI credit usage for
 * @returns A promise that resolves to an array of AI credit usage statistics,
 *          with each entry containing the usage type, amount of credits used,
 *          and percentage of total usage
 */
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
/**
 * Retrieves the remaining AI credits for a specific user.
 *
 * This function queries the database for the user's AI credits record and calculates
 * how many credits they have left to use. If no record exists for the user, it returns
 * the default allocation of credits.
 *
 * @param ctx - The query context for database operations
 * @param userId - The ID of the user whose credits should be retrieved
 * @returns The number of remaining AI credits (non-negative)
 */
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
/**
 * Updates a user's AI credits by deducting the specified amount.
 * If no credit record exists for the user, it creates a new one with default values.
 * 
 * @param ctx - The mutation context for database operations
 * @param userId - The ID of the user whose credits are being updated
 * @param creditsToUse - The number of credits to deduct from the user's balance
 * 
 * @returns A promise that resolves to an object containing the updated credit information:
 *          totalCredits, usedCredits, and the date when credits will reset
 * 
 * @example
 * // Deduct 5 credits from user with ID "123"
 * const creditSummary = await updateUserAiCredits(ctx, "123", 5);
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
/**
 * Records the usage of AI credits for a specific user.
 *
 * @param ctx - The mutation context used for database operations
 * @param userId - The ID of the user who used the credits
 * @param type - The category or type of AI credit usage
 * @param credits - The number of credits consumed
 * @param description - Optional text describing the specific usage
 * @returns A promise that resolves when the usage record has been created
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
/**
 * Records AI credit usage for a user and updates their credit balance.
 * 
 * @param ctx - The mutation context for the operation
 * @param userId - The ID of the user whose credits are being used
 * @param type - The type of AI credit usage being recorded
 * @param creditsToUse - The number of credits to deduct from the user's balance
 * @param description - Optional description of the credit usage
 * @returns A Promise that resolves to an updated AI credit summary for the user
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

/**
 * Creates a new AI credits record for a user in the database.
 * 
 * @param ctx - The mutation context for database operations
 * @param userId - The ID of the user to assign credits to
 * @param totalCredits - The total number of AI credits to allocate, defaults to DEFAULT_AI_CREDITS
 * @param usedCredits - The initial number of credits marked as used, defaults to 0
 * @param resetDate - ISO date string when credits should reset, defaults to current date plus RESET_DAYS_IN_MILLISECONDS
 * 
 * @returns A Promise resolving to the ID of the newly created AI credits record
 */
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