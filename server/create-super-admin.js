// create-admin.js
// This script creates the admin user in MongoDB

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/timber-website');
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'adminjctimber@12' });
    
    if (existingAdmin) {
      console.log('Admin already exists. Updating...');
      
      // Update existing admin
      existingAdmin.name = 'JC Timber Admin';
      existingAdmin.password = 'jctimber123';
      existingAdmin.role = 'admin';
      
      await existingAdmin.save();
      console.log('✅ Admin updated successfully');
    } else {
      // Create new admin
      const admin = new User({
        name: 'JC Timber Admin',
        email: 'adminjctimber@12',
        password: 'jctimber123',
        role: 'admin',
        phone: '9999999999'
      });

      await admin.save();
      console.log('✅ Admin created successfully');
    }

    // Verify the admin
    const verifyAdmin = await User.findOne({ email: 'adminjctimber@12' });
    console.log('Admin Details:');
    console.log('- Name:', verifyAdmin.name);
    console.log('- Email:', verifyAdmin.email);
    console.log('- Role:', verifyAdmin.role);
    console.log('- Phone:', verifyAdmin.phone);
    console.log('- Created:', verifyAdmin.createdAt);

  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

// Run the script
createAdmin();
