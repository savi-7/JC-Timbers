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

const checkAllProducts = async () => {
  try {
    await connectDB();

    console.log('Checking all products in the database...\n');

    // Get all products
    const allProducts = await Product.find({}).sort({ category: 1, name: 1 });

    console.log(`Total products in database: ${allProducts.length}\n`);

    if (allProducts.length === 0) {
      console.log('No products found in the database.');
      return;
    }

    // Group products by category
    const productsByCategory = {};
    allProducts.forEach(product => {
      if (!productsByCategory[product.category]) {
        productsByCategory[product.category] = [];
      }
      productsByCategory[product.category].push(product);
    });

    // Display products by category
    Object.keys(productsByCategory).forEach(category => {
      const products = productsByCategory[category];
      console.log(`📦 ${category.toUpperCase()} PRODUCTS (${products.length} items):`);
      console.log('=' .repeat(50));
      
      products.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name}`);
        console.log(`   Category: ${product.category}${product.subcategory ? ` > ${product.subcategory}` : ''}`);
        console.log(`   Price: ₹${product.price} per ${product.unit}`);
        console.log(`   Quantity: ${product.quantity} ${product.unit}`);
        if (product.woodType) console.log(`   Wood Type: ${product.woodType}`);
        if (product.grade) console.log(`   Grade: ${product.grade}`);
        if (product.size) console.log(`   Size: ${product.size}`);
        console.log('');
      });
      console.log('');
    });

    // Summary
    console.log('📊 SUMMARY:');
    console.log('=' .repeat(30));
    Object.keys(productsByCategory).forEach(category => {
      console.log(`${category}: ${productsByCategory[category].length} products`);
    });

  } catch (error) {
    console.error('Error checking products:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
  }
};

// Run the check
checkAllProducts();





