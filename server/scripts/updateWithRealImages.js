import mongoose from 'mongoose';
import Product from '../src/models/Product.js';
import fs from 'fs';
import path from 'path';
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

// Function to convert image file to base64
const convertImageToBase64 = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      console.error(`File does not exist: ${filePath}`);
      return null;
    }

    const imageBuffer = fs.readFileSync(filePath);
    const base64String = imageBuffer.toString('base64');
    console.log(`Converting image: ${path.basename(filePath)}, size: ${imageBuffer.length} bytes`);
    return base64String;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    return null;
  }
};

// Get random images from uploads folder
const getRandomImages = (count = 1) => {
  const uploadsDir = path.join(process.cwd(), 'uploads');
  const files = fs.readdirSync(uploadsDir).filter(file => 
    file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.jpeg') || file.toLowerCase().endsWith('.png')
  );
  
  const selectedFiles = [];
  for (let i = 0; i < count; i++) {
    const randomFile = files[Math.floor(Math.random() * files.length)];
    selectedFiles.push(path.join(uploadsDir, randomFile));
  }
  
  return selectedFiles;
};

const updateFurnitureWithRealImages = async () => {
  try {
    console.log('Updating furniture products with real base64 images...');
    
    const furnitureProducts = await Product.find({ category: 'furniture' });
    console.log(`Found ${furnitureProducts.length} furniture products`);
    
    for (const product of furnitureProducts) {
      // Get random images for this product
      const imageFiles = getRandomImages(1); // Get 1 random image per product
      
      const images = [];
      for (const imageFile of imageFiles) {
        const base64Data = convertImageToBase64(imageFile);
        if (base64Data) {
          const contentType = imageFile.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
          images.push({
            data: `data:${contentType};base64,${base64Data}`,
            contentType: contentType,
            filename: `${product.name.toLowerCase().replace(/\s+/g, '-')}-${path.basename(imageFile)}`
          });
        }
      }
      
      if (images.length > 0) {
        product.images = images;
        await product.save();
        console.log(`✅ Updated: ${product.name} with ${images.length} image(s)`);
      } else {
        console.log(`❌ Failed to update: ${product.name} - no valid images`);
      }
    }
    
    console.log('✅ Furniture products updated with real images!');
  } catch (error) {
    console.error('Error updating furniture products:', error);
  }
};

const updateConstructionWithRealImages = async () => {
  try {
    console.log('Updating construction material products with real base64 images...');
    
    const constructionProducts = await Product.find({ category: 'construction' });
    console.log(`Found ${constructionProducts.length} construction products`);
    
    for (const product of constructionProducts) {
      // Get random images for this product
      const imageFiles = getRandomImages(1); // Get 1 random image per product
      
      const images = [];
      for (const imageFile of imageFiles) {
        const base64Data = convertImageToBase64(imageFile);
        if (base64Data) {
          const contentType = imageFile.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
          images.push({
            data: `data:${contentType};base64,${base64Data}`,
            contentType: contentType,
            filename: `${product.name.toLowerCase().replace(/\s+/g, '-')}-${path.basename(imageFile)}`
          });
        }
      }
      
      if (images.length > 0) {
        product.images = images;
        await product.save();
        console.log(`✅ Updated: ${product.name} with ${images.length} image(s)`);
      } else {
        console.log(`❌ Failed to update: ${product.name} - no valid images`);
      }
    }
    
    console.log('✅ Construction material products updated with real images!');
  } catch (error) {
    console.error('Error updating construction products:', error);
  }
};

const updateAllProductsWithRealImages = async () => {
  try {
    await connectDB();
    
    await updateFurnitureWithRealImages();
    await updateConstructionWithRealImages();
    
    console.log('\n🎉 All products updated with real images successfully!');
    console.log('📊 Summary:');
    console.log('   - Furniture products: Updated with real base64 images');
    console.log('   - Construction materials: Updated with real base64 images');
    console.log('   - All images are now properly stored as base64 data URLs');
    
  } catch (error) {
    console.error('Error updating products:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed');
  }
};

// Run the update function
updateAllProductsWithRealImages();
