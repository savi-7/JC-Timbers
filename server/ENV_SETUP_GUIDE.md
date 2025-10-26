# Environment Variables Setup Guide

## Required Environment Variables

Create a `.env` file in the `server/` directory with the following variables:

```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/jc-timbers

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-for-jc-timbers-2024

# Server Configuration
PORT=5001
CLIENT_ORIGIN=http://localhost:5173

# Razorpay Configuration (Required for online payments)
# Get your credentials from: https://dashboard.razorpay.com/app/keys
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID_HERE
RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET_HERE
```

## How to Get Razorpay Credentials

1. **Sign up for Razorpay:**
   - Go to https://razorpay.com/
   - Click "Sign Up" and create an account
   - Complete the verification process

2. **Get API Keys:**
   - Log in to your Razorpay Dashboard
   - Navigate to: Settings → API Keys (or go to https://dashboard.razorpay.com/app/keys)
   - Click "Generate Test Keys" (for development) or "Generate Live Keys" (for production)
   - Copy both the `Key ID` and `Key Secret`

3. **Add to .env file:**
   ```env
   RAZORPAY_KEY_ID=rzp_test_YOUR_ACTUAL_KEY_ID
   RAZORPAY_KEY_SECRET=YOUR_ACTUAL_KEY_SECRET
   ```

## Important Notes

- **Test vs Live Keys:**
  - Test keys start with `rzp_test_` - Use these for development and testing
  - Live keys start with `rzp_live_` - Use these only in production

- **Security:**
  - Never commit your `.env` file to version control
  - Keep your `RAZORPAY_KEY_SECRET` private
  - The `.env` file is already in `.gitignore`

- **Server Startup:**
  - The server will start successfully even without Razorpay credentials
  - You only need credentials when users try to make online payments
  - COD (Cash on Delivery) orders work without Razorpay

## Testing Without Razorpay

If you want to test the checkout flow without setting up Razorpay:

1. **Option 1:** Use COD (Cash on Delivery)
   - Checkout flow will work completely
   - Orders will be created successfully
   - No Razorpay credentials needed

2. **Option 2:** Add placeholder keys temporarily
   - Server will start
   - COD will work
   - Razorpay payments will fail gracefully with an error message

## Razorpay Test Cards (After Setup)

Once you have test credentials set up, use these test cards:

| Card Number | Type | Status |
|------------|------|--------|
| 4111 1111 1111 1111 | Visa | Success |
| 5555 5555 5555 4444 | Mastercard | Success |
| 4000 0000 0000 0002 | Visa | Failed |

- **Expiry:** Any future date (e.g., 12/25)
- **CVV:** Any 3 digits (e.g., 123)
- **Name:** Any name

## Troubleshooting

### Server won't start
- Check if all required variables are in `.env`
- Verify MongoDB is running
- Check for typos in variable names

### Razorpay payments fail
- Verify `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are correct
- Check if you're using test keys with test card numbers
- Look at server console for detailed error messages

### Orders not creating
- Ensure cart has items
- Verify product stock is available
- Check MongoDB connection

## Frontend Configuration

After setting up backend credentials, also update the frontend:

**File:** `client/src/pages/CheckoutPage.jsx` (Line 15)

```javascript
const RAZORPAY_KEY_ID = 'rzp_test_YOUR_KEY_ID'; // Use same key_id from .env
```

**Important:** Use the same `RAZORPAY_KEY_ID` (not the secret) in both frontend and backend.

---

Need help? Check the main [CHECKOUT_SETUP.md](../CHECKOUT_SETUP.md) for complete documentation.


