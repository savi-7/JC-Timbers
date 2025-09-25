import mongoose from 'mongoose';
import FAQ from '../src/models/FAQ.js';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jc-timbers');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedFAQs = async () => {
  try {
    await connectDB();

    // Clear existing FAQs
    await FAQ.deleteMany({});
    console.log('🗑️ Cleared existing FAQs');

    // Seed initial FAQ data
    const faqData = [
      // Shipping & Delivery
      {
        category: "Shipping & Delivery",
        question: "How long does shipping take?",
        answer: "Standard shipping takes 3-5 business days for metro cities and 5-7 business days for other locations. Express shipping is available for 1-2 day delivery in select cities.",
        order: 1
      },
      {
        category: "Shipping & Delivery",
        question: "What are the delivery charges?",
        answer: "Free delivery on orders above ₹5,000. For orders below ₹5,000, delivery charges are ₹200 for metro cities and ₹300 for other locations.",
        order: 2
      },
      {
        category: "Shipping & Delivery",
        question: "Do you deliver to all locations?",
        answer: "We deliver to most major cities in India. You can check delivery availability by entering your pincode on our website.",
        order: 3
      },
      
      // Returns & Exchanges
      {
        category: "Returns & Exchanges",
        question: "What is your return policy?",
        answer: "We offer a 7-day return policy for unused items in original packaging. Custom-made furniture cannot be returned unless there's a manufacturing defect.",
        order: 1
      },
      {
        category: "Returns & Exchanges",
        question: "How can I initiate a return?",
        answer: "Contact our customer service team at support@jctimbers.com or call us at +91-9876543210. We'll guide you through the return process.",
        order: 2
      },
      {
        category: "Returns & Exchanges",
        question: "Are there any return charges?",
        answer: "Return shipping is free for defective items. For other returns, return shipping charges will be deducted from your refund amount.",
        order: 3
      },
      
      // Product Information
      {
        category: "Product Information",
        question: "What types of wood do you use?",
        answer: "We use premium hardwoods including Teak, Rosewood, Oak, and Mahogany. All our wood is sustainably sourced and certified.",
        order: 1
      },
      {
        category: "Product Information",
        question: "How do I care for my furniture?",
        answer: "Regular dusting with a soft cloth and occasional polishing with wood-specific products will keep your furniture looking new. Avoid direct sunlight and excessive moisture.",
        order: 2
      },
      {
        category: "Product Information",
        question: "Do you offer warranties?",
        answer: "Yes, we offer a 2-year warranty against manufacturing defects and a 1-year warranty on hardware and finishes.",
        order: 3
      }
    ];

    await FAQ.insertMany(faqData);
    console.log('✅ Seeded FAQ data successfully');

    // Verify the data
    const count = await FAQ.countDocuments();
    console.log(`📊 Total FAQs created: ${count}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding FAQs:', error);
    process.exit(1);
  }
};

seedFAQs();




