import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jc-timbers');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Product Schema (simplified for this script)
const ProductSchema = new mongoose.Schema({
  name: String,
  category: String,
  subcategory: String,
  price: Number,
  quantity: Number,
  unit: String,
  description: String,
  images: [mongoose.Schema.Types.Mixed],
  attributes: mongoose.Schema.Types.Mixed,
  featuredType: String,
  size: String,
  woodType: String,
  grade: String,
  length: Number,
  width: Number,
  thickness: Number
}, {
  timestamps: true
});

const Product = mongoose.model('Product', ProductSchema);

const removeDummyProducts = async () => {
  try {
    await connectDB();

    console.log('Starting cleanup of dummy furniture and construction material products...');

    // Find all products that are NOT timber products
    const nonTimberProducts = await Product.find({
      category: { $in: ['furniture', 'construction'] }
    });

    console.log(`Found ${nonTimberProducts.length} non-timber products to remove:`);
    
    // Log the products that will be removed
    nonTimberProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} (${product.category}) - ₹${product.price}`);
    });

    if (nonTimberProducts.length === 0) {
      console.log('No dummy products found to remove.');
      return;
    }

    // Remove all non-timber products
    const deleteResult = await Product.deleteMany({
      category: { $in: ['furniture', 'construction'] }
    });

    console.log(`\n✅ Successfully removed ${deleteResult.deletedCount} dummy products from the database.`);

    // Verify remaining products
    const remainingProducts = await Product.find({});
    console.log(`\n📊 Remaining products in database: ${remainingProducts.length}`);
    
    if (remainingProducts.length > 0) {
      console.log('\nRemaining products:');
      remainingProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} (${product.category}${product.subcategory ? ` - ${product.subcategory}` : ''}) - ₹${product.price}`);
      });
    }

  } catch (error) {
    console.error('Error removing dummy products:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
  }
};

// Run the cleanup
removeDummyProducts();





