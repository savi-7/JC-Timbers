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

// Sample base64 images (small placeholder images)
const getPlaceholderImage = (type) => {
  // These are small base64 encoded placeholder images
  const images = {
    timber: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
    furniture: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
    construction: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
  };
  return images[type];
};

// Timber Products
const timberProducts = [
  {
    name: "Premium Teak Wood Planks",
    description: "High-quality teak wood planks perfect for furniture making and construction. Known for its durability and natural resistance to weather.",
    category: "timber",
    price: 2500,
    quantity: 150,
    unit: "cubic ft",
    attributes: {
      woodType: "Teak",
      grade: "A+",
      dimension: "12ft x 6in x 2in",
      moistureContent: "12-15%",
      origin: "Kerala, India"
    },
    images: [{
      data: getPlaceholderImage('timber'),
      contentType: 'image/jpeg',
      filename: 'timber-placeholder.jpg'
    }]
  },
  {
    name: "Rosewood Timber Blocks",
    description: "Premium rosewood timber blocks ideal for luxury furniture and decorative items. Rich grain pattern and excellent workability.",
    category: "timber",
    price: 3200,
    quantity: 85,
    unit: "cubic ft",
    attributes: {
      woodType: "Rosewood",
      grade: "Premium",
      dimension: "10ft x 8in x 3in",
      moistureContent: "10-12%",
      origin: "Karnataka, India"
    },
    images: [{
      data: getPlaceholderImage('timber'),
      contentType: 'image/jpeg',
      filename: 'timber-placeholder.jpg'
    }]
  },
  {
    name: "Sandalwood Logs",
    description: "Fragrant sandalwood logs perfect for carving, incense making, and premium woodwork. Highly valued for its aromatic properties.",
    category: "timber",
    price: 4500,
    quantity: 60,
    unit: "cubic ft",
    attributes: {
      woodType: "Sandalwood",
      grade: "AAA",
      dimension: "8ft x 6in x 4in",
      moistureContent: "8-10%",
      origin: "Mysore, India"
    },
    images: [{
      data: getPlaceholderImage('timber'),
      contentType: 'image/jpeg',
      filename: 'timber-placeholder.jpg'
    }]
  },
  {
    name: "Sal Wood Beams",
    description: "Strong and durable Sal wood beams suitable for construction and heavy-duty furniture. Excellent load-bearing capacity.",
    category: "timber",
    price: 1800,
    quantity: 200,
    unit: "cubic ft",
    attributes: {
      woodType: "Sal",
      grade: "A",
      dimension: "16ft x 10in x 6in",
      moistureContent: "14-16%",
      origin: "Madhya Pradesh, India"
    },
    images: [{
      data: getPlaceholderImage('timber'),
      contentType: 'image/jpeg',
      filename: 'timber-placeholder.jpg'
    }]
  },
  {
    name: "Deodar Cedar Planks",
    description: "Lightweight and naturally insect-resistant Deodar cedar planks. Perfect for outdoor furniture and construction.",
    category: "timber",
    price: 2200,
    quantity: 120,
    unit: "cubic ft",
    attributes: {
      woodType: "Deodar Cedar",
      grade: "A+",
      dimension: "14ft x 8in x 2in",
      moistureContent: "11-13%",
      origin: "Himachal Pradesh, India"
    },
    images: [{
      data: getPlaceholderImage('timber'),
      contentType: 'image/jpeg',
      filename: 'timber-placeholder.jpg'
    }]
  },
  {
    name: "Mahogany Timber Sheets",
    description: "Rich reddish-brown mahogany timber sheets with fine grain. Ideal for high-end furniture and cabinetry.",
    category: "timber",
    price: 2800,
    quantity: 95,
    unit: "cubic ft",
    attributes: {
      woodType: "Mahogany",
      grade: "Premium",
      dimension: "12ft x 10in x 1.5in",
      moistureContent: "9-11%",
      origin: "Assam, India"
    },
    images: [{
      data: getPlaceholderImage('timber'),
      contentType: 'image/jpeg',
      filename: 'timber-placeholder.jpg'
    }]
  },
  {
    name: "Oak Wood Boards",
    description: "Dense and strong oak wood boards with beautiful grain patterns. Excellent for flooring and furniture making.",
    category: "timber",
    price: 2100,
    quantity: 110,
    unit: "cubic ft",
    attributes: {
      woodType: "Oak",
      grade: "A",
      dimension: "10ft x 12in x 1in",
      moistureContent: "12-14%",
      origin: "Uttarakhand, India"
    },
    images: [{
      data: getPlaceholderImage('timber'),
      contentType: 'image/jpeg',
      filename: 'timber-placeholder.jpg'
    }]
  },
  {
    name: "Pine Timber Strips",
    description: "Lightweight pine timber strips perfect for paneling, molding, and decorative work. Easy to work with.",
    category: "timber",
    price: 1500,
    quantity: 180,
    unit: "cubic ft",
    attributes: {
      woodType: "Pine",
      grade: "B+",
      dimension: "8ft x 4in x 0.5in",
      moistureContent: "15-17%",
      origin: "Punjab, India"
    },
    images: [{
      data: getPlaceholderImage('timber'),
      contentType: 'image/jpeg',
      filename: 'timber-placeholder.jpg'
    }]
  },
  {
    name: "Bamboo Poles",
    description: "Eco-friendly bamboo poles suitable for construction, furniture, and decorative purposes. Sustainable and renewable.",
    category: "timber",
    price: 800,
    quantity: 300,
    unit: "pieces",
    attributes: {
      woodType: "Bamboo",
      grade: "A",
      dimension: "12ft x 3in diameter",
      moistureContent: "8-10%",
      origin: "West Bengal, India"
    },
    images: [{
      data: getPlaceholderImage('timber'),
      contentType: 'image/jpeg',
      filename: 'timber-placeholder.jpg'
    }]
  },
  {
    name: "Sheesham Wood Blocks",
    description: "Hard and durable Sheesham wood blocks with attractive grain. Perfect for furniture making and woodworking.",
    category: "timber",
    price: 1900,
    quantity: 140,
    unit: "cubic ft",
    attributes: {
      woodType: "Sheesham",
      grade: "A+",
      dimension: "10ft x 8in x 3in",
      moistureContent: "13-15%",
      origin: "Rajasthan, India"
    },
    images: [{
      data: getPlaceholderImage('timber'),
      contentType: 'image/jpeg',
      filename: 'timber-placeholder.jpg'
    }]
  }
];

