#!/bin/bash
# Start FastAPI image search service

echo "Starting Image Search API..."

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Load environment variables
if [ -f "../.env" ]; then
    export $(cat ../.env | grep -v '^#' | xargs)
fi

# Start FastAPI server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload


