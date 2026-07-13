# AI-Based Product Image Matching for Furniture Segment

This module implements an AI-powered image matching system for furniture products using CLIP (Contrastive Language-Image Pre-training) model and Pinecone vector database.

## Overview

The system generates high-dimensional embeddings for furniture product images using the CLIP model from OpenAI, which understands both visual and textual content. These embeddings are stored in Pinecone, a vector database that enables fast similarity search for product matching.

## Features

- **CLIP-based Image Embeddings**: Uses OpenAI's CLIP model via sentence-transformers for robust image understanding
- **Pinecone Integration**: Stores embeddings in Pinecone for scalable similarity search
- **Batch Processing**: Efficiently processes multiple images in batches
- **Metadata Storage**: Stores image metadata (filename, category, filepath) alongside embeddings
- **Error Handling**: Comprehensive error handling and logging

## Prerequisites

- Python 3.8 or higher
- Pinecone account and API key
- Furniture product images in `client/src/assets/furniture/` directory

## Installation

1. **Navigate to the image_matching directory:**
   ```bash
   cd ml/image_matching
   ```

2. **Create a virtual environment (recommended):**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Pinecone credentials:
   ```env
   PINECONE_API_KEY=your_pinecone_api_key_here
   PINECONE_ENVIRONMENT=us-east-1
   PINECONE_INDEX_NAME=furniture-images
   ```

## Usage

### Generate Embeddings for All Furniture Images

Run the main script to process all images in the furniture directory:

```bash
python generate_embeddings.py
```

The script will:
1. Load the CLIP model
2. Connect to/create Pinecone index
3. Process all images in `client/src/assets/furniture/`
4. Generate embeddings for each image
5. Upload embeddings to Pinecone with metadata

### Output

The script provides:
- Progress bars for batch processing
- Detailed logging of operations
- Statistics on processed/failed images
- Index statistics from Pinecone

## Configuration

Edit `config.py` to customize:

- **CLIP Model**: Change `CLIP_MODEL_NAME` to use different CLIP variants
- **Image Path**: Modify `FURNITURE_IMAGES_PATH` if images are stored elsewhere
- **Image Size**: Adjust `MAX_IMAGE_SIZE` for different input dimensions
- **Supported Formats**: Add/remove formats in `SUPPORTED_IMAGE_FORMATS`

## Supported Image Formats

- `.jpg` / `.jpeg`
- `.png`
- `.webp`

## Project Structure

```
ml/image_matching/
├── generate_embeddings.py  # Main script for generating embeddings
├── config.py                # Configuration settings
├── requirements.txt         # Python dependencies
├── .env.example            # Environment variables template
└── README.md               # This file
```

## How It Works

1. **Image Loading**: Reads images from the furniture directory
2. **Preprocessing**: Resizes images to CLIP's input size (224x224)
3. **Embedding Generation**: Uses CLIP model to generate 512-dimensional embeddings
4. **Vector Storage**: Uploads embeddings to Pinecone with metadata
5. **Index Management**: Automatically creates index if it doesn't exist

## CLIP Model Details

The script uses `openai/clip-vit-base-patch32` which:
- Generates 512-dimensional embeddings
- Understands both images and text
- Works well for product image matching
- Is optimized for speed and accuracy

## Pinecone Index

- **Dimension**: 512 (CLIP base model)
- **Metric**: Cosine similarity
- **Metadata**: filename, category, filepath, image_size

## Troubleshooting

### Common Issues

1. **Pinecone API Key Error**
   - Ensure `.env` file exists and contains valid `PINECONE_API_KEY`
   - Check that the API key has proper permissions

2. **Image Loading Errors**
   - Verify images exist in `client/src/assets/furniture/`
   - Check file permissions
   - Ensure images are valid image files

3. **Model Loading Errors**
   - Ensure internet connection (first run downloads model)
   - Check available disk space
   - Verify PyTorch installation

4. **Memory Issues**
   - Reduce `batch_size` in `process_images()` call
   - Process fewer images at once

## Next Steps

After generating embeddings, you can:

1. **Build a Search API**: Create an endpoint to search similar products
2. **Image Upload Matching**: Match user-uploaded images to existing products
3. **Recommendation System**: Find visually similar products for recommendations
4. **Duplicate Detection**: Identify duplicate or similar product images

## Example: Query Similar Images

```python
from pinecone import Pinecone
import numpy as np
from sentence_transformers import SentenceTransformer
from PIL import Image

# Initialize
pc = Pinecone(api_key="your_api_key")
index = pc.Index("furniture-images")
model = SentenceTransformer("openai/clip-vit-base-patch32")

# Load and encode query image
query_image = Image.open("query.jpg").convert("RGB")
query_embedding = model.encode(query_image, convert_to_numpy=True)

# Search Pinecone
results = index.query(
    vector=query_embedding.tolist(),
    top_k=5,
    include_metadata=True
)

# Display results
for match in results['matches']:
    print(f"Similarity: {match['score']:.4f}")
    print(f"Image: {match['metadata']['filename']}")
```

## License

This module is part of the JC-Timbers project.

## Support

For issues or questions, please refer to the main project documentation or contact the development team.


