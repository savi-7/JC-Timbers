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

// Sample timber plank products data
const timberPlankProducts = [
  {
    name: 'Premium Teak Plank',
    category: 'timber',
    subcategory: 'planks',
    quantity: 100,
    unit: 'pieces',
    price: 1800,
    size: '6x2 ft',
    description: 'Premium grade teak planks known for their durability, resistance to termites, and natural golden-brown finish. These planks are ideal for creating long-lasting furniture, doors, and flooring solutions that can withstand heavy use and maintain their aesthetic appeal for decades.',
    featuredType: 'best',
    attributes: {
      woodType: 'Teak',
      length: 6,
      width: 2,
      thickness: 1.5,
      grade: 'A'
    }
  },
  {
    name: 'Pine Wood Plank',
    category: 'timber',
    subcategory: 'planks',
    quantity: 200,
    unit: 'pieces',
    price: 950,
    size: '8x2.5 ft',
    description: 'Lightweight and versatile pine planks with a smooth texture and pale natural color, making them suitable for paneling, shelves, and decorative interiors. Pine wood is easy to cut, finish, and polish, making it an excellent choice for cost-effective furniture manufacturing and DIY projects.',
    featuredType: 'none',
    attributes: {
      woodType: 'Pine',
      length: 8,
      width: 2.5,
      thickness: 1,
      grade: 'B'
    }
  },
  {
    name: 'Solid Rosewood Plank',
    category: 'timber',
    subcategory: 'planks',
    quantity: 50,
    unit: 'pieces',
    price: 3500,
    size: '7x3 ft',
    description: 'High-density rosewood planks with a rich dark finish, widely valued for their strength, durability, and unique grain patterns. These planks are commonly used in luxury furniture, premium flooring, and fine carvings, offering unmatched elegance and long-lasting performance for sophisticated projects.',
    featuredType: 'best',
    attributes: {
      woodType: 'Rosewood',
      length: 7,
      width: 3,
      thickness: 2,
      grade: 'A+'
    }
  },
  {
    name: 'Mahogany Timber Plank',
    category: 'timber',
    subcategory: 'planks',
    quantity: 80,
    unit: 'pieces',
    price: 2200,
    size: '6x2.5 ft',
    description: 'Premium mahogany planks with a deep reddish-brown color, ideal for making fine cabinets, doors, and musical instruments. Known for its smooth texture, resistance to decay, and workability, mahogany wood is a preferred choice for high-end carpentry and projects requiring both strength and beauty.',
    featuredType: 'none',
    attributes: {
      woodType: 'Mahogany',
      length: 6,
      width: 2.5,
      thickness: 1.75,
      grade: 'A'
    }
  },
  {
    name: 'Classic Oak Plank',
    category: 'timber',
    subcategory: 'planks',
    quantity: 120,
    unit: 'pieces',
    price: 2800,
    size: '9x3 ft',
    description: 'Strong and durable oak planks, widely used for flooring, cabinetry, and structural work due to their hardness and natural resistance to wear. The unique grain texture of oak makes it highly appealing for decorative furniture while also providing strength for long-lasting applications in both interiors and exteriors.',
    featuredType: 'best',
    attributes: {
      woodType: 'Oak',
      length: 9,
      width: 3,
      thickness: 2,
      grade: 'A'
    }
  }
];

// Seed function
const seedTimberPlanks = async () => {
  try {
    console.log('Starting to seed timber plank products...');

    // Insert timber plank products
    const products = await Product.insertMany(timberPlankProducts);
    console.log(`Successfully seeded ${products.length} timber plank products`);

    // Display seeded products
    console.log('\nSeeded Products:');
    products.forEach(product => {
      console.log(`- ${product.name}`);
      console.log(`  Category: ${product.category} > ${product.subcategory}`);
      console.log(`  Price: ₹${product.price} per ${product.unit}`);
      console.log(`  Quantity: ${product.quantity} ${product.unit}`);
      console.log(`  Size: ${product.size}`);
      console.log(`  Wood Type: ${product.attributes.woodType}`);
      console.log(`  Dimensions: ${product.attributes.length}ft x ${product.attributes.width}ft x ${product.attributes.thickness}in`);
      console.log(`  Grade: ${product.attributes.grade}`);
      console.log(`  Featured: ${product.featuredType}`);
      console.log('');
    });

    console.log('Timber plank products seeding completed successfully!');

  } catch (error) {
    console.error('Error seeding timber plank products:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run seed function
const runSeed = async () => {
  await connectDB();
  await seedTimberPlanks();
};

runSeed();

