import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect method with methods from react-testing-library
expect.extend(matchers as any);

// Mock fetch globally
global.fetch = vi.fn();

// Mock path aliases
vi.mock('#/validators', () => {
  return {
    AI_CREDITS_FOR_SOP: 50,
    AI_CREDITS_FOR_LOR: 30,
    DEFAULT_AI_CREDITS: 500,
    LOADING_INDICATOR_DELAY: 500,
    RESET_TIME_IN_DAYS: 30,
    RESET_DAYS_IN_MILLISECONDS: 30 * 24 * 60 * 60 * 1000,
    MAX_LOR: 5,
    SEARCH_UNIVERSITY_LIMIT: 10
  };
});

// Clean up after each test case (e.g., clearing jsdom)
afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});
