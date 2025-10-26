import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../src/models/Order.js';
import Product from '../src/models/Product.js';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env file');
  process.exit(1);
}

async function fixOrderImages() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all orders
    const orders = await Order.find({});
    console.log(`📦 Found ${orders.length} orders\n`);

    let fixedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const order of orders) {
      console.log(`\n🔍 Processing Order: ${order._id}`);
      console.log(`   Items: ${order.items.length}`);
      
      let orderModified = false;

      for (let i = 0; i < order.items.length; i++) {
        const item = order.items[i];
        console.log(`   - Item ${i + 1}: ${item.name}`);

        // Check if image is missing or invalid
        if (!item.image || !item.image.startsWith('data:')) {
          console.log(`     ⚠️  Image missing or invalid, fetching from product...`);
          
          try {
            // Fetch the product to get the image
            const product = await Product.findById(item.product);
            
            if (product && product.images && product.images[0]) {
              const imageData = product.images[0];
              
              // Convert Buffer to base64 if needed
              const base64Data = Buffer.isBuffer(imageData.data)
                ? imageData.data.toString('base64')
                : imageData.data;
              
              // Create proper data URL
              const imageUrl = `data:${imageData.contentType};base64,${base64Data}`;
              
              // Update the order item
              order.items[i].image = imageUrl;
              orderModified = true;
              
              console.log(`     ✅ Fixed image (${imageUrl.length} chars)`);
              fixedCount++;
            } else {
              console.log(`     ⚠️  Product not found or has no image`);
              skippedCount++;
            }
          } catch (err) {
            console.log(`     ❌ Error fetching product: ${err.message}`);
            errorCount++;
          }
        } else {
          console.log(`     ✓  Image already valid`);
          skippedCount++;
        }
      }

      // Save the order if modified
      if (orderModified) {
        await order.save();
        console.log(`   💾 Order saved with updated images`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY:');
    console.log(`   ✅ Fixed: ${fixedCount} images`);
    console.log(`   ⏭️  Skipped: ${skippedCount} items (already valid or no image available)`);
    console.log(`   ❌ Errors: ${errorCount} items`);
    console.log('='.repeat(60) + '\n');

    console.log('✅ Script completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the script
fixOrderImages();


