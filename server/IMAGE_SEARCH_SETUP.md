# Image Search API Setup Guide

This guide explains how to set up and use the AI-based image search functionality.

## Architecture

The image search system consists of two parts:

1. **FastAPI Service** (`ml/image_matching/api/`): Python service that handles CLIP embedding generation and Pinecone queries
2. **Node.js Endpoint** (`server/src/routes/mlRoutes.js`): Express endpoint that accepts image uploads and forwards to FastAPI

## Setup Steps

### 1. Install FastAPI Dependencies

```bash
cd ml/image_matching/api
pip install -r requirements.txt
```

### 2. Install Node.js Dependencies

```bash
cd server
npm install
```

This will install `axios` and `form-data` packages needed for the integration.

### 3. Configure Environment Variables

**For FastAPI service** (`ml/image_matching/.env`):
```env
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=us-east-1
PINECONE_INDEX_NAME=furniture-images
FASTAPI_PORT=8000
```

**For Node.js server** (`server/.env`):
```env
FASTAPI_URL=http://localhost:8000
```

### 4. Start the FastAPI Service

**Terminal 1 - Start FastAPI:**
```bash
cd ml/image_matching/api

# Linux/Mac
./start_api.sh

# Windows
start_api.bat

# Or manually
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The FastAPI service will be available at `http://localhost:8000`

### 5. Start the Node.js Server

**Terminal 2 - Start Express server:**
```bash
cd server
npm run dev
```

The Express server will be available at `http://localhost:5000` (or your configured port)

## API Endpoints

### Node.js Endpoints (Express)

#### 1. Health Check
```bash
GET /api/ml/image-search/health
```

Checks if the FastAPI service is running and ready.

**Response:**
```json
{
  "success": true,
  "service": "Image Search API",
  "status": {
    "status": "healthy",
    "model_loaded": true,
    "pinecone_connected": true
  }
}
```

#### 2. Search by Image File
```bash
POST /api/ml/image-search/by-image
Content-Type: multipart/form-data

Form Data:
  - image: <file>
  - top_k: 5 (optional, default: 5, max: 20)
```

**Example using curl:**
```bash
curl -X POST "http://localhost:5000/api/ml/image-search/by-image" \
  -F "image=@path/to/image.jpg" \
  -F "top_k=5"
```

**Response:**
```json
{
  "success": true,
  "data": {
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
}
```

#### 3. Search by Base64 Image
```bash
POST /api/ml/image-search/by-base64
Content-Type: application/json

{
  "image_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "top_k": 5
}
```

**Example using curl:**
```bash
curl -X POST "http://localhost:5000/api/ml/image-search/by-base64" \
  -H "Content-Type: application/json" \
  -d '{
    "image_base64": "data:image/jpeg;base64,...",
    "top_k": 5
  }'
```

### FastAPI Endpoints (Direct Access)

You can also call the FastAPI service directly:

- **Health**: `GET http://localhost:8000/health`
- **Search by Image**: `POST http://localhost:8000/search-by-image`
- **Search by Base64**: `POST http://localhost:8000/search-by-image-base64`
- **API Docs**: `GET http://localhost:8000/docs` (Swagger UI)

## Frontend Integration Example

### Using Fetch API

```javascript
// Search by file upload
const formData = new FormData();
formData.append('image', fileInput.files[0]);
formData.append('top_k', '5');

const response = await fetch('http://localhost:5000/api/ml/image-search/by-image', {
  method: 'POST',
  body: formData
});

const data = await response.json();
console.log('Similar products:', data.data.results);

// Search by base64
const response2 = await fetch('http://localhost:5000/api/ml/image-search/by-base64', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    image_base64: base64String,
    top_k: 5
  })
});

const data2 = await response2.json();
console.log('Similar products:', data2.data.results);
```

### Using Axios

```javascript
import axios from 'axios';

// Search by file upload
const formData = new FormData();
formData.append('image', fileInput.files[0]);
formData.append('top_k', '5');

const response = await axios.post(
  'http://localhost:5000/api/ml/image-search/by-image',
  formData,
  {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }
);

console.log('Similar products:', response.data.data.results);
```

## Troubleshooting

### FastAPI Service Not Starting

1. Check Python version: `python --version` (needs 3.8+)
2. Verify dependencies: `pip install -r requirements.txt`
3. Check environment variables in `.env` file
4. Ensure Pinecone API key is valid

### Node.js Can't Connect to FastAPI

1. Verify FastAPI is running: `curl http://localhost:8000/health`
2. Check `FASTAPI_URL` in server `.env` file
3. Check firewall/network settings
4. Verify ports aren't conflicting

### Model Loading Errors

1. Ensure internet connection (first run downloads model)
2. Check disk space (model is ~500MB)
3. Verify sentence-transformers version
4. Check logs for specific error messages

### Pinecone Connection Errors

1. Verify API key in environment
2. Check Pinecone dashboard for account status
3. Ensure index name matches configuration
4. Verify index exists in Pinecone

### Slow Response Times

- First request is slower (model loading, ~2-5 seconds)
- Subsequent requests should be faster (~200-500ms)
- Consider using model caching
- Optimize Pinecone index configuration

## Production Considerations

1. **Service Management**: Use process managers (PM2, systemd) for both services
2. **Error Handling**: Implement proper error logging and monitoring
3. **Rate Limiting**: Add rate limiting to prevent abuse
4. **Authentication**: Add API key authentication for production
5. **CORS**: Configure CORS properly for production domains
6. **Scaling**: Consider using multiple FastAPI workers for better performance
7. **Monitoring**: Set up monitoring and alerting for both services

## Next Steps

- Integrate with product catalog to return full product details
- Add caching for frequently searched images
- Implement image preprocessing optimization
- Add user feedback mechanism for search quality
- Create admin dashboard for search analytics


