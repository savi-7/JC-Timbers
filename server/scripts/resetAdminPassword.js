import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';

dotenv.config();

const resetAdminPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find admin user
    const adminUser = await User.findOne({ role: 'admin' });
    if (adminUser) {
      // Reset password to a known value
      adminUser.password = 'admin123';
      await adminUser.save();
      console.log('✅ Admin password reset to: admin123');
      console.log('👤 Admin user:', adminUser.email);
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

resetAdminPassword();
