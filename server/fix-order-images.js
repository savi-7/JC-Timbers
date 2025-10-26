import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Order from './src/models/Order.js';
import Product from './src/models/Product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from server directory
dotenv.config({ path: join(__dirname, '.env') });

async function fixOrderImages() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Get all orders
    const orders = await Order.find({});
    console.log(`\nFound ${orders.length} orders to process`);

    let fixedCount = 0;
    let errorCount = 0;

    for (const order of orders) {
      let orderNeedsUpdate = false;
      console.log(`\n--- Processing Order ${order._id} ---`);

      for (const item of order.items) {
        console.log(`  Checking item: ${item.name}`);
        
        // If image is missing or invalid, try to fetch from product
        if (!item.image || !item.image.startsWith('data:image')) {
          console.log(`    ⚠ Image missing or invalid, fetching from product...`);
          
          try {
            const product = await Product.findById(item.product);
            
            if (product && product.images && product.images[0] && product.images[0].data) {
              const imageData = product.images[0].data;
              const contentType = product.images[0].contentType;
              
              // Convert Buffer to base64 if needed
              const base64Data = Buffer.isBuffer(imageData)
                ? imageData.toString('base64')
                : imageData;
              
              const newImageUrl = `data:${contentType};base64,${base64Data}`;
              
              // Update the item image
              item.image = newImageUrl;
              orderNeedsUpdate = true;
              
              console.log(`    ✓ Fixed image for ${item.name} (${newImageUrl.length} chars)`);
            } else {
              console.log(`    ✗ Product not found or has no images`);
            }
          } catch (err) {
            console.error(`    ✗ Error fetching product:`, err.message);
            errorCount++;
          }
        } else {
          console.log(`    ✓ Image already valid`);
        }
      }

      // Save the order if any items were updated
      if (orderNeedsUpdate) {
        try {
          await order.save();
          console.log(`  ✓ Order ${order._id} updated successfully`);
          fixedCount++;
        } catch (err) {
          console.error(`  ✗ Error saving order:`, err.message);
          errorCount++;
        }
      } else {
        console.log(`  - No changes needed for this order`);
      }
    }

    console.log('\n=== Summary ===');
    console.log(`Total orders processed: ${orders.length}`);
    console.log(`Orders fixed: ${fixedCount}`);
    console.log(`Errors: ${errorCount}`);
    
    await mongoose.disconnect();
    console.log('\n✓ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Fatal error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

console.log('=================================');
console.log('Order Images Fix Script');
console.log('=================================');
fixOrderImages();

