"""
Service to add a single product's image embedding to Pinecone
Called automatically when a new product is created or updated
"""

import os
import sys
from pathlib import Path
import base64
import logging
from io import BytesIO
from PIL import Image
import numpy as np
from sentence_transformers import SentenceTransformer
from pinecone import Pinecone
from dotenv import load_dotenv

# Load environment variables
env_path = Path(__file__).parent.parent / '.env'
if env_path.exists():
    load_dotenv(env_path)
else:
    load_dotenv()

# Add parent directory to path for config import
sys.path.append(str(Path(__file__).parent.parent))
from config import (
    PINECONE_API_KEY,
    PINECONE_INDEX_NAME,
    CLIP_MODEL_NAME,
    MAX_IMAGE_SIZE
)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global model (loaded once)
_model = None

def get_model():
    """Get or load CLIP model (singleton)"""
    global _model
    if _model is None:
        logger.info(f"Loading CLIP model: {CLIP_MODEL_NAME}")
        _model = SentenceTransformer(CLIP_MODEL_NAME)
        logger.info("CLIP model loaded")
    return _model

def decode_base64_image(base64_string):
    """Decode base64 image string to PIL Image"""
    try:
        # Remove data URL prefix if present
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]
        
        # Decode base64
        image_bytes = base64.b64decode(base64_string)
        image = Image.open(BytesIO(image_bytes)).convert("RGB")
        image = image.resize(MAX_IMAGE_SIZE, Image.Resampling.LANCZOS)
        return image
    except Exception as e:
        logger.error(f"Error decoding base64 image: {e}")
        raise

def generate_embedding_for_image(image_data):
    """Generate CLIP embedding for a product image"""
    try:
        model = get_model()
        
        # Decode base64 image
        image = decode_base64_image(image_data)
        
        # Generate embedding
        embedding = model.encode(image, convert_to_numpy=True)
        return embedding
    except Exception as e:
        logger.error(f"Error generating embedding: {e}")
        raise

def add_product_to_pinecone(product_id, product_name, category, subcategory, images):
    """
    Add a product's images to Pinecone for image search
    
    Args:
        product_id: Product ID from database
        product_name: Product name
        category: Product category (furniture, timber, construction)
        subcategory: Product subcategory
        images: List of image objects with {data, filename, contentType}
    
    Returns:
        Number of embeddings successfully added
    """
    if not PINECONE_API_KEY:
        logger.warning("PINECONE_API_KEY not set, skipping Pinecone update")
        return 0
    
    if category != 'furniture':
        logger.info(f"Product category is '{category}', skipping (only furniture products are indexed)")
        return 0
    
    if not images or len(images) == 0:
        logger.info(f"No images for product {product_id}, skipping")
        return 0
    
    try:
        # Initialize Pinecone
        pc = Pinecone(api_key=PINECONE_API_KEY)
        index = pc.Index(PINECONE_INDEX_NAME)
        
        vectors_to_upsert = []
        added_count = 0
        
        # Process each image
        for idx, image_obj in enumerate(images):
            try:
                image_data = image_obj.get('data', '')
                if not image_data:
                    continue
                
                # Generate embedding
                embedding = generate_embedding_for_image(image_data)
                
                # Create metadata
                filename = image_obj.get('filename', f'product_{product_id}_img_{idx}.jpg')
                metadata = {
                    "filename": filename,
                    "category": category,
                    "subcategory": subcategory or "",
                    "product_id": str(product_id),
                    "product_name": product_name,
                    "image_index": idx
                }
                
                # Create unique vector ID
                vector_id = f"product_{product_id}_img_{idx}_{hash(filename)}"
                
                vectors_to_upsert.append({
                    "id": vector_id,
                    "values": embedding.tolist(),
                    "metadata": metadata
                })
                
                added_count += 1
                
            except Exception as e:
                logger.error(f"Error processing image {idx} for product {product_id}: {e}")
                continue
        
        # Upsert to Pinecone
        if vectors_to_upsert:
            index.upsert(vectors=vectors_to_upsert)
            logger.info(f"✅ Added {added_count} image embeddings for product {product_id} ({product_name})")
        
        return added_count
        
    except Exception as e:
        logger.error(f"Error adding product to Pinecone: {e}")
        return 0

def remove_product_from_pinecone(product_id):
    """Remove all embeddings for a product from Pinecone"""
    if not PINECONE_API_KEY:
        return
    
    try:
        pc = Pinecone(api_key=PINECONE_API_KEY)
        index = pc.Index(PINECONE_INDEX_NAME)
        
        # Query to find all vectors for this product
        # Note: Pinecone doesn't support querying by metadata directly in delete
        # So we need to track vector IDs or use a different approach
        # For now, we'll use a pattern-based deletion
        # This is a limitation - we'd need to store vector IDs in the database
        
        logger.info(f"⚠️ Product deletion from Pinecone requires vector ID tracking")
        logger.info(f"   Product {product_id} embeddings may remain in Pinecone")
        logger.info(f"   Consider running generate_embeddings.py to rebuild index")
        
    except Exception as e:
        logger.error(f"Error removing product from Pinecone: {e}")

if __name__ == "__main__":
    # Test function
    test_image_data = "data:image/jpeg;base64,/9j/4AAQSkZJRg..."  # Example
    embedding = generate_embedding_for_image(test_image_data)
    print(f"Test embedding generated: {len(embedding)} dimensions")

