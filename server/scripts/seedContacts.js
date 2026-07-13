import dotenv from 'dotenv';
import connectDB from '../src/config/db.js';
import Contact from '../src/models/Contact.js';

dotenv.config();
connectDB();

const contactData = [
  {
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '9876543210',
    subject: 'Inquiry about Timber Products',
    message: 'Hi, I am interested in purchasing timber products for my construction project. Could you please provide me with information about your available products and pricing?',
    category: 'sales',
    status: 'new',
    priority: 'medium'
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '8765432109',
    subject: 'Delivery Issue',
    message: 'I placed an order last week but haven\'t received any updates about the delivery. The order number is #12345. Please help me track my order.',
    category: 'support',
    status: 'in_progress',
    priority: 'high'
  },
  {
    name: 'Mike Wilson',
    email: 'mike.wilson@email.com',
    phone: '7654321098',
    subject: 'Quality Complaint',
    message: 'The timber planks I received were not of the quality promised. Some pieces have cracks and are not suitable for my project. I need a replacement or refund.',
    category: 'complaint',
    status: 'new',
    priority: 'urgent'
  },
  {
    name: 'Emily Davis',
    email: 'emily.davis@email.com',
    phone: '6543210987',
    subject: 'Product Recommendation',
    message: 'I am looking for timber suitable for outdoor furniture. What would you recommend for durability and weather resistance?',
    category: 'general',
    status: 'resolved',
    priority: 'low',
    adminReply: {
      message: 'Thank you for your inquiry. For outdoor furniture, I recommend our Teak wood products which are naturally weather-resistant and durable. We also have treated Pine options that are more budget-friendly.',
      repliedBy: null, // Will be set when admin replies
      repliedAt: new Date()
    }
  },
  {
    name: 'Robert Brown',
    email: 'robert.brown@email.com',
    phone: '5432109876',
    subject: 'Bulk Order Inquiry',
    message: 'I am a contractor and need timber for multiple projects. Do you offer bulk discounts? What are your minimum order quantities?',
    category: 'sales',
    status: 'new',
    priority: 'medium'
  },
  {
    name: 'Lisa Anderson',
    email: 'lisa.anderson@email.com',
    phone: '4321098765',
    subject: 'Thank You',
    message: 'Just wanted to say thank you for the excellent service and quality products. The timber I received exceeded my expectations. Will definitely order again!',
    category: 'feedback',
    status: 'closed',
    priority: 'low'
  }
];

const seedContacts = async () => {
  try {
    await Contact.deleteMany({});
    console.log('🗑️ Cleared existing contacts');

    await Contact.insertMany(contactData);
    console.log('✅ Seeded contact data successfully');
    console.log(`📊 Total contacts created: ${contactData.length}`);
    
    // Display summary
    const stats = await Contact.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          new: { $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          closed: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } },
          urgent: { $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] } },
          high: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } }
        }
      }
    ]);

    console.log('📈 Contact Statistics:');
    console.log(`   Total: ${stats[0]?.total || 0}`);
    console.log(`   New: ${stats[0]?.new || 0}`);
    console.log(`   In Progress: ${stats[0]?.inProgress || 0}`);
    console.log(`   Resolved: ${stats[0]?.resolved || 0}`);
    console.log(`   Closed: ${stats[0]?.closed || 0}`);
    console.log(`   Urgent: ${stats[0]?.urgent || 0}`);
    console.log(`   High Priority: ${stats[0]?.high || 0}`);

    process.exit();
  } catch (error) {
    console.error('❌ Error seeding contact data:', error);
    process.exit(1);
  }
};

seedContacts();



