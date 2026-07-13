"""
FastAPI service for image-based product search
Accepts image uploads, generates CLIP embeddings, and queries Pinecone
"""

import os
import sys
from pathlib import Path
from typing import List, Optional
import logging
from io import BytesIO

from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from PIL import Image
import numpy as np
from sentence_transformers import SentenceTransformer, util as st_utils
from pinecone import Pinecone
from dotenv import load_dotenv
from contextlib import asynccontextmanager

# Load environment variables first (from parent directory and current directory)
parent_env_path = Path(__file__).parent.parent / '.env'
current_env_path = Path(__file__).parent / '.env'

# Try loading from current directory first, then parent directory
if current_env_path.exists():
    load_dotenv(dotenv_path=current_env_path, override=True)
    print(f"Loaded .env from: {current_env_path}")
elif parent_env_path.exists():
    load_dotenv(dotenv_path=parent_env_path, override=True)
    print(f"Loaded .env from: {parent_env_path}")
else:
    load_dotenv()  # Fallback to default .env loading

# Add parent directory to path for config import
sys.path.append(str(Path(__file__).parent.parent))
from config import (
    PINECONE_API_KEY,
    PINECONE_ENVIRONMENT,
    PINECONE_INDEX_NAME,
    CLIP_MODEL_NAME,
    MAX_IMAGE_SIZE
)

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

 # Global model and Pinecone index (loaded on startup)
