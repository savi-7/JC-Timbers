// Simple script to remove orders using existing server setup
// Run this script from the server directory

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Order from '../src/models/Order.js';

// Load environment variables
dotenv.config();

const removeOrders = async () => {
  try {
    // Connect to the same database as your server
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Count orders before deletion
    const orderCount = await Order.countDocuments();
    console.log(`📊 Found ${orderCount} orders in the database`);

    if (orderCount === 0) {
      console.log('ℹ️ No orders found to delete');
      return;
    }

    // Ask for confirmation
    console.log(`⚠️ WARNING: About to delete ${orderCount} orders from the database`);
    console.log('This action cannot be undone!');
    
    // Delete all orders
    const result = await Order.deleteMany({});
    console.log(`✅ Successfully deleted ${result.deletedCount} orders`);

    // Verify deletion
    const remainingOrders = await Order.countDocuments();
    console.log(`📊 Remaining orders: ${remainingOrders}`);

    if (remainingOrders === 0) {
      console.log('🎉 All orders have been successfully removed!');
    } else {
      console.log('⚠️ Some orders may still remain');
    }

  } catch (error) {
    console.error('❌ Error removing orders:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Database connection closed');
  }
};

// Run the script
removeOrders();
