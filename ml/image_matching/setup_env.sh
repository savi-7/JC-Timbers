#!/bin/bash
# Setup script for Image Matching Environment

echo "Setting up Image Matching Environment..."

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cat > .env << EOF
# Pinecone Configuration
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_ENVIRONMENT=us-east-1
PINECONE_INDEX_NAME=furniture-images
EOF
    echo "✅ .env file created. Please edit it with your Pinecone credentials."
else
    echo "⚠️  .env file already exists. Skipping creation."
fi

echo ""
echo "Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file and add your PINECONE_API_KEY"
echo "2. Install dependencies: pip install -r requirements.txt"
echo "3. Run the script: python generate_embeddings.py"

