#!/bin/bash

# Kill any existing Convex dev processes
pkill -f "convex dev" || true

# Clean up build artifacts
rm -rf .convex/out

# Run Convex with TypeScript checking disabled
npx convex dev --typecheck=disable
