import { getEmailTransporter, SENDER_EMAIL, SENDER_NAME } from '../config/emailConfig.js';
import generateInvoicePDF from '../utils/pdfGenerator.js';

/**
 * Send order confirmation email with PDF invoice attachment
 * @param {Object} orderData - Order data object
 * @param {String} customerEmail - Customer's email address
 * @returns {Promise} Email send result
 */
export const sendOrderConfirmationEmail = async (orderData, customerEmail) => {
  try {
    console.log(`📧 Preparing to send order confirmation email to: ${customerEmail}`);
    
    if (!customerEmail) {
      throw new Error('Customer email is required');
    }
    
    if (!orderData) {
      throw new Error('Order data is required');
    }
    
    // Generate PDF invoice
    const pdfBuffer = generateInvoicePDF(orderData);
    
    // Get email transporter
    const transporter = getEmailTransporter();
    
    // Prepare email content
    const invoiceNumber = orderData._id.toString().toUpperCase().slice(-12);
    const orderDate = new Date(orderData.createdAt).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
    
    const customerName = orderData.address?.name || orderData.address?.fullName || 'Valued Customer';
    const totalAmount = parseFloat(orderData.totalAmount || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    // Email HTML template
    const emailHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #5b4537 0%, #7a5c4d 100%);
      color: #ffffff;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: bold;
    }
    .header p {
      margin: 5px 0 0;
      font-size: 14px;
      opacity: 0.9;
    }
    .content {
      padding: 30px 20px;
    }
    .greeting {
      font-size: 18px;
      color: #5b4537;
      margin-bottom: 15px;
    }
    .order-box {
      background: #f9f6f4;
      border-left: 4px solid #5b4537;
      padding: 15px 20px;
      margin: 20px 0;
      border-radius: 5px;
    }
    .order-box h3 {
      margin: 0 0 10px 0;
      color: #5b4537;
      font-size: 16px;
    }
    .order-detail {
      display: flex;
      justify-content: space-between;
      margin: 8px 0;
      font-size: 14px;
    }
    .order-detail .label {
      color: #666;
      font-weight: 500;
    }
    .order-detail .value {
      color: #333;
      font-weight: 600;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    .items-table th {
      background: #5b4537;
      color: white;
      padding: 10px;
      text-align: left;
      font-size: 13px;
    }
    .items-table td {
      padding: 10px;
      border-bottom: 1px solid #e0e0e0;
      font-size: 13px;
    }
    .items-table tr:last-child td {
      border-bottom: none;
    }
    .total-row {
      background: #f9f6f4;
      font-weight: bold;
      font-size: 16px;
      color: #5b4537;
    }
    .attachment-note {
      background: #fff8e1;
      border: 1px solid #ffd54f;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
      font-size: 14px;
    }
    .attachment-note strong {
      color: #f57c00;
    }
    .cta-button {
      display: inline-block;
      background: #5b4537;
      color: #ffffff !important;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: bold;
      text-align: center;
    }
    .cta-button:hover {
      background: #7a5c4d;
    }
    .footer {
      background: #f5f5f5;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
    .footer a {
      color: #5b4537;
      text-decoration: none;
    }
    .divider {
      height: 1px;
      background: linear-gradient(to right, transparent, #ddd, transparent);
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>🪵 JC Timbers</h1>
      <p>Quality Timber & Furniture Solutions</p>
    </div>
    
    <div class="content">
      <p class="greeting">Dear ${customerName},</p>
      
      <p>Thank you for your order! We're excited to confirm that we've received your order and it's being processed.</p>
      
      <div class="order-box">
        <h3>📦 Order Summary</h3>
        <div class="order-detail">
          <span class="label">Order Number:</span>
          <span class="value">#${invoiceNumber}</span>
        </div>
        <div class="order-detail">
          <span class="label">Order Date:</span>
          <span class="value">${orderDate}</span>
        </div>
        <div class="order-detail">
          <span class="label">Payment Method:</span>
          <span class="value">${orderData.paymentMethod || 'N/A'}</span>
        </div>
        <div class="order-detail">
          <span class="label">Order Status:</span>
          <span class="value">${orderData.status || 'Processing'}</span>
        </div>
      </div>
      
      <h3 style="color: #5b4537; margin-top: 25px;">Order Items</h3>
      <table class="items-table">
        <thead>
          <tr>
            <th>Product</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${orderData.items?.map(item => `
            <tr>
              <td>${item.name || 'Product'}</td>
              <td style="text-align: center;">${item.quantity || 1}</td>
              <td style="text-align: right;">₹${(parseFloat(item.price) * parseInt(item.quantity)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            </tr>
          `).join('') || '<tr><td colspan="3">No items</td></tr>'}
          <tr class="total-row">
            <td colspan="2" style="text-align: right;">Grand Total:</td>
            <td style="text-align: right;">₹${totalAmount}</td>
          </tr>
        </tbody>
      </table>
      
      <div class="attachment-note">
        <strong>📄 Invoice Attached</strong><br>
        Your detailed invoice is attached to this email as a PDF file. You can download and save it for your records.
      </div>
      
      <div class="divider"></div>
      
      <h3 style="color: #5b4537;">Delivery Address</h3>
      <p style="background: #f9f9f9; padding: 12px; border-radius: 5px; font-size: 14px;">
        <strong>${orderData.address?.name || orderData.address?.fullName || ''}</strong><br>
        ${orderData.address?.addressLine || orderData.address?.address || ''}<br>
        ${orderData.address?.flatHouseCompany ? orderData.address?.flatHouseCompany + '<br>' : ''}
        ${orderData.address?.city || ''}, ${orderData.address?.state || ''} - ${orderData.address?.pincode || orderData.address?.zip || ''}<br>
        Phone: ${orderData.address?.phone || orderData.address?.mobileNumber || ''}
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <p>Track your order or view details:</p>
        <a href="http://localhost:5173/order-history" class="cta-button">View Order Details</a>
      </div>
      
      <div class="divider"></div>
      
      <p style="font-size: 14px; color: #666;">
        If you have any questions about your order, please don't hesitate to contact us at 
        <a href="tel:+919876543210" style="color: #5b4537;">+91 98765 43210</a> or 
        <a href="mailto:jctimbers@gmail.com" style="color: #5b4537;">jctimbers@gmail.com</a>
      </p>
      
      <p style="font-size: 14px; margin-top: 20px;">
        Thank you for choosing JC Timbers!<br>
        <strong style="color: #5b4537;">The JC Timbers Team</strong>
      </p>
    </div>
    
    <div class="footer">
      <p>
        <strong>JC Timbers</strong><br>
        Timber Koovappally, Koovappally, Kerala 673301<br>
        Phone: +91 98765 43210 | Email: jctimbers@gmail.com<br>
        <a href="http://www.jctimbers.in">www.jctimbers.in</a>
      </p>
      <p style="margin-top: 15px; font-size: 11px; color: #999;">
        This email was sent to ${customerEmail} because you placed an order on JC Timbers.
      </p>
    </div>
  </div>
</body>
</html>
    `;
    
    // Plain text version (fallback)
    const emailText = `
Dear ${customerName},

Thank you for your order at JC Timbers!

Order Summary:
- Order Number: #${invoiceNumber}
- Order Date: ${orderDate}
- Payment Method: ${orderData.paymentMethod || 'N/A'}
- Total Amount: ₹${totalAmount}

Your detailed invoice is attached as a PDF file.

Order Items:
${orderData.items?.map(item => `- ${item.name} (Qty: ${item.quantity}) - ₹${(parseFloat(item.price) * parseInt(item.quantity)).toLocaleString('en-IN')}`).join('\n') || 'No items'}

Delivery Address:
${orderData.address?.name || orderData.address?.fullName || ''}
${orderData.address?.addressLine || orderData.address?.address || ''}
${orderData.address?.city || ''}, ${orderData.address?.state || ''} - ${orderData.address?.pincode || orderData.address?.zip || ''}
Phone: ${orderData.address?.phone || orderData.address?.mobileNumber || ''}

If you have any questions, contact us:
Phone: +91 98765 43210
Email: jctimbers@gmail.com

Thank you for choosing JC Timbers!
The JC Timbers Team

---
JC Timbers
Timber Koovappally, Koovappally, Kerala 673301
www.jctimbers.in
    `;
    
    // Email options
    const mailOptions = {
      from: `"${SENDER_NAME}" <${SENDER_EMAIL}>`,
      to: customerEmail,
      subject: `Order Confirmation - #${invoiceNumber} - JC Timbers`,
      text: emailText,
      html: emailHTML,
      attachments: [
        {
          filename: `JC-Timbers-Invoice-${invoiceNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };
    
    // Send email
    console.log('📤 Sending email...');
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    
    return {
      success: true,
      messageId: info.messageId,
      response: info.response
    };
    
  } catch (error) {
    console.error('❌ Error sending order confirmation email:', error);
    console.error('Error details:', error.message);
    
    // Don't throw error - we don't want to fail the order if email fails
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Send order status update email
 * @param {Object} orderData - Order data object
 * @param {String} customerEmail - Customer's email address
 * @param {String} newStatus - New order status
 * @returns {Promise} Email send result
 */
export const sendOrderStatusUpdateEmail = async (orderData, customerEmail, newStatus) => {
  try {
    console.log(`📧 Sending order status update email to: ${customerEmail}`);
    
    const transporter = getEmailTransporter();
    const invoiceNumber = orderData._id.toString().toUpperCase().slice(-12);
    const customerName = orderData.address?.name || orderData.address?.fullName || 'Valued Customer';
    
    const statusMessages = {
      'Processing': 'Your order is being prepared.',
      'Shipped': 'Your order has been shipped and is on its way!',
      'Delivered': 'Your order has been delivered. We hope you enjoy your purchase!',
      'Cancelled': 'Your order has been cancelled as per your request.'
    };
    
    const mailOptions = {
      from: `"${SENDER_NAME}" <${SENDER_EMAIL}>`,
      to: customerEmail,
      subject: `Order Update - #${invoiceNumber} - ${newStatus}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #5b4537;">Order Status Update</h2>
          <p>Dear ${customerName},</p>
          <p>Your order <strong>#${invoiceNumber}</strong> status has been updated to: <strong>${newStatus}</strong></p>
          <p>${statusMessages[newStatus] || 'Your order status has been updated.'}</p>
          <p>Thank you for choosing JC Timbers!</p>
          <hr>
          <p style="font-size: 12px; color: #666;">
            JC Timbers<br>
            Phone: +91 98765 43210 | Email: jctimbers@gmail.com
          </p>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Status update email sent successfully!');
    
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('❌ Error sending status update email:', error);
    return { success: false, error: error.message };
  }
};

export default {
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail
};

