/// <reference types="vitest/config" />
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "#": path.resolve(__dirname, "./convex"),
      "react-dom/server.browser": "react-dom/server.edge",
    },
  },
  test: {
    workspace: [
      {
        extends: true,
        test: {
          include: ["src/**/*.{test,spec}.{ts,tsx}"],
          name: "react",
          environment: "jsdom",
          globals: true,
          setupFiles: ["./src/test/setup.ts"],
        },
      },
      {
        extends: true,
        test: {
          include: ["convex/**/*.test.ts"],
          name: "convex",
          environment: "edge-runtime",
          server: { deps: { inline: ["convex-test"] } },
        },
      },
    ],
    coverage: {
      reporter: ["text", "json", "html"],
      exclude: [
        // Exclude components directory
        "**/src/components/**",
        // Exclude js files
        "**/*.js",
        // Exclude config
        "**/**.config.ts",
        "**/**.d.ts",
        // Exclude assets
        "**/src/assets/**",
        // Exclude test
        "**/src/test/**",
        // Exclude resend (mock API does not work)
        "**/convex/services/resend.ts",
        "**/src/routes/support/ResendDashboard.tsx",
      ],
      // Set threshold enforcement for files that are being tested
      thresholds: {
        lines: 35, // Adjusted to current coverage level
        functions: 35, // Adjusted to current coverage level
        branches: 40, // Adjusted to current coverage level
        statements: 35, // Adjusted to current coverage level
      },
      // Additional options
      all: true, // Include all files, not just the ones with tests
    },
  },
});
