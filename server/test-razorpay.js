import Razorpay from 'razorpay';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('\n🔍 Testing Razorpay Configuration...\n');

// Check if credentials exist
console.log('📋 Environment Variables:');
console.log('  RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? '✓ Found' : '✗ Missing');
console.log('  RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? '✓ Found' : '✗ Missing');
console.log('  Key ID Value:', process.env.RAZORPAY_KEY_ID);
console.log('  Key Secret Length:', process.env.RAZORPAY_KEY_SECRET?.length || 0, 'characters\n');

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error('❌ Razorpay credentials not found in environment variables!');
  process.exit(1);
}

// Initialize Razorpay
console.log('🔧 Initializing Razorpay instance...');
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});
console.log('✓ Razorpay instance created\n');

// Test creating an order
console.log('📦 Creating test order...');
const options = {
  amount: 100, // 1 rupee in paise
  currency: 'INR',
  receipt: `test_${Date.now().toString().slice(-10)}`, // Max 40 chars
  notes: {
    test: 'true'
  }
};

razorpay.orders.create(options)
  .then(order => {
    console.log('✅ SUCCESS! Razorpay is working correctly!\n');
    console.log('Test Order Details:');
    console.log('  Order ID:', order.id);
    console.log('  Amount:', order.amount / 100, 'INR');
    console.log('  Currency:', order.currency);
    console.log('  Status:', order.status);
    console.log('\n🎉 Your Razorpay integration is ready to use!\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ FAILED! Razorpay test failed!\n');
    console.error('Error Details:');
    console.error('  Message:', error.message);
    console.error('  Description:', error.description);
    console.error('  Error Code:', error.error?.code);
    console.error('  Status Code:', error.statusCode);
    console.error('\nFull Error:', error);
    console.error('\n💡 Possible Solutions:');
    console.error('  1. Check if Key ID and Key Secret are correct');
    console.error('  2. Verify keys are from the correct Razorpay account');
    console.error('  3. Check if test mode keys start with "rzp_test_"');
    console.error('  4. Ensure no extra spaces in .env file');
    console.error('  5. Check internet connection\n');
    process.exit(1);
  });

