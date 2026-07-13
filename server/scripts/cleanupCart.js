import mongoose from 'mongoose';
import Cart from '../src/models/Cart.js';
import Product from '../src/models/Product.js';
import dotenv from 'dotenv';

dotenv.config();

const cleanupCart = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all carts
    const carts = await Cart.find({}).populate('items.product');
    console.log(`📦 Found ${carts.length} carts`);

    let totalCleaned = 0;
    let totalItemsRemoved = 0;

    for (const cart of carts) {
      console.log(`\n🔍 Processing cart for user: ${cart.user}`);
      
      const originalItemCount = cart.items.length;
      const validItems = [];
      let itemsRemoved = 0;

      for (const item of cart.items) {
        if (item.product && item.product._id) {
          // Product exists and is valid
          validItems.push(item);
          console.log(`✅ Keeping item: ${item.product.name} (qty: ${item.quantity})`);
        } else {
          // Product is null or invalid
          itemsRemoved++;
          console.log(`❌ Removing invalid item: ${item.product ? 'Product not found' : 'Null product'} (qty: ${item.quantity})`);
        }
      }

      if (itemsRemoved > 0) {
        // Update cart with only valid items
        cart.items = validItems;
        await cart.save();
        
        totalCleaned++;
        totalItemsRemoved += itemsRemoved;
        
        console.log(`🧹 Cleaned cart for user ${cart.user}: Removed ${itemsRemoved} invalid items, kept ${validItems.length} valid items`);
      } else {
        console.log(`✨ Cart for user ${cart.user} is already clean`);
      }
    }

    console.log(`\n🎉 Cleanup complete!`);
    console.log(`📊 Summary:`);
    console.log(`   - Carts processed: ${carts.length}`);
    console.log(`   - Carts cleaned: ${totalCleaned}`);
    console.log(`   - Total items removed: ${totalItemsRemoved}`);

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the cleanup
cleanupCart();
