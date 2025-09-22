import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function updateUserTimestamps() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const userId = new mongoose.Types.ObjectId('68d09630b52c69ca33638794');
    
    const result = await db.collection('users').updateOne(
      { _id: userId },
      { 
        $set: { 
          createdAt: new Date('2025-09-21T10:00:00.000Z'),
          updatedAt: new Date()
        }
      }
    );
    
    console.log('✅ Direct database update result:', result);
    
    // Verify the update
    const user = await db.collection('users').findOne({ _id: userId });
    console.log('✅ Updated user:', {
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
  }
}

updateUserTimestamps();
