# Quick Start: Image Search Feature

## Problem: 503 Service Unavailable Error

If you're seeing a `503 Service Unavailable` error when trying to use the image search feature, it means the FastAPI service is not running.

## Solution: Start the FastAPI Image Search Service

### Step 1: Navigate to the API Directory

```bash
cd ml/image_matching/api
```

### Step 2: Install Python Dependencies

```bash
pip install -r requirements.txt
```

**Required packages:**
- fastapi
- uvicorn
- sentence-transformers
- pinecone-client
- pillow
- python-dotenv

### Step 3: Configure Environment Variables

Create or update `.env` file in `ml/image_matching/` directory:

```env
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_ENVIRONMENT=us-east-1
PINECONE_INDEX_NAME=furniture-images
FASTAPI_PORT=8000
```

**Get Pinecone API Key:**
1. Sign up at https://www.pinecone.io/
2. Create a new project
3. Copy your API key from the dashboard

### Step 4: Generate Embeddings (First Time Only)

Before using image search, you need to generate embeddings for your furniture images:

```bash
cd ml/image_matching
python generate_embeddings.py
```

This will:
- Process all images in `client/src/assets/furniture/`
- Generate CLIP embeddings
- Upload to Pinecone vector database

### Step 5: Start the FastAPI Service

**Option A: Using the startup script**

**Linux/Mac:**
```bash
cd ml/image_matching/api
chmod +x start_api.sh
./start_api.sh
```

**Windows:**
```bash
cd ml/image_matching/api
start_api.bat
```

**Option B: Manual start**
```bash
cd ml/image_matching/api
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Step 6: Verify Service is Running

Open your browser and visit:
- Health check: http://localhost:8000/health
- API docs: http://localhost:8000/docs

You should see:
```json
{
  "status": "healthy",
  "model_loaded": true,
  "pinecone_connected": true
}
```

### Step 7: Configure Node.js Server

Ensure your `server/.env` file has:

```env
FASTAPI_URL=http://localhost:8000
```

### Step 8: Restart Node.js Server

Restart your Express server to pick up the configuration:

```bash
cd server
npm run dev
```

## Troubleshooting

### Error: "PINECONE_API_KEY not found"

- Check that `.env` file exists in `ml/image_matching/`
- Verify the API key is correct
- Ensure no extra spaces or quotes around the key

### Error: "Model loading failed"

- Ensure internet connection (first run downloads ~500MB model)
- Check disk space availability
- Verify sentence-transformers is installed: `pip install sentence-transformers`

### Error: "Pinecone connection failed"

- Verify API key is valid in Pinecone dashboard
- Check index name matches configuration
- Ensure index exists in Pinecone (create it if needed)

### Error: "No images found"

- Verify images exist in `client/src/assets/furniture/`
- Run `generate_embeddings.py` to process images
- Check file permissions

### Service starts but returns 503

- Verify FastAPI is running on port 8000
- Check `FASTAPI_URL` in server `.env` matches FastAPI port
- Ensure no firewall blocking port 8000
- Check FastAPI logs for errors

## Running Both Services

You need **two terminals** running:

**Terminal 1 - FastAPI Service:**
```bash
cd ml/image_matching/api
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 - Node.js Server:**
```bash
cd server
npm run dev
```

**Terminal 3 - React Client (if not already running):**
```bash
cd client
npm run dev
```

## Production Deployment

For production, consider:

1. **Use process managers:**
   - PM2 for Node.js
   - Gunicorn with Uvicorn workers for FastAPI

2. **Environment variables:**
   - Set `FASTAPI_URL` to production URL
   - Use secure API keys

3. **CORS configuration:**
   - Update CORS settings in `ml/image_matching/api/main.py`

4. **Monitoring:**
   - Set up health check endpoints
   - Add logging and error tracking

## Need Help?

- Check `ml/image_matching/api/README.md` for detailed API documentation
- Check `server/IMAGE_SEARCH_SETUP.md` for integration details
- Review browser console for specific error messages


