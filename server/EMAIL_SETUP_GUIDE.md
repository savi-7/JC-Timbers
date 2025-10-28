# 📧 Email Configuration Guide for JC Timbers

This guide will help you set up the email functionality for order confirmations and status updates.

## 🎯 Features

- ✅ **Order Confirmation Email** - Sent automatically when a customer places an order
- ✅ **PDF Invoice Attachment** - Professional invoice attached to confirmation email
- ✅ **Order Status Updates** - Emails sent when admin updates order status
- ✅ **Beautiful HTML Templates** - Professional, mobile-responsive email designs

---

## 📋 Prerequisites

1. A Gmail account (or other email provider)
2. Access to email account settings
3. Basic understanding of environment variables

---

## 🔧 Setup Instructions

### Option 1: Gmail (Recommended)

#### Step 1: Enable 2-Step Verification

1. Go to your Google Account: https://myaccount.google.com/
2. Click on **Security** in the left sidebar
3. Find **2-Step Verification** and turn it ON
4. Follow the prompts to verify your phone number

#### Step 2: Generate App Password

1. Go to: https://myaccount.google.com/apppasswords
2. Select app: **Mail**
3. Select device: **Other (Custom name)** → type "JC Timbers Server"
4. Click **Generate**
5. **Copy the 16-character password** (spaces don't matter)

#### Step 3: Update .env File

Create or update `server/.env` file:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
```

**Example:**
```env
EMAIL_USER=jctimbers@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
```

---

### Option 2: Outlook/Hotmail

1. Update `server/.env`:

```env
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-outlook-password
```

---

### Option 3: Yahoo Mail

1. Enable "Allow apps that use less secure sign in" in Yahoo settings
2. Update `server/.env`:

```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=your-email@yahoo.com
EMAIL_PASSWORD=your-yahoo-password
```

---

## 🧪 Testing Email Functionality

### Test 1: Order Confirmation Email

1. Start the server: `cd server && npm run dev`
2. Place a test order through the website
3. Check the console for email logs:
   ```
   📧 Sending order confirmation email to: customer@example.com
   ✅ Email sent successfully!
   ```
4. Check the customer's email inbox

### Test 2: Status Update Email

1. Log in as admin
2. Go to Orders management
3. Update an order status (e.g., "Processing" → "Shipped")
4. Check the customer's email for status update

---

## 📄 Email Content

### Order Confirmation Email Includes:

- ✅ Order number and date
- ✅ Order items table with quantities and prices
- ✅ Delivery address
- ✅ Payment method and status
- ✅ **PDF Invoice attached**
- ✅ Company contact information
- ✅ Professional branding

### Status Update Email Includes:

- ✅ Order number
- ✅ New status
- ✅ Status-specific message
- ✅ Company contact information

---

## ⚙️ Configuration Files

### 1. Email Configuration
**File:** `server/src/config/emailConfig.js`
- Nodemailer transporter setup
- Email credentials
- Connection verification

### 2. Email Service
**File:** `server/src/services/emailService.js`
- `sendOrderConfirmationEmail()` - Sends order confirmation with PDF
- `sendOrderStatusUpdateEmail()` - Sends status update notification
- HTML email templates

### 3. PDF Generator
**File:** `server/src/utils/pdfGenerator.js`
- Generates professional PDF invoices
- Matches the format shown on the website
- Returns Buffer for email attachment

### 4. Order Controller
**File:** `server/src/controllers/orderController.js`
- Triggers email after successful order placement
- Triggers email after admin status update

---

## 🐛 Troubleshooting

### Problem: "Email transporter error"

**Solution:**
1. Check that EMAIL_USER and EMAIL_PASSWORD are set correctly in `.env`
2. For Gmail, ensure you're using an **App Password**, not your regular password
3. Verify 2-Step Verification is enabled for Gmail

### Problem: "Authentication failed"

**Solution:**
- Gmail: Use App Password, not regular password
- Outlook: Ensure password is correct
- Check for typos in EMAIL_USER (should be full email address)

### Problem: Emails not received

**Solution:**
1. Check spam/junk folder
2. Verify customer email is valid in the database
3. Check server console for error messages
4. Test with a different email address

### Problem: PDF not attached

**Solution:**
1. Check that `jspdf` and `jspdf-autotable` are installed: `npm list jspdf`
2. Review server console for PDF generation errors
3. Ensure order data includes all required fields

---

## 🔒 Security Best Practices

1. **Never commit `.env` file** - It contains sensitive credentials
2. **Use App Passwords** - More secure than regular passwords
3. **Restrict .env file permissions** - `chmod 600 .env` on Linux/Mac
4. **Rotate credentials** - Change passwords periodically
5. **Use environment-specific configs** - Different credentials for dev/prod

---

## 📊 Email Logs

The system logs email activity:

```
✅ Email sent successfully!          → Email sent without errors
⚠️  Order confirmation email failed  → Email failed but order succeeded
❌ Error sending email               → Email system error (check config)
```

**Note:** Orders will complete successfully even if email fails. Emails are non-blocking.

---

## 📞 Support

If you encounter issues:

1. Check the server console logs
2. Verify `.env` configuration
3. Test with a simple email client (like Postman)
4. Review the troubleshooting section above

---

## 🎨 Customization

### Update Business Information

Edit `server/src/utils/pdfGenerator.js` and `server/src/services/emailService.js`:

```javascript
const BUSINESS_INFO = {
  name: 'Your Business Name',
  address: 'Your Address',
  city: 'Your City',
  phone: 'Your Phone',
  email: 'Your Email',
  website: 'Your Website',
  gst: 'Your GST Number'
};
```

### Customize Email Templates

Edit the HTML in `server/src/services/emailService.js`:
- Modify colors, fonts, and styling
- Add/remove sections
- Update footer information

---

## ✅ Checklist

Before going live:

- [ ] Set up production email account
- [ ] Generate App Password (for Gmail)
- [ ] Update `.env` with production credentials
- [ ] Test order confirmation email
- [ ] Test status update email
- [ ] Verify PDF attachment works
- [ ] Check emails on mobile devices
- [ ] Update business information in code
- [ ] Set up email monitoring/logging

---

**Last Updated:** October 2025  
**Version:** 1.0

