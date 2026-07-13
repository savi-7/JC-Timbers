import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../src/models/Product.js';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Names of the 5 timber plank products to keep
const timberPlankProductNames = [
  'Premium Teak Plank',
  'Pine Wood Plank',
  'Solid Rosewood Plank',
  'Mahogany Timber Plank',
  'Classic Oak Plank'
];

// Cleanup function
const cleanupProducts = async () => {
  try {
    console.log('Starting database cleanup...');

    // First, let's see what products exist
    const allProducts = await Product.find({});
    console.log(`\nTotal products in database: ${allProducts.length}`);
    
    // Display all existing products
    console.log('\nExisting products:');
    allProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} (${product.category})`);
    });

    // Delete all products except the 5 timber plank products
    const deleteResult = await Product.deleteMany({
      name: { $nin: timberPlankProductNames }
    });

    console.log(`\nDeleted ${deleteResult.deletedCount} products`);

    // Verify remaining products
    const remainingProducts = await Product.find({});
    console.log(`\nRemaining products: ${remainingProducts.length}`);

    console.log('\nProducts kept in database:');
    remainingProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   Category: ${product.category} > ${product.subcategory}`);
      console.log(`   Price: ₹${product.price} per ${product.unit}`);
      console.log(`   Quantity: ${product.quantity} ${product.unit}`);
      console.log(`   Wood Type: ${product.attributes.woodType}`);
      console.log(`   Grade: ${product.attributes.grade}`);
      console.log('');
    });

    console.log('Database cleanup completed successfully!');
    console.log('Only the 5 timber plank products remain in the database.');

  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run cleanup function
const runCleanup = async () => {
  await connectDB();
  await cleanupProducts();
};

runCleanup();

