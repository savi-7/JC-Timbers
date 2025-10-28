import mongoose from 'mongoose';
import Order from '../src/models/Order.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testRevenueCalculation() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all paid orders (Online payments that are Paid, and COD orders marked as Paid)
    const paidOrders = await Order.find({ 
      paymentStatus: 'Paid',
      status: { $ne: 'Cancelled' }
    });
    
    console.log(`📊 Found ${paidOrders.length} paid orders\n`);
    
    // Calculate total revenue
    const totalRevenue = paidOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    // Calculate revenue by payment method
    const onlineRevenue = paidOrders
      .filter(order => order.paymentMethod === 'Online')
      .reduce((sum, order) => sum + order.totalAmount, 0);
    
    const codRevenue = paidOrders
      .filter(order => order.paymentMethod === 'COD')
      .reduce((sum, order) => sum + order.totalAmount, 0);
    
    // Get pending COD payments
    const pendingCODOrders = await Order.find({
      paymentMethod: 'COD',
      paymentStatus: { $ne: 'Paid' },
      status: { $nin: ['Cancelled'] }
    });
    
    const pendingCODRevenue = pendingCODOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    // Count orders
    const totalPaidOrders = paidOrders.length;
    const onlineOrders = paidOrders.filter(order => order.paymentMethod === 'Online').length;
    const codOrders = paidOrders.filter(order => order.paymentMethod === 'COD').length;
    const pendingCODOrdersCount = pendingCODOrders.length;
    
    console.log('💰 REVENUE STATISTICS:');
    console.log('═══════════════════════════════════════');
    console.log(`Total Revenue:        ₹${totalRevenue.toLocaleString()}`);
    console.log(`Online Revenue:       ₹${onlineRevenue.toLocaleString()} (${onlineOrders} orders)`);
    console.log(`COD Revenue:          ₹${codRevenue.toLocaleString()} (${codOrders} orders)`);
    console.log(`Pending COD Revenue:  ₹${pendingCODRevenue.toLocaleString()} (${pendingCODOrdersCount} orders)`);
    console.log(`Total Paid Orders:    ${totalPaidOrders}`);
    console.log('═══════════════════════════════════════\n');

    // Show sample paid orders
    console.log('📦 Sample Paid Orders (first 5):');
    paidOrders.slice(0, 5).forEach((order, index) => {
      console.log(`${index + 1}. Order ID: ${order._id.toString().slice(-8).toUpperCase()}`);
      console.log(`   Method: ${order.paymentMethod} | Status: ${order.paymentStatus}`);
      console.log(`   Amount: ₹${order.totalAmount} | Items: ${order.items.length}`);
      console.log('');
    });

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the test
testRevenueCalculation();

