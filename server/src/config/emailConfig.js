import nodemailer from 'nodemailer';

// Email configuration
// IMPORTANT: Update these with your actual email credentials
const EMAIL_CONFIG = {
  service: 'gmail', // You can change to 'outlook', 'yahoo', etc.
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || 'jctimbers@gmail.com', // Your email
    pass: process.env.EMAIL_PASSWORD || 'your-app-password-here' // Your app password
  }
};

// Create reusable transporter
let transporter = null;

export const getEmailTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport(EMAIL_CONFIG);
    
    // Verify connection configuration
    transporter.verify((error, success) => {
      if (error) {
        console.error('❌ Email transporter error:', error);
        console.warn('⚠️  Email functionality may not work. Please check your email configuration.');
      } else {
        console.log('✅ Email server is ready to send messages');
      }
    });
  }
  
  return transporter;
};

export const SENDER_EMAIL = EMAIL_CONFIG.auth.user;
export const SENDER_NAME = 'JC Timbers';

export default {
  getEmailTransporter,
  SENDER_EMAIL,
  SENDER_NAME
};

