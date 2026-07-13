import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';

dotenv.config();

const checkCustomers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all customers
    const customers = await User.find({ role: 'customer' })
      .select('name email phone address createdAt lastLogin status')
      .sort({ createdAt: -1 });
    
    console.log(`📊 Found ${customers.length} customers in database:`);
    console.log('');
    
    customers.forEach((customer, index) => {
      console.log(`${index + 1}. ${customer.name}`);
      console.log(`   Email: ${customer.email}`);
      console.log(`   Phone: ${customer.phone || 'Not provided'}`);
      console.log(`   Address: ${customer.address || 'Not provided'}`);
      console.log(`   Status: ${customer.status || 'active'}`);
      console.log(`   Created: ${customer.createdAt ? customer.createdAt.toLocaleDateString() : 'Unknown'}`);
      console.log(`   Last Login: ${customer.lastLogin ? customer.lastLogin.toLocaleDateString() : 'Never'}`);
      console.log(`   ID: ${customer._id}`);
      console.log('');
    });

    // Also check admin users
    const admins = await User.find({ role: 'admin' });
    console.log(`👤 Found ${admins.length} admin users:`);
    admins.forEach(admin => {
      console.log(`   - ${admin.name} (${admin.email})`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

checkCustomers();
