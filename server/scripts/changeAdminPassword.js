import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';

dotenv.config();

const changeAdminPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find admin user
    const adminUser = await User.findOne({ role: 'admin' });
    if (adminUser) {
      // Change password to Jctimber@12
      adminUser.password = 'Jctimber@12';
      await adminUser.save();
      
      console.log('✅ Admin password changed successfully!');
      console.log('👤 Admin user:', adminUser.email);
      console.log('🔑 New password: Jctimber@12');
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

changeAdminPassword();
