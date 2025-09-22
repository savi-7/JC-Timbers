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

// Verify beam products
const verifyBeamProducts = async () => {
  try {
    console.log('Verifying beam products in database...\n');
    
    // Get all timber products
    const allTimberProducts = await Product.find({ category: 'timber' });
    console.log(`Total timber products in database: ${allTimberProducts.length}`);
    
    // Get beam products specifically
    const beamProducts = await Product.find({ category: 'timber', subcategory: 'beams' });
    console.log(`Beam products in database: ${beamProducts.length}\n`);
    
    if (beamProducts.length > 0) {
      console.log('Beam Products Details:');
      console.log('====================');
      beamProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name}`);
        console.log(`   Price: ₹${product.price} per ${product.unit}`);
        console.log(`   Quantity: ${product.quantity} ${product.unit}`);
        console.log(`   Size: ${product.size}`);
        console.log(`   Wood Type: ${product.attributes?.woodType || 'N/A'}`);
        console.log(`   Dimensions: ${product.attributes?.length || 'N/A'}ft x ${product.attributes?.width || 'N/A'}ft x ${product.attributes?.thickness || 'N/A'}in`);
        console.log(`   Grade: ${product.attributes?.grade || 'N/A'}`);
        console.log(`   Featured: ${product.featuredType}`);
        console.log(`   Description: ${product.description.substring(0, 100)}...`);
        console.log('');
      });
    }
    
    // Get plank products for comparison
    const plankProducts = await Product.find({ category: 'timber', subcategory: 'planks' });
    console.log(`Plank products in database: ${plankProducts.length}`);
    
    console.log('\nVerification completed successfully!');
  } catch (error) {
    console.error('Error verifying products:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run verification
const runVerification = async () => {
  await connectDB();
  await verifyBeamProducts();
};

runVerification();

