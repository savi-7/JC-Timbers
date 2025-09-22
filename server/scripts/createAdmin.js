import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';

dotenv.config();

const createAdminUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin user exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('✅ Admin user already exists:', existingAdmin.email);
    } else {
      // Create admin user
      const adminUser = new User({
        name: 'Admin User',
        email: 'admin@jctimbers.com',
        password: 'admin123',
        role: 'admin',
        status: 'active'
      });
      
      await adminUser.save();
      console.log('✅ Created admin user:', adminUser.email);
    }

    // List all users
    const allUsers = await User.find({});
    console.log('\n📊 All users in database:');
    allUsers.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - Role: ${user.role} - Status: ${user.status || 'active'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

createAdminUser();
