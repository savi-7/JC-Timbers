import mongoose from 'mongoose';
import Order from '../src/models/Order.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function fixOnlineOrdersPaymentStatus() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all online orders that have paymentStatus as 'Pending'
    const result = await Order.updateMany(
      { 
        paymentMethod: 'Online',
        paymentStatus: { $ne: 'Paid' } // Not equal to Paid
      },
      { 
        $set: { paymentStatus: 'Paid' } 
      }
    );

    console.log(`\n📊 Update Results:`);
    console.log(`   Total documents matched: ${result.matchedCount}`);
    console.log(`   Documents updated: ${result.modifiedCount}`);

    if (result.modifiedCount > 0) {
      console.log(`\n✅ Successfully updated ${result.modifiedCount} online orders to 'Paid' status`);
    } else {
      console.log(`\nℹ️  No orders needed updating. All online orders already have 'Paid' status.`);
    }

    // Show summary of all orders
    const onlineOrders = await Order.countDocuments({ paymentMethod: 'Online' });
    const onlinePaidOrders = await Order.countDocuments({ paymentMethod: 'Online', paymentStatus: 'Paid' });
    const codOrders = await Order.countDocuments({ paymentMethod: 'COD' });
    const codPaidOrders = await Order.countDocuments({ paymentMethod: 'COD', paymentStatus: 'Paid' });
    const codPendingOrders = await Order.countDocuments({ paymentMethod: 'COD', paymentStatus: 'Pending' });

    console.log(`\n📈 Order Summary:`);
    console.log(`   Online Orders (Total): ${onlineOrders}`);
    console.log(`   Online Orders (Paid): ${onlinePaidOrders}`);
    console.log(`   COD Orders (Total): ${codOrders}`);
    console.log(`   COD Orders (Paid): ${codPaidOrders}`);
    console.log(`   COD Orders (Pending): ${codPendingOrders}`);

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error updating orders:', error);
    process.exit(1);
  }
}

// Run the script
fixOnlineOrdersPaymentStatus();

