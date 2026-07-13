# How Image Matching Works in JC Timbers

## Overview
The image matching system uses **AI-powered visual similarity search** to find products that look similar to the image you upload. It does **NOT** use product names - it compares the actual visual features of images.

---

## How It Works (Step by Step)

### 1. **Product Indexing (When Products Are Added)**

When a furniture product is created in the system:

1. **Image Processing**: Each product image is processed using a CLIP (Contrastive Language-Image Pre-training) AI model
2. **Embedding Generation**: The CLIP model converts the image into a **512-dimensional vector** (called an "embedding")
   - This vector represents the visual features of the image (shape, color, style, furniture type, etc.)
   - It's like a "fingerprint" of the image
3. **Storage**: The embedding is stored in Pinecone (a vector database) along with metadata:
   - `product_id`: The product's database ID
   - `product_name`: The product's name
   - `category`: "furniture"
   - `filename`: Image filename
   - `subcategory`: Product subcategory

**Example:**
```
Product: "Arthur Queen Size Bed"
Image → CLIP Model → [0.123, 0.456, 0.789, ...] (512 numbers)
Stored in Pinecone with metadata: {product_id: "123", product_name: "Arthur Queen Size Bed"}
```

---

### 2. **Image Search (When You Upload an Image)**

When you upload an image to search:

1. **Image Upload**: Your image is sent to the FastAPI service
2. **Same CLIP Processing**: Your uploaded image is processed with the **same CLIP model**
   - Creates a 512-dimensional embedding vector
   - This represents the visual features of YOUR image
3. **Similarity Search**: Pinecone searches for product images with similar embeddings
   - Uses **cosine similarity** to compare vectors
   - Returns products with 70%+ similarity (after our recent fix)
4. **Results Returned**: Pinecone returns:
   - Similarity score (0.0 to 1.0, where 1.0 = identical)
   - Metadata (product_id, product_name, filename, etc.)

**Example:**
```
Your uploaded bed image → CLIP Model → [0.125, 0.458, 0.791, ...]
Pinecone finds: "Arthur Queen Size Bed" with 0.85 similarity (85% match)
```

---

### 3. **Product Matching (Linking Results to Products)**

The search results from Pinecone are then matched to actual products in your database:

**Strategy 1: Product ID Match (Most Reliable)**
- Uses the `product_id` from Pinecone metadata
- Directly links to the product in your database

**Strategy 2: Product Name Match**
- Uses the `product_name` from Pinecone metadata
- Matches by exact product name

**Strategy 3: Filename/Keyword Match (Fallback)**
- If product_id and product_name are missing, tries to match by filename keywords
- Less reliable, used only as a fallback

---

## Key Points

### ✅ **What It Does:**
- **Compares visual features** of images (shape, color, style, furniture type)
- Uses **AI embeddings** to find visually similar products
- Returns products with **70%+ visual similarity**
- Works based on **how the furniture looks**, not names

### ❌ **What It Does NOT Do:**
- Does **NOT** search by product name
- Does **NOT** use text matching
- Does **NOT** use filename matching (except as fallback)
- Does **NOT** show products that don't look similar

---

## Example Scenarios

### Scenario 1: Upload a Bed Image
1. You upload a photo of a bed
2. System generates embedding: `[0.12, 0.45, 0.78, ...]`
3. Pinecone finds similar bed embeddings:
   - "Arthur Queen Size Bed" → 85% similarity ✅
   - "Cosmo Bookshelf" → 45% similarity ❌ (filtered out, below 70%)
4. Shows: "Arthur Queen Size Bed" (because it looks similar)

### Scenario 2: Upload a Non-Furniture Image
1. You upload a photo of a car
2. System generates embedding: `[0.99, 0.01, 0.02, ...]` (very different)
3. Pinecone finds no similar furniture embeddings (all below 70%)
4. Shows: "No similar products found" message

### Scenario 3: Upload Similar-Looking Furniture
1. You upload a photo of a chair
2. System finds chairs with 75%+ similarity
3. Shows: All matching chairs (only those with 70%+ similarity)

---

## Technical Details

### CLIP Model
- **Model**: `clip-ViT-L-14` (Vision Transformer Large)
- **Purpose**: Converts images into numerical vectors that represent visual features
- **Output**: 512-dimensional embedding vector

### Pinecone Vector Database
- **Purpose**: Stores and searches embeddings efficiently
- **Search Method**: Cosine similarity (measures angle between vectors)
- **Threshold**: 70% similarity required (0.70 on 0.0-1.0 scale)

### Similarity Score
- **0.0 - 0.69**: Not similar enough (filtered out)
- **0.70 - 0.79**: Moderately similar (shown)
- **0.80 - 0.89**: Very similar (shown)
- **0.90 - 1.0**: Extremely similar (shown)

---

## Why This Approach?

1. **Visual Accuracy**: Finds products that actually look similar, not just have similar names
2. **Language Independent**: Works regardless of product names or descriptions
3. **Style Recognition**: Can match by furniture style, color, shape, etc.
4. **AI-Powered**: Uses state-of-the-art computer vision technology

---

## Summary

**The system finds similar products by comparing the VISUAL FEATURES of images using AI, not by matching product names.**

- ✅ Uses: Image embeddings (visual similarity)
- ❌ Does NOT use: Product names, text matching, or filename matching

The product name is only used **after** finding similar images, to link the search results back to the actual product in your database.
