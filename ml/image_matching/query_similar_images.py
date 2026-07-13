"""
Query script to find similar furniture images using Pinecone
Example usage after embeddings have been generated
"""

import os
import sys
from pathlib import Path
from PIL import Image
from sentence_transformers import SentenceTransformer
from pinecone import Pinecone
from dotenv import load_dotenv
import logging

from config import (
    PINECONE_API_KEY,
    PINECONE_INDEX_NAME,
    CLIP_MODEL_NAME,
    MAX_IMAGE_SIZE
)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()


def query_similar_images(query_image_path: str, top_k: int = 5):
    """
    Query Pinecone to find similar images
    
    Args:
        query_image_path: Path to the query image
        top_k: Number of similar images to return
        
    Returns:
        List of similar images with scores and metadata
    """
    try:
        # Load CLIP model
        logger.info(f"Loading CLIP model: {CLIP_MODEL_NAME}")
        model = SentenceTransformer(CLIP_MODEL_NAME)
        
        # Initialize Pinecone
        if not PINECONE_API_KEY:
            raise ValueError("PINECONE_API_KEY not found in environment variables")
        
        pc = Pinecone(api_key=PINECONE_API_KEY)
        index = pc.Index(PINECONE_INDEX_NAME)
        
        # Load and preprocess query image
        logger.info(f"Loading query image: {query_image_path}")
        query_image = Image.open(query_image_path).convert("RGB")
        query_image = query_image.resize(MAX_IMAGE_SIZE, Image.Resampling.LANCZOS)
        
        # Generate embedding
        logger.info("Generating embedding for query image...")
        query_embedding = model.encode(query_image, convert_to_numpy=True)
        
        # Query Pinecone
        logger.info(f"Querying Pinecone for top {top_k} similar images...")
        results = index.query(
            vector=query_embedding.tolist(),
            top_k=top_k,
            include_metadata=True
        )
        
        # Display results
        print("\n" + "=" * 60)
        print(f"Query Image: {query_image_path}")
        print("=" * 60)
        print(f"\nFound {len(results['matches'])} similar images:\n")
        
        for i, match in enumerate(results['matches'], 1):
            print(f"{i}. Similarity Score: {match['score']:.4f}")
            print(f"   Image: {match['metadata']['filename']}")
            print(f"   Path: {match['metadata'].get('filepath', 'N/A')}")
            print(f"   Size: {match['metadata'].get('image_size', 'N/A')}")
            print()
        
        return results['matches']
        
    except Exception as e:
        logger.error(f"Error querying similar images: {e}")
        raise


def main():
    """Main function"""
    if len(sys.argv) < 2:
        print("Usage: python query_similar_images.py <path_to_query_image> [top_k]")
        print("\nExample:")
        print("  python query_similar_images.py ../client/src/assets/furniture/bed.jpg 5")
        sys.exit(1)
    
    query_image_path = sys.argv[1]
    top_k = int(sys.argv[2]) if len(sys.argv) > 2 else 5
    
    if not Path(query_image_path).exists():
        logger.error(f"Query image not found: {query_image_path}")
        sys.exit(1)
    
    try:
        query_similar_images(query_image_path, top_k)
    except Exception as e:
        logger.error(f"Failed to query similar images: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()


