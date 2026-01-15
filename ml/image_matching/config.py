"""
Configuration file for Image Matching System
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Get the directory where this config file is located
CONFIG_DIR = Path(__file__).parent

# Load environment variables from .env file in the same directory as this config
env_path = CONFIG_DIR / ".env"
load_dotenv(dotenv_path=env_path)

# Project paths
PROJECT_ROOT = Path(__file__).parent.parent.parent
FURNITURE_IMAGES_PATH = PROJECT_ROOT / "client" / "src" / "assets" / "furniture"

# Pinecone configuration
# Fallback API key if not found in environment
DEFAULT_PINECONE_API_KEY = "pcsk_5vqSYr_PVt1Pzu4HNi9BwqpJuvsGNiCUBKZyQJnoVWNAzeax7QMcXgcBC3zgFaS6eAYn3b"
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY", DEFAULT_PINECONE_API_KEY)
PINECONE_ENVIRONMENT = os.getenv("PINECONE_ENVIRONMENT", "us-east-1")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "furniture-images")

# CLIP Model configuration
# Options for sentence-transformers:
# - "clip-ViT-B-32" (faster, 512 dimensions)
# - "clip-ViT-L-14" (better accuracy, 768 dimensions - CURRENT)
# Alternative: Use transformers library directly with "openai/clip-vit-base-patch32"
CLIP_MODEL_NAME = "clip-ViT-L-14"  # Using sentence-transformers CLIP wrapper

# Image processing configuration
SUPPORTED_IMAGE_FORMATS = [".jpg", ".jpeg", ".png", ".webp"]
MAX_IMAGE_SIZE = (224, 224)  # Standard CLIP input size

# Metadata configuration
METADATA_FIELDS = ["filename", "category", "filepath", "image_size"]