// Furniture Products
const furnitureProducts = [
  {
    name: "Classic Teak Dining Table",
    description: "Elegant 6-seater teak dining table with traditional Indian craftsmanship. Perfect for family gatherings and special occasions.",
    category: "furniture",
    price: 45000,
    quantity: 25,
    unit: "pieces",
    attributes: {
      furnitureType: "Dining Table",
      material: "Solid Teak Wood",
      finish: "Natural Polish",
      dimensions: "72in x 36in x 30in",
      seatingCapacity: "6 persons",
      warranty: "2 years"
    },
    images: [{
      data: getPlaceholderImage('furniture'),
      contentType: 'image/jpeg',
      filename: 'furniture-placeholder.jpg'
    }]
  },
  {
    name: "Rosewood Sofa Set",
    description: "Luxurious 3+2+1 rosewood sofa set with premium upholstery. Handcrafted with attention to detail and comfort.",
    category: "furniture",
    price: 85000,
    quantity: 15,
    unit: "pieces",
    attributes: {
      furnitureType: "Sofa Set",
      material: "Rosewood Frame",
      finish: "Mahogany Stain",
      dimensions: "3+2+1 Seater",
      upholstery: "Premium Fabric",
      warranty: "3 years"
    },
    images: [{
      data: getPlaceholderImage('furniture'),
      contentType: 'image/jpeg',
      filename: 'furniture-placeholder.jpg'
    }]
  },
  {
    name: "Sandalwood Wardrobe",
    description: "Spacious 4-door sandalwood wardrobe with mirror panels. Features multiple shelves and hanging space for organized storage.",
    category: "furniture",
    price: 65000,
    quantity: 20,
    unit: "pieces",
    attributes: {
      furnitureType: "Wardrobe",
      material: "Sandalwood",
      finish: "Natural Polish",
      dimensions: "72in x 24in x 84in",
      doors: "4 doors",
      warranty: "2 years"
    },
    images: [{
      data: getPlaceholderImage('furniture'),
      contentType: 'image/jpeg',
      filename: 'furniture-placeholder.jpg'
    }]
  },
  {
    name: "Mahogany Bookshelf",
    description: "5-tier mahogany bookshelf with adjustable shelves. Perfect for home libraries and office spaces.",
    category: "furniture",
    price: 28000,
    quantity: 30,
    unit: "pieces",
    attributes: {
      furnitureType: "Bookshelf",
      material: "Solid Mahogany",
      finish: "Dark Stain",
      dimensions: "36in x 12in x 72in",
      shelves: "5 adjustable",
      warranty: "1 year"
    },
    images: [{
      data: getPlaceholderImage('furniture'),
      contentType: 'image/jpeg',
      filename: 'furniture-placeholder.jpg'
    }]
  },
  {
    name: "Oak Coffee Table",
    description: "Modern oak coffee table with glass top and storage drawer. Contemporary design perfect for living rooms.",
    category: "furniture",
    price: 22000,
    quantity: 35,
    unit: "pieces",
    attributes: {
      furnitureType: "Coffee Table",
      material: "Oak Wood",
      finish: "Natural Finish",
      dimensions: "48in x 24in x 18in",
      features: "Glass top, Storage drawer",
      warranty: "1 year"
    },
    images: [{
      data: getPlaceholderImage('furniture'),
      contentType: 'image/jpeg',
      filename: 'furniture-placeholder.jpg'
    }]
  },
  {
    name: "Pine Bed Frame",
    description: "Queen-size pine bed frame with headboard and footboard. Simple yet elegant design for modern bedrooms.",
    category: "furniture",
    price: 35000,
    quantity: 40,
    unit: "pieces",
    attributes: {
      furnitureType: "Bed Frame",
      material: "Pine Wood",
      finish: "White Wash",
      dimensions: "60in x 80in x 36in",
      mattressSize: "Queen",
      warranty: "2 years"
    },
    images: [{
      data: getPlaceholderImage('furniture'),
      contentType: 'image/jpeg',
      filename: 'furniture-placeholder.jpg'
    }]
  },
  {
    name: "Sheesham Office Desk",
    description: "Executive sheesham office desk with drawers and cable management. Professional design for home and office use.",
    category: "furniture",
    price: 42000,
    quantity: 25,
    unit: "pieces",
    attributes: {
      furnitureType: "Office Desk",
      material: "Sheesham Wood",
      finish: "Dark Polish",
      dimensions: "60in x 30in x 30in",
      features: "3 drawers, Cable management",
      warranty: "2 years"
    },
    images: [{
      data: getPlaceholderImage('furniture'),
      contentType: 'image/jpeg',
      filename: 'furniture-placeholder.jpg'
    }]
  },
  {
    name: "Bamboo Dining Chairs",
    description: "Set of 4 eco-friendly bamboo dining chairs. Lightweight, durable, and environmentally conscious.",
    category: "furniture",
    price: 15000,
    quantity: 50,
    unit: "pieces",
    attributes: {
      furnitureType: "Dining Chairs",
      material: "Bamboo",
      finish: "Natural",
      dimensions: "18in x 18in x 32in",
      quantity: "Set of 4",
      warranty: "1 year"
    },
    images: [{
      data: getPlaceholderImage('furniture'),
      contentType: 'image/jpeg',
      filename: 'furniture-placeholder.jpg'
    }]
  },
  {
    name: "Deodar Side Table",
    description: "Handcrafted deodar side table with intricate carving. Perfect accent piece for living rooms and bedrooms.",
    category: "furniture",
    price: 18000,
    quantity: 45,
    unit: "pieces",
    attributes: {
      furnitureType: "Side Table",
      material: "Deodar Cedar",
      finish: "Hand Carved",
      dimensions: "24in x 24in x 24in",
      features: "Intricate carving",
      warranty: "1 year"
    },
    images: [{
      data: getPlaceholderImage('furniture'),
      contentType: 'image/jpeg',
      filename: 'furniture-placeholder.jpg'
    }]
  },
  {
    name: "Sal Wood TV Unit",
    description: "Modern sal wood TV unit with storage compartments and LED lighting. Perfect for contemporary living rooms.",
    category: "furniture",
    price: 38000,
    quantity: 30,
    unit: "pieces",
    attributes: {
      furnitureType: "TV Unit",
      material: "Sal Wood",
      finish: "Modern Polish",
      dimensions: "72in x 18in x 24in",
      features: "Storage compartments, LED lighting",
      warranty: "2 years"
    },
    images: [{
      data: getPlaceholderImage('furniture'),
      contentType: 'image/jpeg',
      filename: 'furniture-placeholder.jpg'
    }]
  }
];

