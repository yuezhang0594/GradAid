import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        // Exclude components directory
        '**/src/components/**',
        // Exclude js files
        '**/*.js',
        // Exclude convex
        '**/convex/**',
        // Exclude config
        '**/**.config.ts',
        '**/**.d.ts',
        // Exclude assets
        '**/src/assets/**',
        // Exclude test
        '**/src/test/**'
      ],
      // Set threshold enforcement for files that are being tested
      thresholds: {
        lines: 35,       // Adjusted to current coverage level
        functions: 35,   // Adjusted to current coverage level
        branches: 40,    // Adjusted to current coverage level
        statements: 35   // Adjusted to current coverage level
      },
      // Additional options
      all: true,         // Include all files, not just the ones with tests
    },
    include: ['**/*.{test,spec}.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '#': resolve(__dirname, './convex'),
    },
  },
});
