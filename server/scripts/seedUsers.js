import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';

dotenv.config();

const sampleUsers = [
  {
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password123',
    phone: '+91 9876543210',
    address: '123 Main Street, Mumbai, Maharashtra 400001',
    role: 'customer',
    status: 'active'
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    password: 'password123',
    phone: '+91 9876543211',
    address: '456 Park Avenue, Delhi, Delhi 110001',
    role: 'customer',
    status: 'active'
  },
  {
    name: 'Mike Johnson',
    email: 'mike.johnson@example.com',
    password: 'password123',
    phone: '+91 9876543212',
    address: '789 Garden Road, Bangalore, Karnataka 560001',
    role: 'customer',
    status: 'inactive'
  },
  {
    name: 'Sarah Wilson',
    email: 'sarah.wilson@example.com',
    password: 'password123',
    phone: '+91 9876543213',
    address: '321 Lake View, Chennai, Tamil Nadu 600001',
    role: 'customer',
    status: 'active'
  },
  {
    name: 'David Brown',
    email: 'david.brown@example.com',
    password: 'password123',
    phone: '+91 9876543214',
    address: '654 Hill Station, Pune, Maharashtra 411001',
    role: 'customer',
    status: 'active'
  }
];

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing users (except admin)
    await User.deleteMany({ role: 'customer' });
    console.log('🧹 Cleared existing customer users');

    // Add sample users
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`✅ Added user: ${user.name} (${user.email})`);
    }

    console.log('\n🎉 Sample users seeded successfully!');
    console.log('📊 Summary:');
    console.log(`   - Total users added: ${sampleUsers.length}`);
    console.log(`   - Active users: ${sampleUsers.filter(u => u.status === 'active').length}`);
    console.log(`   - Inactive users: ${sampleUsers.filter(u => u.status === 'inactive').length}`);

  } catch (error) {
    console.error('❌ Error seeding users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

seedUsers();
