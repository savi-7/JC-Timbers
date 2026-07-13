import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';

// Load environment variables
dotenv.config();

// Configure Cloudinary
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error('❌ Cloudinary credentials not found in .env file!');
  console.error('Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your .env file');
  process.exit(1);
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret
});

console.log('✅ Cloudinary configured');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Product Schema (must match your Product model)
const productSchema = new mongoose.Schema({
  name: String,
  category: String,
  images: [{
    data: String,
    url: String,
    publicId: String,
    contentType: String,
    filename: String
  }]
}, { strict: false }); // Allow extra fields

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

/**
 * Upload base64 image to Cloudinary
 */
const uploadBase64ToCloudinary = async (base64Data, filename, contentType) => {
  try {
    // Extract base64 string from data URL if needed
    let base64String = base64Data;
    if (base64Data.startsWith('data:')) {
      base64String = base64Data.split(',')[1];
    }

    // Upload to Cloudinary using base64
    const result = await cloudinary.uploader.upload(
      `data:${contentType};base64,${base64String}`,
      {
        folder: 'jc-timbers/products',
        use_filename: true,
        unique_filename: true,
        resource_type: 'image'
      }
    );

    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    console.error(`Error uploading ${filename} to Cloudinary:`, error.message);
    return null;
  }
};

/**
 * Migrate all products with base64 images to Cloudinary
 */
const migrateImagesToCloudinary = async () => {
  try {
    await connectDB();

    // Find all products that have at least one image with data (base64) but no url (Cloudinary)
    const products = await Product.find({
      images: {
        $elemMatch: {
          data: { $exists: true, $ne: null },
          $or: [
            { url: { $exists: false } },
            { url: null }
          ]
        }
      }
    }).select('name images');

    console.log(`\n📦 Found ${products.length} products with base64 images to migrate\n`);

    if (products.length === 0) {
      console.log('✅ No products need migration. All images are already in Cloudinary!');
      await mongoose.connection.close();
      process.exit(0);
    }

    let totalImages = 0;
    let migratedImages = 0;
    let failedImages = 0;
    let migratedProducts = 0;
    let failedProducts = 0;

    for (const product of products) {
      console.log(`\n🔄 Processing: ${product.name} (ID: ${product._id})`);

      const imagesToUpdate = [];
      let hasChanges = false;

      for (let i = 0; i < product.images.length; i++) {
        const image = product.images[i];
        
        // Skip if already has Cloudinary URL
        if (image.url) {
          console.log(`  ⏭️  Image ${i + 1}: Already has Cloudinary URL, skipping`);
          continue;
        }

        // Skip if no base64 data
        if (!image.data) {
          console.log(`  ⏭️  Image ${i + 1}: No data to migrate, skipping`);
          continue;
        }

        totalImages++;
        console.log(`  📤 Uploading image ${i + 1}: ${image.filename || 'unnamed'}`);

        const cloudResult = await uploadBase64ToCloudinary(
          image.data,
          image.filename || `product_${product._id}_img_${i}`,
          image.contentType || 'image/jpeg'
        );

        if (cloudResult) {
          // Update image object: add url and publicId, remove data
          imagesToUpdate.push({
            url: cloudResult.url,
            publicId: cloudResult.publicId,
            contentType: image.contentType,
            filename: image.filename,
            // Remove data field (no longer needed)
            // data: undefined // Mongoose will remove it if we don't include it
          });
          migratedImages++;
          hasChanges = true;
          console.log(`  ✅ Uploaded: ${cloudResult.url.substring(0, 60)}...`);
        } else {
          // Keep original image if upload failed
          imagesToUpdate.push(image);
          failedImages++;
          console.log(`  ❌ Failed to upload image ${i + 1}`);
        }
      }

      // Update product if any images were migrated
      if (hasChanges) {
        try {
          // Replace images array with updated images (data field will be omitted)
          await Product.updateOne(
            { _id: product._id },
            { 
              $set: { 
                images: imagesToUpdate
              } 
            }
          );

          migratedProducts++;
          console.log(`  ✅ Product updated successfully`);
        } catch (error) {
          failedProducts++;
          console.error(`  ❌ Failed to update product:`, error.message);
        }
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary:');
    console.log('='.repeat(60));
    console.log(`Total products processed: ${products.length}`);
    console.log(`✅ Products migrated: ${migratedProducts}`);
    console.log(`❌ Products failed: ${failedProducts}`);
    console.log(`Total images processed: ${totalImages}`);
    console.log(`✅ Images migrated: ${migratedImages}`);
    console.log(`❌ Images failed: ${failedImages}`);
    console.log('='.repeat(60));

    if (migratedProducts > 0) {
      console.log('\n✅ Migration completed! Your images are now in Cloudinary.');
      console.log('💡 You can verify by checking: https://console.cloudinary.com/media_library');
    }

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run migration
migrateImagesToCloudinary();
