import { action } from "./_generated/server";
import { Resend } from "resend";
import { v } from "convex/values";

// Simple in-memory cache (will reset on server restart)
// This reduces API calls when multiple clients request the same data
const cache = {
  domains: { data: null as any, timestamp: 0 },
  apiKeys: { data: null as any, timestamp: 0 }
};

// Cache TTL in milliseconds (2 seconds)
const CACHE_TTL = 2 * 1000;

// Generic function to handle Resend API calls with rate limiting protection
async function callResendApi<T>(
  cacheKey: keyof typeof cache,
  apiCall: (resend: Resend) => Promise<{ data?: T | null; error?: { message: string } | null }>
): Promise<T> {
  try {
    // Check cache first
    const cacheItem = cache[cacheKey];
    const now = Date.now();
    if (cacheItem.data && now - cacheItem.timestamp < CACHE_TTL) {
      return cacheItem.data as T;
    }

    // Create Resend client
    const apiKey = process.env.AUTH_RESEND_KEY;
    if (!apiKey) {
      throw new Error("Resend API key is not configured");
    }
    const resend = new Resend(apiKey);
    
    // Make the API call
    const { data, error } = await apiCall(resend);
    
    if (error) {
      // Special handling for rate limit errors
      if (error.message && error.message.includes("Too many requests")) {
        throw new Error(`Rate limit exceeded: ${error.message}. Using cached data if available.`);
      }
      throw new Error(`Resend API error: ${error.message}`);
    }
    
    // Update cache
    cache[cacheKey] = {
      data: data as any,
      timestamp: now
    };
    
    return data || ([] as unknown as T);
  } catch (error) {
    console.error("Failed to call Resend API:", error);
    
    // Return cached data if available when hitting rate limits
    if (error instanceof Error && error.message.includes("Rate limit exceeded")) {
      const cacheItem = cache[cacheKey];
      if (cacheItem.data) {
        console.log("Returning cached data due to rate limiting");
        return cacheItem.data as T;
      }
    }
    
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}

export const checkApiStatus = action({
  handler: async (ctx) => {
    try {
      const apiKey = process.env.AUTH_RESEND_KEY;
      
      if (!apiKey) {
        console.error("Resend API key not found in environment variables");
        return false;
      }

      // If we have recent cache data, use that to determine status instead of making an API call
      if (cache.domains.data && Date.now() - cache.domains.timestamp < CACHE_TTL) {
        return true;
      }

      const resend = new Resend(apiKey);
      // Only make this call if we don't have cached data
      const domains = await resend.domains.list();
      
      // Update cache
      cache.domains = {
        data: domains.data,
        timestamp: Date.now()
      };
      
      return true;
    } catch (error) {
      console.error("Failed to connect to Resend API:", error);
      return false;
    }
  },
});

export const listDomains = action({
  args: {
    forceRefresh: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    // Clear cache if force refresh is requested
    if (args.forceRefresh) {
      cache.domains.data = null;
    }
    
    return callResendApi('domains', resend => resend.domains.list());
  }
});

export const listApiKeys = action({
  args: {
    forceRefresh: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    // Clear cache if force refresh is requested
    if (args.forceRefresh) {
      cache.apiKeys.data = null;
    }
    
    return callResendApi('apiKeys', resend => resend.apiKeys.list());
  }
});
