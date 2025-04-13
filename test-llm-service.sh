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

# Compile TypeScript with proper module settings for ES modules
echo "Compiling TypeScript..."
npx tsc --esModuleInterop --module ES2020 --moduleResolution node --target ES2020 src/lib/testLlmService.ts

# Run the test with proper ES module settings
echo "Running test..."
node --experimental-modules src/lib/testLlmService.js

echo "Test completed."
