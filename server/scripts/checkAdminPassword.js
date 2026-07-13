import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const checkAdminPassword = async () => {
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
      
      // Test common passwords
      const testPasswords = ['admin123', 'Jctimber@12', 'password', 'admin', '123456'];
      
      for (const testPassword of testPasswords) {
        try {
          const isMatch = await bcrypt.compare(testPassword, adminUser.password);
          if (isMatch) {
            console.log(`✅ Password found: "${testPassword}"`);
            break;
          } else {
            console.log(`❌ Password "${testPassword}" does not match`);
          }
        } catch (error) {
          console.log(`❌ Error testing password "${testPassword}":`, error.message);
        }
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

checkAdminPassword();
