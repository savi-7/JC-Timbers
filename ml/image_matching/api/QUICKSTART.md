# Quick Start Guide - FastAPI Image Search Service

## Windows Quick Start

### Option 1: Use the Startup Script (Easiest)

1. Open a terminal/command prompt
2. Navigate to this directory:
   ```cmd
   cd ml\image_matching\api
   ```
3. Run the startup script:
   ```cmd
   start_api_improved.bat
   ```
   Or the original script:
   ```cmd
   start_api.bat
   ```

### Option 2: Manual Start

1. Open a terminal/command prompt
2. Navigate to this directory:
   ```cmd
   cd ml\image_matching\api
   ```
3. Install dependencies (if not already installed):
   ```cmd
   pip install -r requirements.txt
   ```
4. Start the server:
   ```cmd
   python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

## Verify It's Running

Once started, you should see:
- Server running on `http://0.0.0.0:8000`
- Model loading messages (CLIP model takes ~30 seconds on first run)
- Pinecone connection status

Test the service:
- Health check: http://localhost:8000/health
- API docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Troubleshooting

### Port Already in Use
If port 8000 is already in use:
- Stop the existing service, or
- Use a different port: `python -m uvicorn main:app --host 0.0.0.0 --port 8001`

### Model Loading Takes Time
- First startup downloads the CLIP model (~500MB) - this is normal
- Subsequent startups are faster (model is cached)

### Pinecone Connection Issues
- Ensure `.env` file exists in `ml/image_matching/` directory
- Check that `PINECONE_API_KEY` is set correctly
- Service will start even without Pinecone, but image search won't work

## Integration

The Node.js server automatically connects to this service at `http://localhost:8000`.
Make sure this FastAPI service is running before using image search in the web app.
