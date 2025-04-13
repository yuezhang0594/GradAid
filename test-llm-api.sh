#!/bin/bash

# Test LLM API Script
echo "Testing LLM API Integration..."

# Make sure we're in the project root
cd "$(dirname "$0")"

# Install required dependencies if not already installed
if ! npm list dotenv &>/dev/null; then
  echo "Installing dotenv..."
  npm install dotenv @types/dotenv
fi

# Set environment variables from .env file if it exists
if [ -f .env ]; then
  echo "Loading environment variables from .env file..."
  export $(grep -v '^#' .env | xargs)
fi

# Compile TypeScript with proper module settings
echo "Compiling TypeScript..."
npx tsc --esModuleInterop --module CommonJS --moduleResolution node --target ES2020 src/api/testLlmService.ts

# Run the test
echo "Running test..."
node src/api/testLlmService.js

echo "Test completed."
