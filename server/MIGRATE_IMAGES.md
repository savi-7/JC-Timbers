# Migrate Existing Product Images to Cloudinary

This guide will help you migrate all existing product images (stored as base64 in MongoDB) to Cloudinary.

---

## What This Script Does

1. **Finds all products** with images stored as base64 (`data` field) but no Cloudinary URL (`url` field)
2. **Uploads each base64 image** to Cloudinary
3. **Updates MongoDB** to replace `data` with `url` and `publicId`
4. **Removes the base64 data** from MongoDB (saves space!)

---

## Before Running

✅ Make sure:
- Cloudinary credentials are in `server/.env` (you already have them!)
- Your server is **stopped** (the script connects to MongoDB directly)
- You have a **backup** of your database (optional but recommended)

---

## How to Run

### Option 1: Using Node directly

1. Open a terminal in the `server` folder:
   ```bash
   cd server
   ```

2. Run the migration script:
   ```bash
   node scripts/migrateImagesToCloudinary.js
   ```

### Option 2: Add to package.json (recommended)

Add this to your `package.json` scripts section:
```json
"migrate-images": "node scripts/migrateImagesToCloudinary.js"
```

Then run:
```bash
npm run migrate-images
```

---

## What You'll See

The script will show progress like this:

```
✅ Cloudinary configured
✅ Connected to MongoDB

📦 Found 15 products with base64 images to migrate

🔄 Processing: Mahogany Dining Table (ID: 69958429901719b97e5c4165)
  📤 Uploading image 1: table.jpg
  ✅ Uploaded: https://res.cloudinary.com/debyzfuzg/image/upload/v...
  ✅ Product updated successfully

🔄 Processing: Oak Coffee Table (ID: ...)
  📤 Uploading image 1: coffee-table.jpg
  ✅ Uploaded: https://res.cloudinary.com/debyzfuzg/image/upload/v...
  ✅ Product updated successfully

============================================================
📊 Migration Summary:
============================================================
Total products processed: 15
✅ Products migrated: 15
❌ Products failed: 0
Total images processed: 23
✅ Images migrated: 23
❌ Images failed: 0
============================================================

✅ Migration completed! Your images are now in Cloudinary.
💡 You can verify by checking: https://console.cloudinary.com/media_library
```

---

## After Migration

1. **Verify in Cloudinary**: Go to https://console.cloudinary.com → Media Library → `jc-timbers/products` folder
2. **Verify in MongoDB**: Check a product - images should have `url` field, not `data` field
3. **Test your app**: Make sure product images still display correctly

---

## Troubleshooting

### "Cloudinary credentials not found"
- Check that `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` are in `server/.env`
- Make sure there are no typos or extra spaces

### "MongoDB connection error"
- Check that `MONGODB_URI` is correct in `server/.env`
- Make sure MongoDB is running (if local) or accessible (if Atlas)

### Some images failed to upload
- Check the error messages in the console
- Common issues:
  - Image too large (Cloudinary free tier has limits)
  - Invalid base64 data
  - Network issues
- You can run the script again - it will skip already migrated images

### Script stops or hangs
- The script processes images one by one with a 500ms delay
- For many products, it may take several minutes
- Be patient and let it complete

---

## Notes

- **Safe to run multiple times**: The script skips images that already have Cloudinary URLs
- **Non-destructive**: Original base64 data is only removed after successful Cloudinary upload
- **Rate limiting**: There's a 500ms delay between uploads to avoid Cloudinary rate limits
- **Large databases**: If you have hundreds of products, the migration may take 10-30 minutes

---

## Need Help?

If something goes wrong:
1. Check the error messages in the console
2. Verify your Cloudinary credentials
3. Check your MongoDB connection
4. Make sure you have internet connection (for Cloudinary uploads)
