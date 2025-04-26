import { action } from "../_generated/server";
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
    const apiKey = process.env.RESEND_API_KEY;
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
      const apiKey = process.env.RESEND_API_KEY;
      
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

export const sendContactEmail = action({
  args: {
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string()
  },
  handler: async (ctx, args) => {
    try {
      const apiKey = process.env.RESEND_API_KEY;
      if (!apiKey) {
        throw new Error("Resend API key is not configured");
      }
      
      const resend = new Resend(apiKey);
      
      // Send confirmation email to the user
      const userConfirmation = await resend.emails.send({
        from: "support@gradaid.online",
        to: args.email,
        subject: "We've received your message - GradAid Support",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Thank you for contacting GradAid!</h2>
            <p>Hello ${args.name},</p>
            <p>We've received your message about "${args.subject}" and will get back to you as soon as possible.</p>
            <p>For your records, here's a copy of your message:</p>
            <div style="background-color: #f7f7f9; padding: 15px; border-left: 4px solid #4361ee; margin: 20px 0;">
              ${args.message.replace(/\n/g, '<br>')}
            </div>
            <p>Best regards,<br>The GradAid Support Team</p>
          </div>
        `
      });
      
      // Send notification to admin
      const adminNotification = await resend.emails.send({
        from: "support@gradaid.online",
        to: "jrissman@gmail.com",
        subject: `New Contact Form Submission: ${args.subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>New Contact Form Submission</h2>
            <p><strong>From:</strong> ${args.name} (${args.email})</p>
            <p><strong>Subject:</strong> ${args.subject}</p>
            <p><strong>Message:</strong></p>
            <div style="background-color: #f7f7f9; padding: 15px; border-left: 4px solid #4361ee; margin: 20px 0;">
              ${args.message.replace(/\n/g, '<br>')}
            </div>
          </div>
        `
      });
      
      return { 
        success: true,
        userEmailId: userConfirmation.data?.id,
        adminEmailId: adminNotification.data?.id
      };
    } catch (error) {
      console.error("Failed to send contact form emails:", error);
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }
});
