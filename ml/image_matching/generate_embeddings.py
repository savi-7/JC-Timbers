"""
AI-Based Product Image Matching for Furniture Segment
Generates CLIP embeddings for furniture product images and stores them in Pinecone vector database.
"""

import os
import sys
from pathlib import Path
from typing import List, Dict, Any
import json
from PIL import Image
import numpy as np
from sentence_transformers import SentenceTransformer
from pinecone import Pinecone, ServerlessSpec
import logging
from tqdm import tqdm

# Import configuration
from config import (
    FURNITURE_IMAGES_PATH,
    PINECONE_API_KEY,
    PINECONE_ENVIRONMENT,
    PINECONE_INDEX_NAME,
    CLIP_MODEL_NAME,
    SUPPORTED_IMAGE_FORMATS,
    MAX_IMAGE_SIZE,
    METADATA_FIELDS
)

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class FurnitureImageEmbedder:
    """Class to handle image embedding generation and Pinecone storage"""
    
    def __init__(self):
        """Initialize the embedder with CLIP model and Pinecone client"""
        logger.info(f"Loading CLIP model: {CLIP_MODEL_NAME}")
        try:
            # Load CLIP model using sentence-transformers
            # sentence-transformers supports CLIP models like "clip-ViT-B-32" or "clip-ViT-L-14"
            # If using OpenAI CLIP directly, you may need transformers library
            self.model = SentenceTransformer(CLIP_MODEL_NAME)
            logger.info("CLIP model loaded successfully")
            logger.info(f"Model embedding dimension: {self.model.get_sentence_embedding_dimension()}")
        except Exception as e:
            logger.error(f"Error loading CLIP model: {e}")
            logger.error("Note: If using OpenAI CLIP, ensure transformers library is installed")
            logger.error("Alternative: Try 'openai/clip-vit-base-patch32' with transformers library")
            raise
        
        # Initialize Pinecone client
        if not PINECONE_API_KEY:
            raise ValueError("PINECONE_API_KEY not found in environment variables")
        
        logger.info("Initializing Pinecone client...")
        self.pc = Pinecone(api_key=PINECONE_API_KEY)
        
        # Create or connect to index
        self.index = self._setup_pinecone_index()
        
    def _setup_pinecone_index(self):
        """Setup or connect to Pinecone index"""
        try:
            # Get embedding dimension from model first
            # For CLIP models, get_sentence_embedding_dimension() may return None
            # So we encode a dummy image to get the dimension
            try:
                embedding_dimension = self.model.get_sentence_embedding_dimension()
                if embedding_dimension is None:
                    # Create a dummy image to get dimension
                    dummy_image = Image.new('RGB', MAX_IMAGE_SIZE, color='white')
                    dummy_embedding = self.model.encode(dummy_image, convert_to_numpy=True)
                    embedding_dimension = len(dummy_embedding)
                    logger.info(f"Got embedding dimension from dummy image: {embedding_dimension}")
                else:
                    logger.info(f"Got embedding dimension from model: {embedding_dimension}")
            except Exception as e:
                logger.warning(f"Could not get dimension from model method, using default: {e}")
                # CLIP-ViT-L-14 default dimension is 768
                embedding_dimension = 768
            
            # Check if index exists
            existing_indexes = [idx.name for idx in self.pc.list_indexes()]
            
            if PINECONE_INDEX_NAME not in existing_indexes:
                logger.info(f"Creating new Pinecone index: {PINECONE_INDEX_NAME}")
                # Create index
                self.pc.create_index(
                    name=PINECONE_INDEX_NAME,
                    dimension=embedding_dimension,
                    metric="cosine",
                    spec=ServerlessSpec(
                        cloud="aws",
                        region=PINECONE_ENVIRONMENT if PINECONE_ENVIRONMENT else "us-east-1"
                    )
                )
                logger.info(f"Index '{PINECONE_INDEX_NAME}' created successfully with dimension {embedding_dimension}")
            else:
                # Check if existing index has correct dimension
                try:
                    index_stats = self.pc.describe_index(PINECONE_INDEX_NAME)
                    # Get dimension from index stats (structure may vary by Pinecone version)
                    existing_dimension = getattr(index_stats, 'dimension', None)
                    if existing_dimension is None:
                        # Try accessing as dict-like if it's a different structure
                        existing_dimension = index_stats.get('dimension') if hasattr(index_stats, 'get') else None
                    
                    if existing_dimension and existing_dimension != embedding_dimension:
                        logger.warning(f"Existing index has dimension {existing_dimension}, but model requires {embedding_dimension}")
                        logger.warning(f"Deleting old index '{PINECONE_INDEX_NAME}' to recreate with correct dimension...")
                        self.pc.delete_index(PINECONE_INDEX_NAME)
                        logger.info("Old index deleted. Creating new index...")
                        self.pc.create_index(
                            name=PINECONE_INDEX_NAME,
                            dimension=embedding_dimension,
                            metric="cosine",
                            spec=ServerlessSpec(
                                cloud="aws",
                                region=PINECONE_ENVIRONMENT if PINECONE_ENVIRONMENT else "us-east-1"
                            )
                        )
                        logger.info(f"New index '{PINECONE_INDEX_NAME}' created with dimension {embedding_dimension}")
                    else:
                        logger.info(f"Connecting to existing index: {PINECONE_INDEX_NAME} (dimension: {embedding_dimension})")
                except Exception as e:
                    logger.warning(f"Could not verify index dimension: {e}")
                    logger.info(f"Connecting to existing index: {PINECONE_INDEX_NAME}")
                    # Will fail later if dimension mismatch, but at least we tried
            
            # Connect to index
            return self.pc.Index(PINECONE_INDEX_NAME)
            
        except Exception as e:
            logger.error(f"Error setting up Pinecone index: {e}")
            raise
    
    def _load_image(self, image_path: Path) -> Image.Image:
        """Load and preprocess image"""
        try:
            image = Image.open(image_path).convert("RGB")
            # Resize to model input size
            image = image.resize(MAX_IMAGE_SIZE, Image.Resampling.LANCZOS)
            return image
        except Exception as e:
            logger.error(f"Error loading image {image_path}: {e}")
            raise
    
    def _generate_embedding(self, image: Image.Image) -> np.ndarray:
        """Generate embedding for a single image using CLIP"""
        try:
            # CLIP model expects images as numpy arrays or PIL Images
            # sentence-transformers handles the conversion
            embedding = self.model.encode(image, convert_to_numpy=True)
            return embedding
        except Exception as e:
            logger.error(f"Error generating embedding: {e}")
            raise
    
    def _get_image_files(self) -> List[Path]:
        """Get all supported image files from furniture directory"""
        if not FURNITURE_IMAGES_PATH.exists():
            raise FileNotFoundError(
                f"Furniture images directory not found: {FURNITURE_IMAGES_PATH}"
            )
        
        image_files = []
        for ext in SUPPORTED_IMAGE_FORMATS:
            image_files.extend(FURNITURE_IMAGES_PATH.glob(f"*{ext}"))
            image_files.extend(FURNITURE_IMAGES_PATH.glob(f"*{ext.upper()}"))
        
        # Filter out directories (some files might not have extensions)
        image_files = [f for f in image_files if f.is_file()]
        
        logger.info(f"Found {len(image_files)} image files")
        return image_files
    
    def _create_metadata(self, image_path: Path, image: Image.Image) -> Dict[str, Any]:
        """Create metadata dictionary for Pinecone"""
        return {
            "filename": image_path.name,
            "category": "furniture",
            "filepath": str(image_path.relative_to(FURNITURE_IMAGES_PATH.parent.parent.parent)),
            "image_size": f"{image.size[0]}x{image.size[1]}"
        }
    
    def process_images(self, batch_size: int = 32) -> Dict[str, Any]:
        """
        Process all furniture images and upload to Pinecone
        
        Args:
            batch_size: Number of images to process in each batch
            
        Returns:
            Dictionary with processing statistics
        """
        image_files = self._get_image_files()
        
        if not image_files:
            logger.warning("No images found to process")
            return {"processed": 0, "failed": 0, "skipped": 0}
        
        processed_count = 0
        failed_count = 0
        skipped_count = 0
        
        # Process images in batches
        for i in tqdm(range(0, len(image_files), batch_size), desc="Processing batches"):
            batch_files = image_files[i:i + batch_size]
            vectors_to_upsert = []
            
            for image_path in batch_files:
                try:
                    # Load image
                    image = self._load_image(image_path)
                    
                    # Generate embedding
                    embedding = self._generate_embedding(image)
                    
                    # Create metadata
                    metadata = self._create_metadata(image_path, image)
                    
                    # Create unique ID (using filename + hash of path)
                    vector_id = f"furniture_{image_path.stem}_{hash(str(image_path))}"
                    
                    # Prepare vector for upsert
                    vectors_to_upsert.append({
                        "id": vector_id,
                        "values": embedding.tolist(),
                        "metadata": metadata
                    })
                    
                    processed_count += 1
                    
                except Exception as e:
                    logger.error(f"Failed to process {image_path}: {e}")
                    failed_count += 1
                    continue
            
            # Upsert batch to Pinecone
            if vectors_to_upsert:
                try:
                    self.index.upsert(vectors=vectors_to_upsert)
                    logger.info(f"Upserted batch of {len(vectors_to_upsert)} vectors")
                except Exception as e:
                    logger.error(f"Error upserting batch to Pinecone: {e}")
                    failed_count += len(vectors_to_upsert)
                    processed_count -= len(vectors_to_upsert)
        
        stats = {
            "processed": processed_count,
            "failed": failed_count,
            "skipped": skipped_count,
            "total_images": len(image_files)
        }
        
        logger.info(f"Processing complete. Stats: {stats}")
        return stats
    
    def get_index_stats(self) -> Dict[str, Any]:
        """Get statistics about the Pinecone index"""
        try:
            stats = self.index.describe_index_stats()
            return stats
        except Exception as e:
            logger.error(f"Error getting index stats: {e}")
            return {}


def main():
    """Main function to run the embedding generation"""
    try:
        logger.info("=" * 60)
        logger.info("Furniture Image Embedding Generation")
        logger.info("=" * 60)
        
        # Initialize embedder
        embedder = FurnitureImageEmbedder()
        
        # Process images
        logger.info("Starting image processing...")
        stats = embedder.process_images(batch_size=32)
        
        # Display results
        logger.info("=" * 60)
        logger.info("Processing Results:")
        logger.info(f"  Total images found: {stats['total_images']}")
        logger.info(f"  Successfully processed: {stats['processed']}")
        logger.info(f"  Failed: {stats['failed']}")
        logger.info(f"  Skipped: {stats['skipped']}")
        
        # Get index stats
        logger.info("\nPinecone Index Statistics:")
        index_stats = embedder.get_index_stats()
        logger.info(f"  Total vectors: {index_stats.get('total_vector_count', 'N/A')}")
        logger.info(f"  Index dimension: {index_stats.get('dimension', 'N/A')}")
        
        logger.info("=" * 60)
        logger.info("✅ Process completed successfully!")
        
    except Exception as e:
        logger.error(f"❌ Error in main execution: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()

