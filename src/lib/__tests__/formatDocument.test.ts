import { describe, it, expect } from 'vitest';
import { formatDocumentType, formatLastEdited } from '../formatDocument';

describe('formatDocumentType', () => {
  it('should return "Document" for empty input', () => {
    expect(formatDocumentType('')).toBe('Document');
  });

  it('should format "sop" as "Statement of Purpose"', () => {
    expect(formatDocumentType('sop')).toBe('Statement of Purpose');
  });

  it('should format "cv" as "Curriculum Vitae"', () => {
    expect(formatDocumentType('cv')).toBe('Curriculum Vitae');
  });

  it('should format "lor" as "Letter of Recommendation"', () => {
    expect(formatDocumentType('lor')).toBe('Letter of Recommendation');
  });

  it('should format "research_statement" as "Research Statement"', () => {
    expect(formatDocumentType('research_statement')).toBe('Research Statement');
  });

  it('should format "personal_statement" as "Personal Statement"', () => {
    expect(formatDocumentType('personal_statement')).toBe('Personal Statement');
  });

  it('should handle case insensitivity', () => {
    expect(formatDocumentType('SOP')).toBe('Statement of Purpose');
    expect(formatDocumentType('Cv')).toBe('Curriculum Vitae');
  });

  it('should format unknown types by capitalizing and replacing underscores', () => {
    expect(formatDocumentType('writing_sample')).toBe('Writing Sample');
    expect(formatDocumentType('diversity_statement')).toBe('Diversity Statement');
  });

  it('should handle hyphenated document types', () => {
    expect(formatDocumentType('teaching-statement')).toBe('Teaching Statement');
  });
});

describe('formatLastEdited', () => {
  it('should return "Not edited" for undefined input', () => {
    expect(formatLastEdited(undefined)).toBe('Not edited');
  });

  it('should format date string correctly', () => {
    // Create a specific date for testing
    const dateStr = '2023-05-15T14:30:00Z';
    
    // The exact expected output depends on the timezone of the test runner
    // So we'll check that it contains the expected date components
    const result = formatLastEdited(dateStr);
    
    // Check that it contains the date (May 15, 2023)
    expect(result).toContain('May');
    expect(result).toContain('15');
    expect(result).toContain('2023');
    
    // Check that it contains time information
    expect(result).toMatch(/\d{1,2}:\d{2}/); // HH:MM format
    expect(result).toMatch(/[AP]M/); // AM/PM indicator
  });
});
