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

// Sample Cloudinary image URLs (replace with actual URLs from your Cloudinary account)
const sampleImages = {
  timber: [
    {
      url: 'https://res.cloudinary.com/demo/image/upload/v1234567890/timber1.jpg',
      public_id: 'timber1'
    },
    {
      url: 'https://res.cloudinary.com/demo/image/upload/v1234567890/timber2.jpg',
      public_id: 'timber2'
    },
    {
      url: 'https://res.cloudinary.com/demo/image/upload/v1234567890/timber3.jpg',
      public_id: 'timber3'
    }
  ],
  furniture: [
    {
      url: 'https://res.cloudinary.com/demo/image/upload/v1234567890/furniture1.jpg',
      public_id: 'furniture1'
    },
    {
      url: 'https://res.cloudinary.com/demo/image/upload/v1234567890/furniture2.jpg',
      public_id: 'furniture2'
    },
    {
      url: 'https://res.cloudinary.com/demo/image/upload/v1234567890/furniture3.jpg',
      public_id: 'furniture3'
    },
    {
      url: 'https://res.cloudinary.com/demo/image/upload/v1234567890/furniture4.jpg',
      public_id: 'furniture4'
    }
  ],
  construction: [
    {
      url: 'https://res.cloudinary.com/demo/image/upload/v1234567890/construction1.jpg',
      public_id: 'construction1'
    },
    {
      url: 'https://res.cloudinary.com/demo/image/upload/v1234567890/construction2.jpg',
      public_id: 'construction2'
    }
  ]
};

// Sample products data
const sampleProducts = [
  {
    name: 'Teak Plank',
    category: 'timber',
    quantity: 25,
    unit: 'cubic ft',
    price: 1500,
    size: '10x5x2 ft',
    description: 'Premium quality teak wood planks, perfect for furniture making and construction projects. Known for its durability and beautiful grain pattern.',
    images: sampleImages.timber,
    attributes: {
      woodType: 'Teak',
      dimension: '10x5x2 ft',
      grade: 'A'
    }
  },
  {
    name: 'Dining Table',
    category: 'furniture',
    quantity: 8,
    unit: 'pieces',
    price: 25000,
    size: '6x3x2.5 ft',
    description: 'Elegant rosewood dining table with modern design. Perfect for family gatherings and dinner parties. Handcrafted with attention to detail.',
    images: sampleImages.furniture,
    attributes: {
      furnitureType: 'Dining',
      material: 'Rosewood',
      polish: 'Matte',
      style: 'Modern'
    }
  },
  {
    name: 'Wooden Door',
    category: 'construction',
    quantity: 12,
    unit: 'pieces',
    price: 8500,
    size: '7ft x 3ft',
    description: 'Solid wooden entrance door with polished finish. Provides excellent security and aesthetic appeal for residential and commercial properties.',
    images: sampleImages.construction,
    attributes: {
      productType: 'Door',
      size: '7ft x 3ft',
      finish: 'Polished',
      usage: 'Entrance'
    }
  }
];

// Seed function
const seedProducts = async () => {
  try {
    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert sample products
    const products = await Product.insertMany(sampleProducts);
    console.log(`Successfully seeded ${products.length} products`);

    // Display seeded products
    products.forEach(product => {
      console.log(`- ${product.name} (${product.category}) - ${product.images.length} images`);
    });

  } catch (error) {
    console.error('Error seeding products:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run seed function
const runSeed = async () => {
  await connectDB();
  await seedProducts();
};

runSeed();
