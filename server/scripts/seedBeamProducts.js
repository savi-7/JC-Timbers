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

const beamProducts = [
  {
    name: 'Sturdy Mango Wood Beam',
    category: 'timber',
    subcategory: 'beams',
    quantity: 60,
    unit: 'pieces',
    price: 1200,
    size: '8x4 ft',
    description: 'Durable mango wood beams known for their moderate strength, workability, and eco-friendliness. These beams are commonly used for interior framing, rustic furniture, and decorative structural applications. The natural grain and warm color make them a budget-friendly yet reliable choice for construction and design projects.',
    featuredType: 'none',
    attributes: {
      woodType: 'Mango',
      length: 8,
      width: 4,
      thickness: 3,
      grade: 'B'
    },
    images: []
  },
  {
    name: 'Premium Teak Timber Beam',
    category: 'timber',
    subcategory: 'beams',
    quantity: 40,
    unit: 'pieces',
    price: 4500,
    size: '10x5 ft',
    description: 'High-grade teak beams prized for their unmatched durability, resistance to weather and termites, and elegant golden-brown texture. These beams are widely used in structural construction, heavy-duty furniture, and outdoor applications where long-lasting performance and resistance to decay are essential.',
    featuredType: 'best',
    attributes: {
      woodType: 'Teak',
      length: 10,
      width: 5,
      thickness: 4,
      grade: 'A'
    },
    images: []
  },
  {
    name: 'Solid Rosewood Beam',
    category: 'timber',
    subcategory: 'beams',
    quantity: 30,
    unit: 'pieces',
    price: 5200,
    size: '9x4 ft',
    description: 'Dense and premium-quality rosewood beams with exceptional strength, deep rich tones, and striking grain patterns. Ideal for luxury interiors, staircases, and high-end furniture requiring durability and aesthetics. Rosewood beams provide both structural integrity and visual elegance, making them a preferred choice for premium projects.',
    featuredType: 'best',
    attributes: {
      woodType: 'Rosewood',
      length: 9,
      width: 4,
      thickness: 3.5,
      grade: 'A+'
    },
    images: []
  }
];

// Seed function
const seedBeamProducts = async () => {
  console.log('Starting to seed beam products...');
  try {
    const products = await Product.insertMany(beamProducts);
    console.log(`Successfully seeded ${products.length} beam products`);

    console.log('\nSeeded Beam Products:');
    products.forEach(product => {
      console.log(`- ${product.name}`);
      console.log(`  Category: ${product.category} > ${product.subcategory}`);
      console.log(`  Price: ₹${product.price} per ${product.unit}`);
      console.log(`  Quantity: ${product.quantity} ${product.unit}`);
      console.log(`  Size: ${product.size}`);
      if (product.attributes) {
        console.log(`  Wood Type: ${product.attributes.woodType}`);
        console.log(`  Dimensions: ${product.attributes.length}ft x ${product.attributes.width}ft x ${product.attributes.thickness}in`);
        console.log(`  Grade: ${product.attributes.grade}`);
      }
      console.log(`  Featured: ${product.featuredType}`);
      console.log('');
    });

    console.log('Beam products seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding beam products:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run seed function
const runSeed = async () => {
  await connectDB();
  await seedBeamProducts();
};

runSeed();

