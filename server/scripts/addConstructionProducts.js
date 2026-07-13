import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../src/models/Product.js';

dotenv.config();

const addConstructionProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    console.log('Adding construction material products to the database...');

    const constructionProducts = [
      {
        name: 'Premium Teak Door',
        category: 'construction',
        subcategory: 'doors',
        quantity: 25,
        unit: 'pieces',
        price: 28000,
        size: '84x36x2 inches',
        description: 'High-quality teak door with natural wood finish, perfect for main entrances and interior applications. Features excellent durability and weather resistance.',
        attributes: {
          productType: 'Door',
          woodType: 'Teak',
          grade: 'A+',
          finish: 'Natural Wood',
          usage: 'Main entrance and interior doors'
        },
        featuredType: 'best',
        isActive: true
      },
      {
        name: 'Mahogany Panel Door',
        category: 'construction',
        subcategory: 'doors',
        quantity: 20,
        unit: 'pieces',
        price: 32000,
        size: '84x36x2 inches',
        description: 'Elegant mahogany panel door with rich dark finish, ideal for luxury homes and commercial spaces. Known for its strength and aesthetic appeal.',
        attributes: {
          productType: 'Door',
          woodType: 'Mahogany',
          grade: 'A+',
          finish: 'Dark Brown',
          usage: 'Luxury residential and commercial doors'
        },
        featuredType: 'best',
        isActive: true
      },
      {
        name: 'Teak Window Frame',
        category: 'construction',
        subcategory: 'windows',
        quantity: 30,
        unit: 'pieces',
        price: 18500,
        size: '48x36x4 inches',
        description: 'Durable teak window frame designed for long-lasting performance. Resistant to weather conditions and termites, perfect for exterior applications.',
        attributes: {
          productType: 'Window Frame',
          woodType: 'Teak',
          grade: 'A',
          finish: 'Natural Wood',
          usage: 'Exterior window frames and sills'
        },
        featuredType: 'none',
        isActive: true
      },
      {
        name: 'Mahogany Window Frame',
        category: 'construction',
        subcategory: 'windows',
        quantity: 22,
        unit: 'pieces',
        price: 22500,
        size: '48x36x4 inches',
        description: 'Premium mahogany window frame with smooth finish, offering both functionality and elegance. Suitable for high-end residential projects.',
        attributes: {
          productType: 'Window Frame',
          woodType: 'Mahogany',
          grade: 'A',
          finish: 'Smooth Dark Finish',
          usage: 'Premium residential window frames'
        },
        featuredType: 'none',
        isActive: true
      },
      {
        name: 'Teak Sliding Door',
        category: 'construction',
        subcategory: 'doors',
        quantity: 15,
        unit: 'pieces',
        price: 35000,
        size: '84x72x2 inches',
        description: 'Modern teak sliding door system perfect for contemporary homes. Features smooth sliding mechanism and excellent thermal insulation.',
        attributes: {
          productType: 'Sliding Door',
          woodType: 'Teak',
          grade: 'A+',
          finish: 'Natural Wood',
          usage: 'Modern residential sliding doors'
        },
        featuredType: 'best',
        isActive: true
      },
      {
        name: 'Mahogany French Door',
        category: 'construction',
        subcategory: 'doors',
        quantity: 12,
        unit: 'pieces',
        price: 42000,
        size: '84x36x2 inches',
        description: 'Classic mahogany French door with glass panels, combining traditional craftsmanship with modern functionality. Perfect for elegant interiors.',
        attributes: {
          productType: 'French Door',
          woodType: 'Mahogany',
          grade: 'A+',
          finish: 'Classic Dark Finish',
          usage: 'Elegant interior French doors'
        },
        featuredType: 'best',
        isActive: true
      },
      {
        name: 'Teak Bay Window Frame',
        category: 'construction',
        subcategory: 'windows',
        quantity: 8,
        unit: 'pieces',
        price: 45000,
        size: '120x48x4 inches',
        description: 'Custom teak bay window frame designed for architectural excellence. Provides panoramic views while maintaining structural integrity.',
        attributes: {
          productType: 'Bay Window Frame',
          woodType: 'Teak',
          grade: 'A+',
          finish: 'Natural Wood',
          usage: 'Architectural bay windows'
        },
        featuredType: 'best',
        isActive: true
      },
      {
        name: 'Mahogany Casement Window',
        category: 'construction',
        subcategory: 'windows',
        quantity: 18,
        unit: 'pieces',
        price: 19500,
        size: '36x48x4 inches',
        description: 'Traditional mahogany casement window frame with hinged opening mechanism. Offers excellent ventilation and classic aesthetic appeal.',
        attributes: {
          productType: 'Casement Window',
          woodType: 'Mahogany',
          grade: 'A',
          finish: 'Traditional Dark Finish',
          usage: 'Traditional residential windows'
        },
        featuredType: 'none',
        isActive: true
      }
    ];

    console.log('\nAdding the following construction material products:');
    console.log('==================================================');
    for (const product of constructionProducts) {
      console.log(`${product.name}\n   Wood: ${product.attributes.woodType} | Price: ₹${product.price} | Quantity: ${product.quantity}\n   Category: ${product.category} > ${product.subcategory}\n`);
    }

    await Product.insertMany(constructionProducts);
    console.log(`\n✅ Successfully added ${constructionProducts.length} construction material products to the database!`);

    const totalProducts = await Product.countDocuments();
    const timberCount = await Product.countDocuments({ category: 'timber' });
    const furnitureCount = await Product.countDocuments({ category: 'furniture' });
    const constructionCount = await Product.countDocuments({ category: 'construction' });

    console.log('\n📊 Database Summary:');
    console.log('==============================');
    console.log(`Total Products: ${totalProducts}`);
    console.log(`Timber Products: ${timberCount}`);
    console.log(`Furniture Products: ${furnitureCount}`);
    console.log(`Construction Materials: ${constructionCount}`);

  } catch (error) {
    console.error('Error adding construction products:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed.');
  }
};

addConstructionProducts();
