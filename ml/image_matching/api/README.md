# Image Search API

FastAPI service for AI-based product image matching using CLIP embeddings and Pinecone vector database.

## Features

- **CLIP-based Image Embeddings**: Uses OpenAI's CLIP model for robust image understanding
- **Pinecone Integration**: Fast similarity search using vector database
- **Two Input Methods**: 
  - File upload (multipart/form-data)
  - Base64 encoded image
- **RESTful API**: Clean FastAPI endpoints with automatic documentation
- **Health Checks**: Monitor service status

## Setup

### 1. Install Dependencies

```bash
cd ml/image_matching/api
pip install -r requirements.txt
```

### 2. Configure Environment

Ensure you have a `.env` file in the parent directory (`ml/image_matching/.env`) with:

```env
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=us-east-1
PINECONE_INDEX_NAME=furniture-images
FASTAPI_PORT=8000
```

### 3. Start the Service

**Linux/Mac:**
```bash
chmod +x start_api.sh
./start_api.sh
```

**Windows:**
```bash
start_api.bat
```

**Or manually:**
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Health Check

```bash
GET /health
```

Returns service status and configuration.

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "pinecone_connected": true,
  "model_name": "clip-ViT-B-32",
  "index_name": "furniture-images"
}
```

### Search by Image File

```bash
POST /search-by-image
Content-Type: multipart/form-data

file: <image_file>
top_k: 5 (optional, default: 5, max: 20)
```

**Example using curl:**
```bash
curl -X POST "http://localhost:8000/search-by-image" \
  -F "file=@path/to/image.jpg" \
  -F "top_k=5"
```

**Response:**
```json
{
  "query_image": "image.jpg",
  "results": [
    {
      "id": "furniture_bed_123456",
      "score": 0.9234,
      "filename": "bed.jpg",
      "filepath": "client/src/assets/furniture/bed.jpg",
      "image_size": "224x224",
      "category": "furniture"
    }
  ],
  "total_results": 5,
  "top_k": 5
}
```

### Search by Base64 Image

```bash
POST /search-by-image-base64
Content-Type: application/x-www-form-urlencoded

image_base64: <base64_encoded_image>
top_k: 5 (optional, default: 5, max: 20)
```

**Example using curl:**
```bash
curl -X POST "http://localhost:8000/search-by-image-base64" \
  -F "image_base64=data:image/jpeg;base64,/9j/4AAQSkZJRg..." \
  -F "top_k=5"
```

## API Documentation

FastAPI provides automatic interactive documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Integration with Node.js Server

The Node.js Express server can call this FastAPI service:

```javascript
// Example: POST /api/ml/image-search/by-image
// The Node.js endpoint handles file upload and forwards to FastAPI
```

See `server/src/controllers/imageSearchController.js` for integration details.

## Error Handling

The API returns appropriate HTTP status codes:

- `200`: Success
- `400`: Bad request (invalid image, missing parameters)
- `500`: Internal server error
- `503`: Service unavailable (model not loaded, Pinecone not connected)

## Performance

- **Model Loading**: ~2-5 seconds on first request (model cached in memory)
- **Embedding Generation**: ~100-300ms per image
- **Pinecone Query**: ~50-200ms depending on index size
- **Total Response Time**: ~200-500ms (after model is loaded)

## Production Considerations

1. **CORS**: Update CORS settings in `main.py` for production
2. **Authentication**: Add API key authentication if needed
3. **Rate Limiting**: Implement rate limiting for production
4. **Error Logging**: Set up proper logging infrastructure
5. **Monitoring**: Add monitoring and alerting
6. **Scaling**: Use process managers (gunicorn, uvicorn workers) for production

## Troubleshooting

### Service Won't Start

- Check Python version (3.8+ required)
- Verify all dependencies are installed
- Check environment variables are set correctly
- Ensure Pinecone API key is valid

### Model Loading Errors

- Ensure internet connection (first run downloads model)
- Check disk space (model is ~500MB)
- Verify sentence-transformers version

### Pinecone Connection Errors

- Verify API key in environment
- Check Pinecone dashboard for account status
- Ensure index name matches

### Slow Response Times

- First request is slower (model loading)
- Consider using model caching
- Optimize Pinecone index configuration
- Use GPU if available (modify model loading)

