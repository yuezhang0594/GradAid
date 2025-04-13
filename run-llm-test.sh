#!/bin/bash

# Script to run the LLM test with real Convex data
echo "=== Running LLM Test with Real Convex Data ==="

# Ensure the JavaScript file can be executed
echo "Installing dependencies..."
npm install --no-save dotenv fs-extra convex

# Set up environment
echo "Setting up environment..."
export PYTHONPATH=$PYTHONPATH:$(pwd):$(pwd)/llm-service

# Run the test script
echo "Running test script..."
node test-llm-with-convex.js

# Check the exit code
TEST_EXIT_CODE=$?
if [ $TEST_EXIT_CODE -ne 0 ]; then
  echo "Test failed with exit code $TEST_EXIT_CODE"
  exit $TEST_EXIT_CODE
fi

echo "Test completed successfully. Check the 'generated_documents' directory for the results."