// Construction Material Products
const constructionProducts = [
  {
    name: "Premium Teak Door Frame",
    description: "High-quality teak door frame suitable for main entrance doors. Weather-resistant and durable for long-term use.",
    category: "construction",
    price: 12000,
    quantity: 50,
    unit: "pieces",
    attributes: {
      productType: "Door Frame",
      material: "Teak Wood",
      finish: "Natural Polish",
      dimensions: "84in x 36in x 4in",
      thickness: "4 inches",
      warranty: "5 years"
    },
    images: [{
      data: getPlaceholderImage('construction'),
      contentType: 'image/jpeg',
      filename: 'construction-placeholder.jpg'
    }]
  },
  {
    name: "Rosewood Window Frames",
    description: "Elegant rosewood window frames with traditional design. Perfect for heritage buildings and modern homes.",
    category: "construction",
    price: 8500,
    quantity: 75,
    unit: "pieces",
    attributes: {
      productType: "Window Frame",
      material: "Rosewood",
      finish: "Dark Stain",
      dimensions: "48in x 36in x 3in",
      thickness: "3 inches",
      warranty: "3 years"
    },
    images: [{
      data: getPlaceholderImage('construction'),
      contentType: 'image/jpeg',
      filename: 'construction-placeholder.jpg'
    }]
  },
  {
    name: "Sal Wood Beams",
    description: "Structural sal wood beams for construction and roofing. High load-bearing capacity and weather resistance.",
    category: "construction",
    price: 15000,
    quantity: 40,
    unit: "pieces",
    attributes: {
      productType: "Structural Beam",
      material: "Sal Wood",
      finish: "Treated",
      dimensions: "16ft x 10in x 8in",
      loadCapacity: "High",
      warranty: "10 years"
    },
    images: [{
      data: getPlaceholderImage('construction'),
      contentType: 'image/jpeg',
      filename: 'construction-placeholder.jpg'
    }]
  },
  {
    name: "Mahogany Flooring Planks",
    description: "Premium mahogany flooring planks with tongue and groove fitting. Perfect for luxury homes and offices.",
    category: "construction",
    price: 450,
    quantity: 500,
    unit: "pieces",
    attributes: {
      productType: "Flooring",
      material: "Mahogany",
      finish: "Pre-finished",
      dimensions: "48in x 6in x 0.75in",
      fitting: "Tongue & Groove",
      warranty: "15 years"
    },
    images: [{
      data: getPlaceholderImage('construction'),
      contentType: 'image/jpeg',
      filename: 'construction-placeholder.jpg'
    }]
  },
  {
    name: "Oak Staircase Components",
    description: "Complete oak staircase components including treads, risers, and handrails. Ready for installation.",
    category: "construction",
    price: 25000,
    quantity: 20,
    unit: "pieces",
    attributes: {
      productType: "Staircase",
      material: "Oak Wood",
      finish: "Natural Polish",
      dimensions: "Custom sizes available",
      components: "Treads, Risers, Handrails",
      warranty: "5 years"
    },
    images: [{
      data: getPlaceholderImage('construction'),
      contentType: 'image/jpeg',
      filename: 'construction-placeholder.jpg'
    }]
  },
  {
    name: "Pine Wall Paneling",
    description: "Decorative pine wall paneling for interior decoration. Easy to install and maintain.",
    category: "construction",
    price: 180,
    quantity: 300,
    unit: "pieces",
    attributes: {
      productType: "Wall Paneling",
      material: "Pine Wood",
      finish: "Pre-sanded",
      dimensions: "48in x 8in x 0.5in",
      installation: "Easy",
      warranty: "2 years"
    },
    images: [{
      data: getPlaceholderImage('construction'),
      contentType: 'image/jpeg',
      filename: 'construction-placeholder.jpg'
    }]
  },
  {
    name: "Bamboo Scaffolding Poles",
    description: "Eco-friendly bamboo scaffolding poles for construction work. Lightweight, strong, and sustainable.",
    category: "construction",
    price: 120,
    quantity: 200,
    unit: "pieces",
    attributes: {
      productType: "Scaffolding",
      material: "Bamboo",
      finish: "Natural",
      dimensions: "12ft x 3in diameter",
      strength: "High",
      warranty: "1 year"
    },
    images: [{
      data: getPlaceholderImage('construction'),
      contentType: 'image/jpeg',
      filename: 'construction-placeholder.jpg'
    }]
  },
  {
    name: "Sheesham Ceiling Beams",
    description: "Decorative sheesham ceiling beams for architectural enhancement. Adds elegance to any space.",
    category: "construction",
    price: 8500,
    quantity: 60,
    unit: "pieces",
    attributes: {
      productType: "Ceiling Beam",
      material: "Sheesham",
      finish: "Polished",
      dimensions: "12ft x 8in x 6in",
      purpose: "Decorative",
      warranty: "3 years"
    },
    images: [{
      data: getPlaceholderImage('construction'),
      contentType: 'image/jpeg',
      filename: 'construction-placeholder.jpg'
    }]
  },
  {
    name: "Deodar Roofing Sheets",
    description: "Weather-resistant deodar roofing sheets for traditional and modern construction. Natural insulation properties.",
    category: "construction",
    price: 320,
    quantity: 150,
    unit: "pieces",
    attributes: {
      productType: "Roofing",
      material: "Deodar Cedar",
      finish: "Treated",
      dimensions: "48in x 12in x 1in",
      insulation: "Natural",
      warranty: "8 years"
    },
    images: [{
      data: getPlaceholderImage('construction'),
      contentType: 'image/jpeg',
      filename: 'construction-placeholder.jpg'
    }]
  },
  {
    name: "Sandalwood Door Panels",
    description: "Luxury sandalwood door panels with intricate carving. Perfect for premium homes and heritage buildings.",
    category: "construction",
    price: 18000,
    quantity: 25,
    unit: "pieces",
    attributes: {
      productType: "Door Panel",
      material: "Sandalwood",
      finish: "Hand Carved",
      dimensions: "84in x 36in x 2in",
      features: "Intricate carving",
      warranty: "5 years"
    },
    images: [{
      data: getPlaceholderImage('construction'),
      contentType: 'image/jpeg',
      filename: 'construction-placeholder.jpg'
    }]
  }
];

const seedProducts = async () => {
  try {
    await connectDB();
    
    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');
    
    // Add timber products
    console.log('Adding timber products...');
    for (const product of timberProducts) {
      const newProduct = new Product(product);
      await newProduct.save();
      console.log(`Added: ${product.name}`);
    }
    
    // Add furniture products
    console.log('Adding furniture products...');
    for (const product of furnitureProducts) {
      const newProduct = new Product(product);
      await newProduct.save();
      console.log(`Added: ${product.name}`);
    }
    
    // Add construction products
    console.log('Adding construction material products...');
    for (const product of constructionProducts) {
      const newProduct = new Product(product);
      await newProduct.save();
      console.log(`Added: ${product.name}`);
    }
    
    console.log('\n✅ Successfully added all products!');
    console.log(`📊 Summary:`);
    console.log(`   - Timber Products: ${timberProducts.length}`);
    console.log(`   - Furniture Products: ${furnitureProducts.length}`);
    console.log(`   - Construction Materials: ${constructionProducts.length}`);
    console.log(`   - Total Products: ${timberProducts.length + furnitureProducts.length + constructionProducts.length}`);
    
  } catch (error) {
    console.error('Error seeding products:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed');
  }
};

// Run the seeding function
seedProducts();
