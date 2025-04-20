/**
 * Sanitizes input strings to prevent XSS attacks
 * Removes HTML tags, trims whitespace, and handles empty strings
 */
export function sanitizeInput(input: string): string {
    if (!input) return '';
    // Remove HTML tags and trim whitespace
    return input.replace(/<[^>]*>/g, '').trim();
}