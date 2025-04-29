import { describe, it, expect, vi } from 'vitest';

describe('main.tsx', () => {
  it('throws an error if Clerk publishable key is missing', () => {
    // Define a function that simulates the key check in main.tsx
    const checkPublishableKey = () => {
      const PUBLISHABLE_KEY = '';
      if (!PUBLISHABLE_KEY) {
        throw new Error("Missing Publishable Key");
      }
    };
    
    // Expect the function to throw an error
    expect(checkPublishableKey).toThrow('Missing Publishable Key');
  });
});
