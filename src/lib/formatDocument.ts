/**
 * Formats document type abbreviations and identifiers into readable display names
 * @param type The document type identifier (e.g., "sop", "cv", "lor", "research_statement")
 * @returns Formatted document type name
 */
export function formatDocumentType(type: string): string {
  if (!type) return "Document";

  const lowerType = type.toLowerCase();
  if (lowerType === "sop") {
    return "Statement of Purpose";
  }
  if (lowerType === "cv") {
    return "Curriculum Vitae";
  }
  if (lowerType === "lor") {
    return "Letter of Recommendation";
  }
  if (lowerType === "research_statement") {
    return "Research Statement";
  }
  if (lowerType === "personal_statement") {
    return "Personal Statement";
  }

  // Replace underscores and hyphens with spaces
  const words = type.replace(/[_-]/g, ' ').split(' ');

  // Capitalize first letter of each word
  return words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Formats a date string into a human-readable format
 * @param dateString ISO date string to format
 * @returns Formatted date string or "Not edited" if no date provided
 */
export function formatLastEdited(dateString: string | undefined): string {
  if (!dateString) return "Not edited";

  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(date);
}