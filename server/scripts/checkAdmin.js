import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';

dotenv.config();

const checkAdminCredentials = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find admin user
    const adminUser = await User.findOne({ role: 'admin' });
    if (adminUser) {
      console.log('👤 Admin user found:');
      console.log('   - Name:', adminUser.name);
      console.log('   - Email:', adminUser.email);
      console.log('   - Role:', adminUser.role);
      console.log('   - Status:', adminUser.status);
      console.log('   - Has password:', !!adminUser.password);
      
      if (adminUser.password) {
        console.log('   - Password hash:', adminUser.password.substring(0, 20) + '...');
      }
    } else {
      console.log('❌ No admin user found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

checkAdminCredentials();
