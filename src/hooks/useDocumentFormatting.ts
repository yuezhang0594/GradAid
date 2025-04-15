import { useMemo } from 'react';

export function useDocumentFormatting() {
  const formatDocumentType = useMemo(() => (type: string) => {
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

    // Replace underscores and hyphens with spaces
    const words = type.replace(/[_-]/g, ' ').split(' ');

    // Capitalize first letter of each word
    return words
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }, []);

  const formatLastEdited = useMemo(() => (dateString: string | undefined) => {
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
  }, []);

  return {
    formatDocumentType,
    formatLastEdited
  };
}
