import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Order from './src/models/Order.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

async function checkOrderImage() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    // Get the most recent order
    const order = await Order.findOne({}).sort({ createdAt: -1 });
    
    if (!order) {
      console.log('No orders found');
      await mongoose.disconnect();
      return;
    }

    console.log(`Order ID: ${order._id}`);
    console.log(`Created: ${order.createdAt}`);
    console.log(`Items: ${order.items.length}\n`);

    order.items.forEach((item, index) => {
      console.log(`--- Item ${index + 1}: ${item.name} ---`);
      console.log(`  Has image: ${!!item.image}`);
      
      if (item.image) {
        console.log(`  Image length: ${item.image.length} characters`);
        console.log(`  Image type: ${typeof item.image}`);
        console.log(`  Starts with: ${item.image.substring(0, 50)}`);
        console.log(`  First 200 chars: ${item.image.substring(0, 200)}`);
        
        // Check if it's valid base64
        if (item.image.startsWith('data:')) {
          const parts = item.image.split(',');
          console.log(`  Header: ${parts[0]}`);
          console.log(`  Base64 data length: ${parts[1]?.length || 0}`);
          
          if (parts[1]) {
            // Try to validate base64
            try {
              const buffer = Buffer.from(parts[1], 'base64');
              console.log(`  ✓ Valid base64 (decoded to ${buffer.length} bytes)`);
              
              // Check if it's a valid image by looking at magic numbers
              const magicNumbers = buffer.slice(0, 4).toString('hex');
              console.log(`  Magic numbers: ${magicNumbers}`);
              
              if (magicNumbers.startsWith('ffd8ff')) {
                console.log(`  ✓ Valid JPEG image`);
              } else if (magicNumbers.startsWith('89504e47')) {
                console.log(`  ✓ Valid PNG image`);
              } else {
                console.log(`  ⚠ Unknown image format`);
              }
            } catch (err) {
              console.log(`  ✗ Invalid base64: ${err.message}`);
            }
          }
        } else {
          console.log(`  ✗ Not a data URL`);
        }
      } else {
        console.log(`  ✗ No image data`);
      }
      console.log('');
    });

    await mongoose.disconnect();
    console.log('✓ Done');
  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
  }
}

checkOrderImage();


