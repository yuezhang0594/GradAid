import { action } from "../_generated/server";
import { Resend } from "resend";
import { v } from "convex/values";

// Simple in-memory cache (will reset on server restart)
// This reduces API calls when multiple clients request the same data
const cache = {
  domains: { data: null as any, timestamp: 0 },
  apiKeys: { data: null as any, timestamp: 0 },
};

// Cache TTL in milliseconds (2 seconds)
const CACHE_TTL = 2 * 1000;

/**
 * Generic function to handle Resend API calls with rate limiting protection and caching
 *
 * @template T The expected return type from the API call
 * @param {keyof typeof cache} cacheKey - The cache key to store results under
 * @param {(resend: Resend) => Promise<{ data?: T | null; error?: { message: string } | null }>} apiCall - The function that makes the actual API call
 * @returns {Promise<T>} The API response data
 * @throws {Error} If the API call fails
 */
async function callResendApi<T>(
  cacheKey: keyof typeof cache,
  apiCall: (
    resend: Resend
  ) => Promise<{ data?: T | null; error?: { message: string } | null }>
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
        throw new Error(
          `Rate limit exceeded: ${error.message}. Using cached data if available.`
        );
      }
      throw new Error(`Resend API error: ${error.message}`);
    }

    // Update cache
    cache[cacheKey] = {
      data: data as any,
      timestamp: now,
    };

    return data || ([] as unknown as T);
  } catch (error) {
    console.error("Failed to call Resend API:", error);

    // Return cached data if available when hitting rate limits
    if (
      error instanceof Error &&
      error.message.includes("Rate limit exceeded")
    ) {
      const cacheItem = cache[cacheKey];
      if (cacheItem.data) {
        console.warn("Returning cached data due to rate limiting");
        return cacheItem.data as T;
      }
    }

    throw new Error(error instanceof Error ? error.message : String(error));
  }
}

/**
 * Checks if the Resend API is available and properly configured
 *
 * @returns {Promise<boolean>} True if the API is accessible, false otherwise
 */
export const checkApiStatus = action({
  handler: async (ctx) => {
    try {
      const apiKey = process.env.RESEND_API_KEY;

      if (!apiKey) {
        console.error("Resend API key not found in environment variables");
        return false;
      }

      // If we have recent cache data, use that to determine status instead of making an API call
      if (
        cache.domains.data &&
        Date.now() - cache.domains.timestamp < CACHE_TTL
      ) {
        return true;
      }

      const resend = new Resend(apiKey);
      // Only make this call if we don't have cached data
      const domains = await resend.domains.list();

      // Update cache
      cache.domains = {
        data: domains.data,
        timestamp: Date.now(),
      };

      return true;
    } catch (error) {
      console.error("Failed to connect to Resend API:", error);
      return false;
    }
  },
});

/**
 * Retrieves the list of domains from Resend API
 *
 * @param {Object} args - Function arguments
 * @param {boolean} [args.forceRefresh] - Whether to bypass the cache and force a refresh
 * @returns {Promise<any>} List of domains
 */
export const listDomains = action({
  args: {
    forceRefresh: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Clear cache if force refresh is requested
    if (args.forceRefresh) {
      cache.domains.data = null;
    }

    return callResendApi("domains", (resend) => resend.domains.list());
  },
});

/**
 * Retrieves the list of API keys from Resend API
 *
 * @param {Object} args - Function arguments
 * @param {boolean} [args.forceRefresh] - Whether to bypass the cache and force a refresh
 * @returns {Promise<any>} List of API keys
 */
export const listApiKeys = action({
  args: {
    forceRefresh: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Clear cache if force refresh is requested
    if (args.forceRefresh) {
      cache.apiKeys.data = null;
    }

    return callResendApi("apiKeys", (resend) => resend.apiKeys.list());
  },
});

/**
 * Sends contact form emails to both the user (confirmation) and admin (notification)
 *
 * @param {Object} args - Function arguments
 * @param {string} args.name - Contact's name
 * @param {string} args.email - Contact's email
 * @param {string} args.subject - Message subject
 * @param {string} args.message - Message body
 * @returns {Promise<{success: boolean, userEmailId: string | undefined, adminEmailId: string | undefined}>} Result with email IDs
 * @throws {Error} If email sending fails
 */
export const sendContactEmail = action({
  args: {
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
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
              ${args.message.replace(/\n/g, "<br>")}
            </div>
            <p>Best regards,<br>The GradAid Support Team</p>
          </div>
        `,
      });

      // Send notification to admins
      const adminEmails = [
        "jirissman@gmail.com",
        "quppiet98@gmail.com",
        "nitinkrishna06@gmail.com",
      ];
      for (const email of adminEmails) {
        await resend.emails.send({
          from: "support@gradaid.online",
          to: email,
          subject: `New Contact Form Submission: ${args.subject}`,
          html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>New Contact Form Submission</h2>
            <p><strong>From:</strong> ${args.name} (${args.email})</p>
            <p><strong>Subject:</strong> ${args.subject}</p>
            <p><strong>Message:</strong></p>
            <div style="background-color: #f7f7f9; padding: 15px; border-left: 4px solid #4361ee; margin: 20px 0;">
              ${args.message.replace(/\n/g, "<br>")}
            </div>
          </div>
        `,
        });
      }

      return {
        success: true,
        userEmailId: userConfirmation.data?.id,
      };
    } catch (error) {
      console.error("Failed to send contact form emails:", error);
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  },
});
