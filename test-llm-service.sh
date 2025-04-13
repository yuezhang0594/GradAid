#!/bin/bash

# Test LLM Service Script
echo "Testing LLM Service..."

# Make sure we're in the project root
cd "$(dirname "$0")"

# Install required dependencies if not already installed
if ! npm list dotenv &>/dev/null; then
  echo "Installing dotenv..."
  npm install dotenv @types/dotenv
fi

# Compile TypeScript with proper module settings for CommonJS to avoid ES module issues
echo "Compiling TypeScript..."
npx tsc --esModuleInterop --module CommonJS --moduleResolution node --target ES2020 src/lib/testLlmService.ts

# Run the test
echo "Running test..."
node src/lib/testLlmService.js

echo "Test completed."
