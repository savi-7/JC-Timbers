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
  thickness: Number
}, {
  timestamps: true
});

const Product = mongoose.model('Product', ProductSchema);

const addFurnitureProducts = async () => {
  try {
    await connectDB();

    console.log('Adding furniture products to the database...\n');

    const furnitureProducts = [
      {
        name: "Premium Teak Sofa Set",
        category: "furniture",
        subcategory: "sofa",
        price: 45000,
        quantity: 15,
        unit: "set",
        description: "Elegant 3-seater sofa set crafted from premium teak wood with comfortable cushions and modern design. Perfect for living rooms and adds sophistication to any space.",
        images: [],
        attributes: {
          woodType: "Teak",
          grade: "A+",
          finish: "Natural Wood Finish",
          seatingCapacity: "3+2",
          dimensions: "84x36x32 inches"
        },
        featuredType: "featured",
        size: "84x36x32 inches",
        woodType: "Teak",
        grade: "A+"
      },
      {
        name: "Mahogany Dining Table",
        category: "furniture",
        subcategory: "dining table",
        price: 32000,
        quantity: 12,
        unit: "piece",
        description: "Sturdy 6-seater dining table made from high-quality mahogany wood. Features a rich dark finish and can accommodate up to 6 people comfortably.",
        images: [],
        attributes: {
          woodType: "Mahogany",
          grade: "A",
          finish: "Dark Wood Finish",
          seatingCapacity: "6",
          dimensions: "72x36x30 inches"
        },
        featuredType: "featured",
        size: "72x36x30 inches",
        woodType: "Mahogany",
        grade: "A"
      },
      {
        name: "Teak Study Table",
        category: "furniture",
        subcategory: "study table",
        price: 18500,
        quantity: 20,
        unit: "piece",
        description: "Functional study table with drawers and shelves, perfect for students and professionals. Made from durable teak wood with smooth finish.",
        images: [],
        attributes: {
          woodType: "Teak",
          grade: "A",
          finish: "Natural Finish",
          drawers: "3",
          shelves: "2",
          dimensions: "48x24x30 inches"
        },
        featuredType: "none",
        size: "48x24x30 inches",
        woodType: "Teak",
        grade: "A"
      },
      {
        name: "Mahogany Office Chair",
        category: "furniture",
        subcategory: "chairs",
        price: 8500,
        quantity: 25,
        unit: "piece",
        description: "Ergonomic office chair with mahogany frame and comfortable cushioning. Adjustable height and swivel feature for maximum comfort during work.",
        images: [],
        attributes: {
          woodType: "Mahogany",
          grade: "A",
          finish: "Dark Wood Finish",
          features: "Adjustable Height, Swivel",
          dimensions: "24x24x42 inches"
        },
        featuredType: "none",
        size: "24x24x42 inches",
        woodType: "Mahogany",
        grade: "A"
      },
      {
        name: "Teak Dining Chairs Set",
        category: "furniture",
        subcategory: "chairs",
        price: 22000,
        quantity: 18,
        unit: "set",
        description: "Set of 4 elegant dining chairs crafted from premium teak wood. Features comfortable seating and matches perfectly with teak dining tables.",
        images: [],
        attributes: {
          woodType: "Teak",
          grade: "A+",
          finish: "Natural Wood Finish",
          quantity: "4 chairs",
          dimensions: "18x20x36 inches each"
        },
        featuredType: "featured",
        size: "18x20x36 inches each",
        woodType: "Teak",
        grade: "A+"
      },
      {
        name: "Mahogany King Size Bed",
        category: "furniture",
        subcategory: "bed",
        price: 55000,
        quantity: 8,
        unit: "piece",
        description: "Luxurious king-size bed frame made from solid mahogany wood. Features elegant headboard and footboard design with storage drawers underneath.",
        images: [],
        attributes: {
          woodType: "Mahogany",
          grade: "A+",
          finish: "Dark Wood Finish",
          bedSize: "King Size",
          storage: "Under-bed drawers",
          dimensions: "78x84x36 inches"
        },
        featuredType: "featured",
        size: "78x84x36 inches",
        woodType: "Mahogany",
        grade: "A+"
      },
      {
        name: "Teak Coffee Table",
        category: "furniture",
        subcategory: "coffee table",
        price: 12500,
        quantity: 22,
        unit: "piece",
        description: "Modern coffee table with clean lines and teak wood construction. Perfect centerpiece for living rooms with storage shelf underneath.",
        images: [],
        attributes: {
          woodType: "Teak",
          grade: "A",
          finish: "Natural Finish",
          features: "Storage shelf",
          dimensions: "48x24x18 inches"
        },
        featuredType: "none",
        size: "48x24x18 inches",
        woodType: "Teak",
        grade: "A"
      },
      {
        name: "Mahogany Bookshelf",
        category: "furniture",
        subcategory: "bookshelf",
        price: 16800,
        quantity: 16,
        unit: "piece",
        description: "5-tier bookshelf made from mahogany wood with adjustable shelves. Perfect for organizing books, decorative items, and office supplies.",
        images: [],
        attributes: {
          woodType: "Mahogany",
          grade: "A",
          finish: "Dark Wood Finish",
          shelves: "5 adjustable",
          dimensions: "36x12x72 inches"
        },
        featuredType: "none",
        size: "36x12x72 inches",
        woodType: "Mahogany",
        grade: "A"
      }
    ];

    console.log('Adding the following furniture products:');
    console.log('=' .repeat(50));
    
    furnitureProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   Wood: ${product.woodType} | Price: ₹${product.price} | Quantity: ${product.quantity}`);
      console.log(`   Category: ${product.category} > ${product.subcategory}`);
      console.log('');
    });

    // Insert products into database
    const insertedProducts = await Product.insertMany(furnitureProducts);
    
    console.log(`\n✅ Successfully added ${insertedProducts.length} furniture products to the database!`);

    // Verify the insertion
    const totalProducts = await Product.countDocuments();
    const furnitureCount = await Product.countDocuments({ category: 'furniture' });
    const timberCount = await Product.countDocuments({ category: 'timber' });

    console.log('\n📊 Database Summary:');
    console.log('=' .repeat(30));
    console.log(`Total Products: ${totalProducts}`);
    console.log(`Timber Products: ${timberCount}`);
    console.log(`Furniture Products: ${furnitureCount}`);

  } catch (error) {
    console.error('Error adding furniture products:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
  }
};

// Run the script
addFurnitureProducts();
