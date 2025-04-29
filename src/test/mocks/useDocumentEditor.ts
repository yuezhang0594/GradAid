import { vi } from 'vitest';

// Mock implementation of the useDocumentEditor hook
export function useDocumentEditor() {
  return {
    document: {
      title: 'Statement of Purpose',
      content: 'This is a test document content',
      lastEdited: new Date().toISOString(),
    },
    isLoading: false,
    saveDocument: vi.fn(),
    generateDocument: vi.fn(),
    universityName: 'Stanford University',
    programName: 'Computer Science',
    programDegree: 'MS',
  };
}
