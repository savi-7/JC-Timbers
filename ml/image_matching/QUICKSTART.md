# Quick Start Guide

## Step 1: Install Dependencies

```bash
cd ml/image_matching
pip install -r requirements.txt
```

## Step 2: Set Up Pinecone

1. Sign up for a free Pinecone account at https://www.pinecone.io/
2. Get your API key from the Pinecone dashboard
3. Create a `.env` file:

```bash
# Windows
setup_env.bat

# Linux/Mac
chmod +x setup_env.sh
./setup_env.sh
```

4. Edit `.env` and add your Pinecone API key:
```env
PINECONE_API_KEY=your_actual_api_key_here
PINECONE_ENVIRONMENT=us-east-1
PINECONE_INDEX_NAME=furniture-images
```

## Step 3: Run the Script

```bash
python generate_embeddings.py
```

The script will:
- ✅ Load the CLIP model (first run downloads ~500MB)
- ✅ Create/connect to Pinecone index
- ✅ Process all images in `client/src/assets/furniture/`
- ✅ Generate embeddings and upload to Pinecone

## Step 4: Query Similar Images (Optional)

After generating embeddings, test the search:

```bash
python query_similar_images.py ../client/src/assets/furniture/bed.jpg 5
```

## Troubleshooting

### CLIP Model Not Found
If you get an error about the CLIP model, try:
1. Ensure internet connection (first run downloads model)
2. Check disk space (model is ~500MB)
3. Verify sentence-transformers version: `pip install --upgrade sentence-transformers`

### Pinecone Connection Error
- Verify API key in `.env` file
- Check Pinecone dashboard for account status
- Ensure environment region matches your Pinecone project

### Image Loading Errors
- Verify images exist in `client/src/assets/furniture/`
- Check file permissions
- Ensure images are valid (not corrupted)

## Expected Output

```
2024-01-01 10:00:00 - INFO - Loading CLIP model: clip-ViT-B-32
2024-01-01 10:00:05 - INFO - CLIP model loaded successfully
2024-01-01 10:00:05 - INFO - Model embedding dimension: 512
2024-01-01 10:00:05 - INFO - Initializing Pinecone client...
2024-01-01 10:00:06 - INFO - Creating new Pinecone index: furniture-images
2024-01-01 10:00:10 - INFO - Found 13 image files
Processing batches: 100%|████████| 1/1 [00:15<00:00, 15.23s/it]
2024-01-01 10:00:25 - INFO - Upserted batch of 13 vectors
2024-01-01 10:00:25 - INFO - Processing complete. Stats: {'processed': 13, 'failed': 0, 'skipped': 0, 'total_images': 13}
✅ Process completed successfully!
```

## Next Steps

- Build API endpoint for image search
- Integrate with product catalog
- Create recommendation system
- Add duplicate detection

