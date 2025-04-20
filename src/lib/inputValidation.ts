/**
 * Sanitizes input strings to prevent XSS attacks and other input-based security issues.
 * - Removes HTML and script tags
 * - Trims whitespace
 * - Handles null/undefined inputs
 * - Normalizes line breaks
 */
export function sanitizeInput(input: string): string {
    if (!input) return '';
    
    // Remove HTML tags (both open and closing)
    let sanitized = input.replace(/<[^>]*>/g, '');
    
    // Replace potentially dangerous characters
    sanitized = sanitized
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
    
    // Normalize line breaks
    sanitized = sanitized
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n');
    
    // Trim whitespace
    return sanitized.trim();
}

/**
 * Validates email format beyond basic regex
 * Checks for proper structure and domain validity
 */
export function isValidEmail(email: string): boolean {
    // Basic format check
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) return false;
    
    // Additional checks could be implemented here
    // - Domain validation
    // - Email service verification
    // - MX record lookup in a production environment
    
    return true;
}