model: Optional[SentenceTransformer] = None
pinecone_index = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events"""
    # Startup
    global model, pinecone_index
    
    try:
        logger.info(f"Loading CLIP model: {CLIP_MODEL_NAME}")
        model = SentenceTransformer(CLIP_MODEL_NAME)
        logger.info("CLIP model loaded successfully")
        logger.info(f"Model embedding dimension: {model.get_sentence_embedding_dimension()}")
        
        # Initialize Pinecone
        if not PINECONE_API_KEY:
            logger.warning("PINECONE_API_KEY not found in environment variables. Pinecone features will be disabled.")
            logger.warning("To enable Pinecone, set PINECONE_API_KEY in .env file")
            pinecone_index = None
        else:
            try:
                logger.info("Initializing Pinecone client...")
                pc = Pinecone(api_key=PINECONE_API_KEY)
                pinecone_index = pc.Index(PINECONE_INDEX_NAME)
                logger.info(f"Connected to Pinecone index: {PINECONE_INDEX_NAME}")
            except Exception as pinecone_error:
                logger.error(f"Failed to connect to Pinecone: {pinecone_error}")
                logger.warning("Service will start but image search will not work until Pinecone is configured")
                pinecone_index = None
        
    except Exception as e:
        logger.error(f"Error during startup: {e}")
        # Don't raise - allow service to start even if model loading fails
        # This allows health checks to work
        logger.warning("Service starting in degraded mode. Some features may not work.")
    
    yield
    
    # Shutdown
    logger.info("Shutting down image search service...")


# Initialize FastAPI app
app = FastAPI(
    title="Image Search API",
    description="AI-based product image matching using CLIP and Pinecone",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# High-level furniture type definitions for classification + filtering
FURNITURE_TYPES = {
    "bed": ["bed", "bunk", "cot", "king", "queen", "single", "double", "mattress", "headboard"],
    "chair": ["chair", "armchair", "stool", "seat", "seating", "recliner"],
    "sofa": [
        "sofa", "couch", "lounger", "settee", "divan",
        "seater", "2 seater", "3 seater", "l shape", "l-shaped", "sectional",
        "sofa set", "sofa cum bed", "sofa bed"
    ],
    "table": ["table", "desk", "coffee", "dining", "side", "console", "end"],
    "bookshelf": ["bookshelf", "bookcase", "shelf", "shelving", "rack"],
    "wardrobe": ["wardrobe", "closet", "cupboard", "cabinet", "almirah"],
    "dining": ["dining", "dinner", "dining table", "dining set"],
    "study": ["study", "office", "work", "workstation", "computer"]
}

# Sofa gets multiple prompts so the model predicts "sofa" more reliably for sofa images
FURNITURE_TYPE_PROMPTS = {
    "bed": "a photo of a bed",
    "chair": "a photo of a chair",
    "sofa": "a photo of a sofa",  # Primary; sofa also boosted in predict_furniture_type
    "table": "a photo of a table",
    "bookshelf": "a photo of a bookshelf",
    "wardrobe": "a photo of a wardrobe",
    "dining": "a photo of a dining table",
    "study": "a photo of a study table"
}
SOFA_PROMPTS = [
    "a photo of a sofa",
    "a photo of a couch",
    "a photo of a two seater sofa",
    "a photo of a three seater sofa",
    "a photo of a living room sofa",
]


class SearchResult(BaseModel):
    """Model for search result"""
    id: str
    score: float
    filename: str
    filepath: Optional[str] = None
    image_size: Optional[str] = None
    category: Optional[str] = None
    product_id: Optional[str] = None  # For products added via admin
    product_name: Optional[str] = None  # For products added via admin


class SearchResponse(BaseModel):
    """Model for search response"""
    query_image: str
    results: List[SearchResult]
    total_results: int
    top_k: int
    message: Optional[str] = None  # e.g. "not_furniture" when upload is door/plastic/non-catalog




@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "Image Search API",
        "version": "1.0.0",
        "model_loaded": model is not None,
        "pinecone_connected": pinecone_index is not None
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    status = "healthy" if model is not None else "degraded"
    return {
        "status": status,
        "model_loaded": model is not None,
        "pinecone_connected": pinecone_index is not None,
        "model_name": CLIP_MODEL_NAME if model else None,
        "index_name": PINECONE_INDEX_NAME if pinecone_index else None,
        "message": "Service is running" if model else "Model not loaded - check logs"
    }


class AddProductRequest(BaseModel):
    """Request model for adding product to Pinecone"""
    product_id: str
    product_name: str
    category: str
    subcategory: Optional[str] = None
    images: List[dict]  # List of {data, filename, contentType}


@app.post("/add-product")
async def add_product_to_search(request: AddProductRequest):
    """
    Add a product's images to Pinecone for image search
    Called automatically when a new product is created
    """
    if model is None or pinecone_index is None:
        raise HTTPException(
            status_code=503,
            detail="Service not ready. Model or Pinecone not initialized."
        )
    
    # Only process furniture products
    if request.category != 'furniture':
        return {
            "success": True,
            "message": f"Product category '{request.category}' not indexed for image search",
            "embeddings_added": 0
        }
    
    if not request.images or len(request.images) == 0:
        return {
            "success": True,
            "message": "No images provided",
            "embeddings_added": 0
        }
    
    try:
        import base64
        from PIL import Image
        from io import BytesIO
        
        vectors_to_upsert = []
        added_count = 0
        
        # Process each image using the same preprocessing as search-by-image for consistent embeddings
        for idx, image_obj in enumerate(request.images):
            try:
                image_data = image_obj.get('data', '')
                if not image_data:
                    continue
                
                # Decode base64 image
                if ',' in image_data:
                    image_data = image_data.split(',')[1]
                
                image_bytes = base64.b64decode(image_data)
                image = preprocess_image(image_bytes)  # Same pipeline as search so same image => same embedding
                
                # Generate embedding
                embedding = model.encode(image, convert_to_numpy=True)
                
                # Create metadata
                filename = image_obj.get('filename', f'product_{request.product_id}_img_{idx}.jpg')
                metadata = {
                    "filename": filename,
                    "category": request.category,
                    "subcategory": request.subcategory or "",
                    "product_id": str(request.product_id),
                    "product_name": request.product_name,
                    "image_index": idx
                }
                
                # Create unique vector ID
                vector_id = f"product_{request.product_id}_img_{idx}_{hash(filename)}"
                
                vectors_to_upsert.append({
                    "id": vector_id,
                    "values": embedding.tolist(),
                    "metadata": metadata
                })
                
                added_count += 1
                
            except Exception as e:
                logger.error(f"Error processing image {idx} for product {request.product_id}: {e}")
                continue
        
        # Upsert to Pinecone
        if vectors_to_upsert:
            pinecone_index.upsert(vectors=vectors_to_upsert)
            logger.info(f"✅ Added {added_count} image embeddings for product {request.product_id} ({request.product_name})")
        
        return {
            "success": True,
            "message": f"Added {added_count} image embeddings to Pinecone",
            "embeddings_added": added_count
        }
        
    except Exception as e:
        logger.error(f"Error adding product to Pinecone: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error adding product to search index: {str(e)}"
        )


def preprocess_image(image_bytes: bytes) -> Image.Image:
    """Preprocess image for CLIP model"""
    try:
        if not image_bytes or len(image_bytes) == 0:
            raise ValueError("Empty image bytes")
        
        # Load image from bytes
        image = Image.open(BytesIO(image_bytes))
        
        # Convert to RGB if necessary (handles RGBA, P, etc.)
        if image.mode != 'RGB':
            logger.info(f"Converting image from {image.mode} to RGB")
            image = image.convert("RGB")
        
        # Verify image is valid (this will raise an exception if image is corrupted)
        # Note: verify() closes the image, so we need to reopen it
        try:
            image.verify()
        except Exception as verify_error:
            logger.error(f"Image verification failed: {verify_error}")
            raise ValueError(f"Invalid or corrupted image: {verify_error}")
        
        # Reopen after verify (verify closes the image)
        image = Image.open(BytesIO(image_bytes))
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert("RGB")
        
        # Resize to model input size
        image = image.resize(MAX_IMAGE_SIZE, Image.Resampling.LANCZOS)
        
        # Ensure image is fully loaded (not lazy-loaded) to avoid file handle issues on Windows
        image.load()
        
        logger.debug(f"Image preprocessed: size={image.size}, mode={image.mode}")
        return image
    except Exception as e:
        logger.error(f"Error preprocessing image: {e}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=400, detail=f"Invalid image file: {str(e)}")


def generate_embedding(image: Image.Image) -> np.ndarray:
    """
    Generate CLIP embedding for the uploaded image
    
    This function takes the image that the user uploaded and converts it
    into a 512-dimensional vector (embedding) that represents the visual
    features of the image. This embedding is then used to find similar images.
    """
    try:
        import numpy as np
        
        # Validate image before encoding
        if image is None:
            raise ValueError("Image is None")
        
        if not hasattr(image, 'size'):
            raise ValueError("Invalid image object - missing size attribute")
        
        logger.debug(f"Starting embedding generation for image: mode={image.mode}, size={image.size}")
        
        # CRITICAL FIX FOR WINDOWS: Use BytesIO to completely detach from file handles
        # This is the most reliable method to avoid [Errno 22] Invalid argument
        from io import BytesIO
        
        try:
            # Method 1: Save to BytesIO and reload (completely detaches from any file handles)
            buffer = BytesIO()
            # Ensure image is in RGB mode before saving
            if image.mode != 'RGB':
                image = image.convert('RGB')
            image.save(buffer, format='PNG')
            buffer.seek(0)
            
            # Reload from buffer - this creates a completely new image with no file references
            clean_image = Image.open(buffer)
            clean_image = clean_image.convert('RGB')
            clean_image.load()
            
            # Close the buffer
            buffer.close()
            
            logger.debug(f"Image reloaded from BytesIO: mode={clean_image.mode}, size={clean_image.size}")
            
            # Now encode using the completely clean image
            embedding = model.encode(clean_image, convert_to_numpy=True, show_progress_bar=False)
            
        except Exception as encode_error:
            logger.error(f"Error during BytesIO method: {encode_error}")
            # Fallback Method 2: Convert to numpy array and back
            logger.warning("Trying numpy array conversion method...")
            try:
                # Get pixel data as numpy array
                img_array = np.array(image, dtype=np.uint8, copy=True)
                
                if img_array.size == 0:
                    raise ValueError("Image array is empty")
                
                if len(img_array.shape) != 3 or img_array.shape[2] != 3:
                    raise ValueError(f"Invalid image array shape: {img_array.shape}")
                
                # Create fresh PIL Image from array
                clean_image = Image.fromarray(img_array, 'RGB')
                clean_image.load()
                
                # Try encoding
                embedding = model.encode(clean_image, convert_to_numpy=True, show_progress_bar=False)
                
            except Exception as numpy_error:
                logger.error(f"Numpy method also failed: {numpy_error}")
                # Last resort: try direct encoding
                logger.warning("Trying direct encoding as last resort...")
                try:
                    if image.mode != 'RGB':
                        image = image.convert('RGB')
                    image.load()
                    embedding = model.encode(image, convert_to_numpy=True, show_progress_bar=False)
                except Exception as final_error:
                    logger.error(f"All methods failed. Final error: {final_error}")
                    raise encode_error  # Raise the original error
        
        if embedding is None:
            raise ValueError("Embedding generation returned None")
        
        # Ensure embedding is a proper numpy array
        if not isinstance(embedding, np.ndarray):
            embedding = np.array(embedding)
        
        if len(embedding) == 0:
            raise ValueError("Embedding generation returned empty result")
        
        logger.debug(f"✅ Embedding generated successfully: shape={embedding.shape}, dtype={embedding.dtype}")
        return embedding
        
    except Exception as e:
        logger.error(f"❌ Error generating embedding: {e}")
        logger.error(f"Image info: mode={image.mode if image else 'None'}, size={image.size if image and hasattr(image, 'size') else 'N/A'}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error generating embedding: {str(e)}")


def is_furniture_image(image_embedding: np.ndarray) -> bool:
    """
    Check if the uploaded image is actually furniture (not just wood/timber/construction materials).
    Uses CLIP to compare against furniture vs non-furniture prompts.
    
    Returns True if the image is confidently identified as furniture.
    """
    try:
        if model is None:
            return False
        
        # Prompts to distinguish furniture from other wood products
        furniture_prompts = [
            "a photo of furniture",
            "a photo of a piece of furniture",
            "a photo of home furniture",
            "a photo of indoor furniture"
        ]
        
        non_furniture_prompts = [
            "a photo of raw wood",
            "a photo of timber",
            "a photo of construction materials",
            "a photo of lumber",
            "a photo of wooden planks",
            "a photo of building materials",
            "a photo of wood panels",
            "a photo of a door",
            "a photo of a wooden door",
            "a photo of a window",
            "a photo of a glass window",
            "a photo of plastic chair",
            "a photo of plastic furniture",
            "a photo of outdoor plastic furniture",
        ]
        
        # Encode all prompts
        all_prompts = furniture_prompts + non_furniture_prompts
        text_embeddings = model.encode(all_prompts, convert_to_numpy=True)
        
        # Compute similarities
        image_vec = image_embedding / (np.linalg.norm(image_embedding) + 1e-8)
        text_vecs = text_embeddings / (np.linalg.norm(text_embeddings, axis=1, keepdims=True) + 1e-8)
        similarities = np.dot(text_vecs, image_vec)
        
        # Get best furniture and non-furniture scores
        furniture_scores = similarities[:len(furniture_prompts)]
        non_furniture_scores = similarities[len(furniture_prompts):]
        
        best_furniture_score = float(np.max(furniture_scores))
        best_non_furniture_score = float(np.max(non_furniture_scores))
        
        logger.info(
            f"Furniture check: furniture_score={best_furniture_score:.3f}, "
            f"non_furniture_score={best_non_furniture_score:.3f}"
        )
        
        # Reject only when non-furniture (door/window/plastic/timber) wins by a clear margin
        MIN_FURNITURE_SCORE = 0.20
        margin = 0.05  # Only reject if non_furniture is clearly ahead (avoids rejecting catalog furniture)
        clearly_non_furniture = best_non_furniture_score > (best_furniture_score + margin)
        is_furniture = (
            not clearly_non_furniture
            and best_furniture_score >= MIN_FURNITURE_SCORE
        )
        
        if not is_furniture:
            logger.warning(
                f"Image does not appear to be furniture. "
                f"Furniture score ({best_furniture_score:.3f}) vs non_furniture ({best_non_furniture_score:.3f})"
            )
        
        return is_furniture
        
    except Exception as e:
        logger.error(f"Error checking if image is furniture: {e}")
        return False


def predict_furniture_type(image_embedding: np.ndarray) -> Optional[str]:
    """
    Predict high-level furniture type (bed, chair, sofa, bookshelf, etc.)
    using CLIP text prompts and cosine similarity.
    Sofa uses multiple prompts for better accuracy (two seater, couch, etc.).
    """
    try:
        if model is None:
            logger.warning("Model not loaded, cannot predict furniture type.")
            return None

        type_names = list(FURNITURE_TYPE_PROMPTS.keys())
        prompts = [FURNITURE_TYPE_PROMPTS[t] for t in type_names]
        text_embeddings = model.encode(prompts, convert_to_numpy=True)

        image_vec = image_embedding / (np.linalg.norm(image_embedding) + 1e-8)
        text_vecs = text_embeddings / (np.linalg.norm(text_embeddings, axis=1, keepdims=True) + 1e-8)
        similarities = np.dot(text_vecs, image_vec)

        # Boost sofa: take best score over multiple sofa-specific prompts
        sofa_embeddings = model.encode(SOFA_PROMPTS, convert_to_numpy=True)
        sofa_vecs = sofa_embeddings / (np.linalg.norm(sofa_embeddings, axis=1, keepdims=True) + 1e-8)
        sofa_scores = np.dot(sofa_vecs, image_vec)
        best_sofa_score = float(np.max(sofa_scores))
        sofa_idx = type_names.index("sofa")
        similarities[sofa_idx] = max(similarities[sofa_idx], best_sofa_score)

        best_idx = int(np.argmax(similarities))
        best_score = float(similarities[best_idx])
        best_type = type_names[best_idx]

        logger.info(
            f"Predicted furniture type from image: {best_type} "
            f"(score={best_score:.3f})"
        )

        MIN_TYPE_SIMILARITY = 0.26
        if best_score < MIN_TYPE_SIMILARITY:
            logger.warning(
                f"Furniture type prediction not confident enough "
                f"(best={best_type}, score={best_score:.3f} < {MIN_TYPE_SIMILARITY})"
            )
            return None

        return best_type

    except Exception as e:
        logger.error(f"Error predicting furniture type: {e}")
        return None


@app.post("/search-by-image", response_model=SearchResponse)
async def search_by_image(
    file: UploadFile = File(..., description="Image file to search"),
    top_k: int = Form(5, ge=1, le=20, description="Number of similar images to return")
):
    """
    Search for similar furniture images using CLIP embeddings and Pinecone
    
    Args:
        file: Image file to search (jpg, png, webp)
        top_k: Number of similar images to return (1-20)
    
    Returns:
        List of similar images with similarity scores
    """
    if model is None:
        raise HTTPException(
            status_code=503,
            detail="CLIP model not loaded. Please check server logs."
        )
    
    if pinecone_index is None:
        raise HTTPException(
            status_code=503,
            detail="Pinecone not configured. Please set PINECONE_API_KEY in .env file and ensure embeddings are generated."
        )
    
    # Validate file type
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=400,
            detail="File must be an image (jpg, png, webp)"
        )
    
    try:
        # Read image file
        image_bytes = await file.read()
        
        if len(image_bytes) == 0:
            raise HTTPException(status_code=400, detail="Empty image file")
        
        # Preprocess image
        logger.info(f"📸 Processing uploaded image: {file.filename} ({len(image_bytes)} bytes)")
        
        # CRITICAL: Create image from bytes multiple times to ensure clean state
        # This helps avoid Windows file handle issues
        image = preprocess_image(image_bytes)
        logger.info(f"✅ Image preprocessed successfully: {image.size[0]}x{image.size[1]} pixels")
        
        # Force a complete reload by recreating from bytes one more time
        # This ensures no lingering file handles
        try:
            from io import BytesIO
            import numpy as np
            # Convert current image to bytes and back to ensure it's completely clean
            img_bytes_io = BytesIO()
            image.save(img_bytes_io, format='PNG')
            img_bytes_io.seek(0)
            # Reload from the bytes
            clean_image = Image.open(img_bytes_io).convert('RGB')
            clean_image.load()
            image = clean_image
            logger.debug("Image reloaded from bytes to ensure clean state")
        except Exception as reload_error:
            logger.warning(f"Could not reload image (non-critical): {reload_error}")
            # Continue with original image
        
        # Generate embedding from the uploaded image
        logger.info("🤖 Generating CLIP embedding from uploaded image...")
        embedding = generate_embedding(image)
        logger.info(f"✅ Embedding generated: {len(embedding)} dimensions from YOUR uploaded image")

        # --- STEP 1: Always query Pinecone first (so same/catalog image always gets results) ---
        query_top_k = min(top_k * 3, 50)
        logger.info(f"🔍 Querying Pinecone for top {query_top_k} similar images...")
        query_results = pinecone_index.query(
            vector=embedding.tolist(),
            top_k=query_top_k,
            include_metadata=True
        )
        matches = query_results.get("matches", [])
        logger.info(f"✅ Found {len(matches)} candidate matches")

        best_score = float(matches[0].get("score", 0.0)) if matches else 0.0

        # --- STEP 2: Same-image path: if best match is very high = same or near-same catalog image ---
        SAME_IMAGE_THRESHOLD = 0.76  # Same or very close image from your site
        SAME_IMAGE_MIN_MATCH = 0.58   # Include all furniture above this when in same-image path

        if best_score >= SAME_IMAGE_THRESHOLD:
            logger.info(f"📌 Same-image path: best score {best_score:.3f} >= {SAME_IMAGE_THRESHOLD} — returning catalog matches (no furniture/type filter)")
            results = []
            for match in matches:
                similarity_score = float(match.get("score", 0.0))
                if similarity_score < SAME_IMAGE_MIN_MATCH:
                    continue
                metadata = match.get("metadata", {}) or {}
                category = (metadata.get("category") or "").lower()
                if category and category != "furniture":
                    continue
                results.append(SearchResult(
                    id=match.get("id", ""),
                    score=similarity_score,
                    filename=metadata.get("filename", ""),
                    filepath=metadata.get("filepath"),
                    image_size=metadata.get("image_size"),
                    category=metadata.get("category", "furniture"),
                    product_id=metadata.get("product_id"),
                    product_name=metadata.get("product_name"),
                ))
            results.sort(key=lambda x: x.score, reverse=True)
            results = results[:top_k]
            logger.info(f"✅ Returning {len(results)} results (same-image path)")
            return SearchResponse(query_image=file.filename, results=results, total_results=len(results), top_k=top_k)

        # --- STEP 3: Not same image — apply furniture gate (reject door, window, plastic) ---
        is_furniture = is_furniture_image(embedding)
        if not is_furniture:
            logger.info("🛑 Not furniture (door/window/plastic/timber). Returning no results.")
            return SearchResponse(
                query_image=file.filename,
                results=[],
                total_results=0,
                top_k=top_k,
                message="not_furniture"
            )

        # --- STEP 4: Furniture but not same image — filter by type and similarity ---
        predicted_type = predict_furniture_type(embedding)
        if predicted_type:
            logger.info(f"🎯 Predicted furniture type: {predicted_type}")
        MIN_SIMILARITY_THRESHOLD = 0.62

        results = []
        for match in matches:
            similarity_score = float(match.get("score", 0.0))
            if similarity_score < MIN_SIMILARITY_THRESHOLD:
                continue
            metadata = match.get("metadata", {}) or {}
            category = (metadata.get("category") or "").lower()
            if category and category != "furniture":
                continue
            filename = (metadata.get("filename") or "").lower()
            filepath = (metadata.get("filepath") or "").lower()
            product_name = (metadata.get("product_name") or "").lower()
            subcategory = (metadata.get("subcategory") or "").lower()

            if predicted_type:
                type_keywords = FURNITURE_TYPES.get(predicted_type, [])
                matches_type = any(
                    kw in filename or kw in filepath or kw in product_name or kw in subcategory
                    for kw in type_keywords
                )
                if not matches_type and similarity_score < 0.66:
                    continue
            results.append(SearchResult(
                id=match.get("id", ""),
                score=similarity_score,
                filename=metadata.get("filename", ""),
                filepath=metadata.get("filepath"),
                image_size=metadata.get("image_size"),
                category=metadata.get("category", "furniture"),
                product_id=metadata.get("product_id"),
                product_name=metadata.get("product_name"),
            ))
        results.sort(key=lambda x: x.score, reverse=True)
        results = results[:top_k]
        logger.info(f"✅ Found {len(results)} similar images (threshold: {MIN_SIMILARITY_THRESHOLD})")
        
        if len(results) == 0 and len(matches) > 0:
            logger.warning(f"⚠️ No results after filtering. {len(matches)} candidates found but all filtered out.")
            logger.warning(f"   Threshold: {MIN_SIMILARITY_THRESHOLD}, Predicted type: {predicted_type}, Is furniture: {is_furniture}")
            top_candidates = sorted(matches, key=lambda x: x.get("score", 0), reverse=True)[:5]
            for i, candidate in enumerate(top_candidates, 1):
                cand_meta = candidate.get('metadata', {})
                logger.warning(
                    f"   Candidate {i}: score={candidate.get('score', 0):.3f}, "
                    f"category={cand_meta.get('category', 'N/A')}, "
                    f"product_id={cand_meta.get('product_id', 'N/A')}, "
                    f"product_name={cand_meta.get('product_name', 'N/A')}, "
                    f"filename={cand_meta.get('filename', 'N/A')}"
                )
        
        return SearchResponse(
            query_image=file.filename,
            results=results,
            total_results=len(results),
            top_k=top_k
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in search_by_image: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@app.post("/search-by-image-base64")
async def search_by_image_base64(
    image_base64: str = Form(..., description="Base64 encoded image"),
    top_k: int = Form(5, ge=1, le=20, description="Number of similar images to return")
):
    """
    Search for similar furniture images using base64 encoded image
    
    Args:
        image_base64: Base64 encoded image string (with or without data URL prefix)
        top_k: Number of similar images to return (1-20)
    
    Returns:
        List of similar images with similarity scores
    """
    if model is None:
        raise HTTPException(
            status_code=503,
            detail="CLIP model not loaded. Please check server logs."
        )
    
    if pinecone_index is None:
        raise HTTPException(
            status_code=503,
            detail="Pinecone not configured. Please set PINECONE_API_KEY in .env file and ensure embeddings are generated."
        )
    
    try:
        # Decode base64 image
        import base64
        
        # Remove data URL prefix if present
        if ',' in image_base64:
            image_base64 = image_base64.split(',')[1]
        
        # Decode base64
        image_bytes = base64.b64decode(image_base64)
        
        if len(image_bytes) == 0:
            raise HTTPException(status_code=400, detail="Empty image data")
        
        # Preprocess image
        logger.info(f"Processing base64 image ({len(image_bytes)} bytes)")
        image = preprocess_image(image_bytes)
        
        # Generate embedding
        logger.info("Generating CLIP embedding...")
        embedding = generate_embedding(image)
        
        # Query Pinecone first (same logic as search-by-image)
        query_top_k = min(top_k * 3, 50)
        query_results = pinecone_index.query(
            vector=embedding.tolist(),
            top_k=query_top_k,
            include_metadata=True
        )
        b64_matches = query_results.get("matches", [])
        b64_best = float(b64_matches[0].get("score", 0.0)) if b64_matches else 0.0

        if b64_best >= 0.76:
            # Same-image path: return catalog matches without furniture gate
            results = []
            for match in b64_matches:
                sc = float(match.get("score", 0.0))
                if sc < 0.58:
                    continue
                meta = match.get("metadata", {}) or {}
                if meta.get("category", "").lower() not in ("", "furniture"):
                    continue
                results.append(SearchResult(
                    id=match.get("id", ""),
                    score=sc,
                    filename=meta.get("filename", ""),
                    filepath=meta.get("filepath"),
                    image_size=meta.get("image_size"),
                    category=meta.get("category", "furniture"),
                    product_id=meta.get("product_id"),
                    product_name=meta.get("product_name"),
                ))
            results.sort(key=lambda x: x.score, reverse=True)
            results = results[:top_k]
            return SearchResponse(query_image="base64_image", results=results, total_results=len(results), top_k=top_k)

        if not is_furniture_image(embedding):
            return SearchResponse(
                query_image="base64_image",
                results=[],
                total_results=0,
                top_k=top_k,
                message="not_furniture"
            )
        
        MIN_SIMILARITY_THRESHOLD = 0.62
        results = []
        for match in b64_matches:
            sc = float(match.get("score", 0.0))
            if sc < MIN_SIMILARITY_THRESHOLD:
                continue
            meta = match.get("metadata", {}) or {}
            if meta.get("category", "").lower() not in ("", "furniture"):
                continue
            results.append(SearchResult(
                id=match.get("id", ""),
                score=sc,
                filename=meta.get("filename", ""),
                filepath=meta.get("filepath"),
                image_size=meta.get("image_size"),
                category=meta.get("category", "furniture"),
                product_id=meta.get("product_id"),
                product_name=meta.get("product_name"),
            ))
        results.sort(key=lambda x: x.score, reverse=True)
        results = results[:top_k]
        return SearchResponse(query_image="base64_image", results=results, total_results=len(results), top_k=top_k)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in search_by_image_base64: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("FASTAPI_PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )

