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

const fixFurnitureProducts = async () => {
  try {
    await connectDB();

    console.log('Fixing furniture products isActive field...\n');

    // Find all furniture products
    const furnitureProducts = await Product.find({ category: 'furniture' });

    console.log(`Found ${furnitureProducts.length} furniture products to fix:\n`);

    furnitureProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - isActive: ${product.isActive}`);
    });

    if (furnitureProducts.length === 0) {
      console.log('No furniture products found to fix.');
      return;
    }

    // Update all furniture products to have isActive: true
    const updateResult = await Product.updateMany(
      { category: 'furniture' },
      { $set: { isActive: true } }
    );

    console.log(`\n✅ Successfully updated ${updateResult.modifiedCount} furniture products.`);

    // Verify the fix
    const updatedFurnitureProducts = await Product.find({ 
      category: 'furniture',
      isActive: true 
    });

    console.log(`\n📊 Verification:`);
    console.log(`Active furniture products: ${updatedFurnitureProducts.length}`);

    // Test the API query
    const apiQuery = { isActive: true };
    const apiFurnitureProducts = await Product.find({ 
      category: 'furniture',
      ...apiQuery
    });

    console.log(`API query results: ${apiFurnitureProducts.length}`);

    if (apiFurnitureProducts.length > 0) {
      console.log('\n🎉 Furniture products should now be visible in the admin dashboard!');
    }

  } catch (error) {
    console.error('Error fixing furniture products:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
  }
};

// Run the fix
fixFurnitureProducts();





