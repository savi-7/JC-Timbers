import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error('❌ Cloudinary credentials not found in .env file!');
  process.exit(1);
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret
});

console.log('✅ Cloudinary configured');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const marketplaceListingSchema = new mongoose.Schema({
  title: String,
  image: {
    data: String,
    url: String,
    publicId: String,
    contentType: String,
    filename: String
  }
}, { strict: false });

const MarketplaceListing = mongoose.models.MarketplaceListing ||
  mongoose.model('MarketplaceListing', marketplaceListingSchema);

const uploadBase64ToCloudinary = async (base64Data, filename, contentType) => {
  try {
    let base64String = base64Data;
    if (base64Data.startsWith('data:')) {
      base64String = base64Data.split(',')[1];
    }
    const result = await cloudinary.uploader.upload(
      `data:${contentType};base64,${base64String}`,
      {
        folder: 'jc-timbers/marketplace',
        use_filename: true,
        unique_filename: true,
        resource_type: 'image'
      }
    );
    return { url: result.secure_url, publicId: result.public_id };
  } catch (error) {
    console.error(`Error uploading ${filename}:`, error.message);
    return null;
  }
};

const migrateMarketplaceImages = async () => {
  try {
    await connectDB();

    const listings = await MarketplaceListing.find({
      'image.data': { $exists: true, $ne: null },
      $or: [{ 'image.url': { $exists: false } }, { 'image.url': null }]
    }).select('title image');

    console.log(`\n📦 Found ${listings.length} marketplace listings with base64 images to migrate\n`);

    if (listings.length === 0) {
      console.log('✅ No marketplace listings need migration.');
      await mongoose.connection.close();
      process.exit(0);
    }

    let migrated = 0;
    let failed = 0;

    for (const listing of listings) {
      if (!listing.image?.data) continue;
      console.log(`🔄 Processing: ${listing.title} (ID: ${listing._id})`);

      const cloudResult = await uploadBase64ToCloudinary(
        listing.image.data,
        listing.image.filename || `listing_${listing._id}`,
        listing.image.contentType || 'image/jpeg'
      );

      if (cloudResult) {
        await MarketplaceListing.updateOne(
          { _id: listing._id },
          {
            $set: {
              'image.url': cloudResult.url,
              'image.publicId': cloudResult.publicId
            },
            $unset: { 'image.data': '' }
          }
        );
        migrated++;
        console.log(`  ✅ Uploaded: ${cloudResult.url.substring(0, 60)}...`);
      } else {
        failed++;
        console.log(`  ❌ Failed to upload`);
      }
      await new Promise((r) => setTimeout(r, 500));
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 Marketplace migration summary:');
    console.log(`✅ Migrated: ${migrated}`);
    console.log(`❌ Failed: ${failed}`);
    console.log('='.repeat(50));

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

migrateMarketplaceImages();
