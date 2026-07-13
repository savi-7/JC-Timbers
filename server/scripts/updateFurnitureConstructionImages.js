import mongoose from 'mongoose';
import Product from '../src/models/Product.js';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/timber-website');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Sample base64 images for furniture and construction materials
const getPlaceholderImage = (type) => {
  // These are small base64 encoded placeholder images
  const images = {
    furniture: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
    construction: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
  };
  return images[type];
};

const updateFurnitureImages = async () => {
  try {
    console.log('Updating furniture products with base64 images...');
    
    const furnitureProducts = await Product.find({ category: 'furniture' });
    console.log(`Found ${furnitureProducts.length} furniture products`);
    
    for (const product of furnitureProducts) {
      // Check if product already has images
      if (product.images && product.images.length > 0) {
        console.log(`Product "${product.name}" already has images, skipping...`);
        continue;
      }
      
      // Add base64 image
      product.images = [{
        data: getPlaceholderImage('furniture'),
        contentType: 'image/jpeg',
        filename: `${product.name.toLowerCase().replace(/\s+/g, '-')}-placeholder.jpg`
      }];
      
      await product.save();
      console.log(`Updated: ${product.name}`);
    }
    
    console.log('✅ Furniture products updated successfully!');
  } catch (error) {
    console.error('Error updating furniture products:', error);
  }
};

const updateConstructionImages = async () => {
  try {
    console.log('Updating construction material products with base64 images...');
    
    const constructionProducts = await Product.find({ category: 'construction' });
    console.log(`Found ${constructionProducts.length} construction products`);
    
    for (const product of constructionProducts) {
      // Check if product already has images
      if (product.images && product.images.length > 0) {
        console.log(`Product "${product.name}" already has images, skipping...`);
        continue;
      }
      
      // Add base64 image
      product.images = [{
        data: getPlaceholderImage('construction'),
        contentType: 'image/jpeg',
        filename: `${product.name.toLowerCase().replace(/\s+/g, '-')}-placeholder.jpg`
      }];
      
      await product.save();
      console.log(`Updated: ${product.name}`);
    }
    
    console.log('✅ Construction material products updated successfully!');
  } catch (error) {
    console.error('Error updating construction products:', error);
  }
};

const updateAllProducts = async () => {
  try {
    await connectDB();
    
    await updateFurnitureImages();
    await updateConstructionImages();
    
    console.log('\n🎉 All products updated successfully!');
    console.log('📊 Summary:');
    console.log('   - Furniture products: Updated with base64 images');
    console.log('   - Construction materials: Updated with base64 images');
    console.log('   - All products now follow the same base64 image storage pattern as timber products');
    
  } catch (error) {
    console.error('Error updating products:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed');
  }
};

// Run the update function
updateAllProducts();
