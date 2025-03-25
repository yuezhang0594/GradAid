import { query } from "./../_generated/server";
import { getCurrentUserIdOrThrow } from "../users";

export const getAiCredits = query({
  handler: async (ctx) => {
    const userId = await getCurrentUserIdOrThrow(ctx);

    // Get AI credits for the user
    const aiCredits = await ctx.db
      .query("aiCredits")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (!aiCredits) {
      return {
        totalCredits: 500, // Default values if no record exists
        usedCredits: 0,
        resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      };
    }

    return {
      totalCredits: aiCredits.totalCredits,
      usedCredits: aiCredits.usedCredits,
      resetDate: aiCredits.resetDate,
    };
  },
});

export const getAiCreditUsage = query({
  handler: async (ctx) => {
    const userId = await getCurrentUserIdOrThrow(ctx);

    // Get all AI credit usage records for the user
    const usageStats = await ctx.db
      .query("aiCreditUsage")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    // Group usage by type
    const usageByType = new Map<string, number>();
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

    // If no usage records exist, return default values
    if (usageArray.length === 0) {
      return [
        {
          type: "Document Review",
          used: 100,
          percentage: 40,
        },
        {
          type: "Essay Feedback",
          used: 75,
          percentage: 30,
        },
        {
          type: "Research Help",
          used: 50,
          percentage: 20,
        },
        {
          type: "Other",
          used: 25,
          percentage: 10,
        },
      ];
    }

    return usageArray;
  },
});
