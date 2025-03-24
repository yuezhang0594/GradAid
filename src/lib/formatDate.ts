/**
 * Formats a date string into a localized format (e.g., "Jan 1, 2023").
 * 
 * This function handles several cases:
 * - If the input is undefined or empty, returns "N/A"
 * - If the input has a year, returns the formatted date
 * - If the input doesn't specify a year, assumes the next occurrence of that date
 *   (current year if the date hasn't passed yet, next year if it has)
 * 
 * @param dateStr - The date string to format or undefined
 * @returns A formatted date string in "MMM D, YYYY" format (e.g., "Jan 1, 2023") or "N/A" if input is invalid
 * 
 * @example
 * // Returns "Jan 1, 2023"
 * formatDate("2023-01-01")
 * 
 * @example
 * // Returns "N/A"
 * formatDate(undefined)
 * 
 * @example
 * // Returns the next occurrence of April 15 (this year or next)
 * formatDate("04-15")
 */
export default function formatDate (dateStr: string | undefined): string {
    // If dateStr is undefined or empty, return 'N/A'
    if (!dateStr) return 'N/A';

    const date = new Date(dateStr);

    // Check if the dateStr includes a year specification
    const hasYear = /\d{4}/.test(dateStr);

    // If no year is specified, set it to the next occurrence
    if (!hasYear) {
        const today = new Date();
        const currentYear = today.getFullYear();

        // Set the date to this year
        date.setFullYear(currentYear);

        // If this date has already passed this year, set to next year
        if (date < today) {
            date.setFullYear(currentYear + 1);
        }
    }

    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};