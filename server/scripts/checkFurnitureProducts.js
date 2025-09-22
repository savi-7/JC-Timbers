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

// Product Schema
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
  thickness: Number,
  isActive: Boolean
}, {
  timestamps: true
});

const Product = mongoose.model('Product', ProductSchema);

const checkFurnitureProducts = async () => {
  try {
    await connectDB();

    console.log('Checking furniture products in the database...\n');

    // Get all furniture products
    const furnitureProducts = await Product.find({ category: 'furniture' });

    console.log(`Found ${furnitureProducts.length} furniture products:\n`);

    furnitureProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   Category: ${product.category}`);
      console.log(`   Subcategory: ${product.subcategory || 'None'}`);
      console.log(`   Price: ₹${product.price}`);
      console.log(`   Quantity: ${product.quantity}`);
      console.log(`   Unit: ${product.unit}`);
      console.log(`   IsActive: ${product.isActive}`);
      console.log(`   FeaturedType: ${product.featuredType}`);
      console.log(`   CreatedAt: ${product.createdAt}`);
      console.log('');
    });

    // Check with isActive filter
    const activeFurnitureProducts = await Product.find({ 
      category: 'furniture', 
      isActive: true 
    });

    console.log(`Active furniture products: ${activeFurnitureProducts.length}`);

    // Check with isActive filter (undefined/null)
    const inactiveFurnitureProducts = await Product.find({ 
      category: 'furniture', 
      isActive: { $ne: true }
    });

    console.log(`Inactive furniture products: ${inactiveFurnitureProducts.length}`);

    // Test the exact query used by the API
    const apiQuery = { isActive: true };
    const apiFurnitureProducts = await Product.find({ 
      category: 'furniture',
      ...apiQuery
    });

    console.log(`API query results: ${apiFurnitureProducts.length}`);

  } catch (error) {
    console.error('Error checking furniture products:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
  }
};

// Run the check
checkFurnitureProducts();
