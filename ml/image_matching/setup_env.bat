@echo off
REM Setup script for Image Matching Environment (Windows)

echo Setting up Image Matching Environment...

REM Create .env file if it doesn't exist
if not exist .env (
    echo Creating .env file from template...
    (
        echo # Pinecone Configuration
        echo PINECONE_API_KEY=your_pinecone_api_key_here
        echo PINECONE_ENVIRONMENT=us-east-1
        echo PINECONE_INDEX_NAME=furniture-images
    ) > .env
    echo .env file created. Please edit it with your Pinecone credentials.
) else (
    echo .env file already exists. Skipping creation.
)

echo.
echo Setup complete!
echo.
echo Next steps:
echo 1. Edit .env file and add your PINECONE_API_KEY
echo 2. Install dependencies: pip install -r requirements.txt
echo 3. Run the script: python generate_embeddings.py

pause


