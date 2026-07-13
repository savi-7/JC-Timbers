import mongoose from 'mongoose';
import Order from '../src/models/Order.js';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jc-timbers');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Function to remove all orders
const removeAllOrders = async () => {
  try {
    console.log('Starting to remove all orders...');
    
    // Count orders before deletion
    const orderCount = await Order.countDocuments();
    console.log(`Found ${orderCount} orders to delete`);
    
    if (orderCount === 0) {
      console.log('No orders found in the database');
      return;
    }
    
    // Delete all orders
    const result = await Order.deleteMany({});
    console.log(`Successfully deleted ${result.deletedCount} orders`);
    
    // Verify deletion
    const remainingOrders = await Order.countDocuments();
    console.log(`Remaining orders: ${remainingOrders}`);
    
    if (remainingOrders === 0) {
      console.log('✅ All orders have been successfully removed from the database');
    } else {
      console.log('⚠️ Some orders may still remain');
    }
    
  } catch (error) {
    console.error('Error removing orders:', error);
  }
};

// Function to remove orders by status
const removeOrdersByStatus = async (status) => {
  try {
    console.log(`Starting to remove orders with status: ${status}...`);
    
    const orderCount = await Order.countDocuments({ status });
    console.log(`Found ${orderCount} orders with status '${status}' to delete`);
    
    if (orderCount === 0) {
      console.log(`No orders found with status '${status}'`);
      return;
    }
    
    const result = await Order.deleteMany({ status });
    console.log(`Successfully deleted ${result.deletedCount} orders with status '${status}'`);
    
  } catch (error) {
    console.error(`Error removing orders with status '${status}':`, error);
  }
};

// Function to remove orders by date range
const removeOrdersByDateRange = async (startDate, endDate) => {
  try {
    console.log(`Starting to remove orders between ${startDate} and ${endDate}...`);
    
    const query = {
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };
    
    const orderCount = await Order.countDocuments(query);
    console.log(`Found ${orderCount} orders in the specified date range to delete`);
    
    if (orderCount === 0) {
      console.log('No orders found in the specified date range');
      return;
    }
    
    const result = await Order.deleteMany(query);
    console.log(`Successfully deleted ${result.deletedCount} orders in the date range`);
    
  } catch (error) {
    console.error('Error removing orders by date range:', error);
  }
};

// Main execution function
const main = async () => {
  await connectDB();
  
  // Get command line arguments
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'all':
      await removeAllOrders();
      break;
    case 'status':
      const status = args[1];
      if (!status) {
        console.log('Please provide a status. Usage: node removeOrders.js status <status>');
        console.log('Available statuses: pending, processing, shipped, delivered, cancelled, completed');
        process.exit(1);
      }
      await removeOrdersByStatus(status);
      break;
    case 'date':
      const startDate = args[1];
      const endDate = args[2];
      if (!startDate || !endDate) {
        console.log('Please provide start and end dates. Usage: node removeOrders.js date <startDate> <endDate>');
        console.log('Date format: YYYY-MM-DD');
        process.exit(1);
      }
      await removeOrdersByDateRange(startDate, endDate);
      break;
    default:
      console.log('Usage: node removeOrders.js <command> [options]');
      console.log('');
      console.log('Commands:');
      console.log('  all                    - Remove all orders');
      console.log('  status <status>        - Remove orders by status');
      console.log('  date <start> <end>     - Remove orders by date range');
      console.log('');
      console.log('Examples:');
      console.log('  node removeOrders.js all');
      console.log('  node removeOrders.js status pending');
      console.log('  node removeOrders.js date 2024-01-01 2024-12-31');
      break;
  }
  
  await mongoose.disconnect();
  console.log('Database connection closed');
  process.exit(0);
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Run the script
main();
