import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Business Information
const BUSINESS_INFO = {
  name: 'JC Timbers',
  address: 'Timber Koovappally, Koovappally, Kerala 673301',
  city: 'Koovappally, Kerala 673301',
  phone: '+91 98765 43210',
  email: 'jctimbers@gmail.com',
  website: 'www.jctimbers.in',
  gst: 'GST NO: 27XXXXX1234X1XX'
};

export const generateInvoice = (orderData) => {
  try {
    console.log('📄 Starting invoice generation...');
    console.log('Order Data:', orderData);
    
    if (!orderData) {
      throw new Error('Order data is missing');
    }
    
    if (!orderData._id) {
      throw new Error('Order ID is missing');
    }
    
    console.log('Creating jsPDF instance...');
    const doc = new jsPDF();
    console.log('jsPDF instance created successfully');
    
    // Check if autoTable function is available
    if (typeof autoTable !== 'function') {
      throw new Error('jsPDF autoTable plugin is not loaded. Please refresh the page and try again.');
    }
    console.log('autoTable function is available');
    
    // Set up document properties
    let yPosition = 20;
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;
  
  // ====================
  // HEADER SECTION
  // ====================
  
  // Business Name (Large, Bold)
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(91, 69, 55); // Dark brown color
  doc.text(BUSINESS_INFO.name, margin, yPosition);
  
  // Business Details (Small, Right aligned)
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  const businessDetails = [
    BUSINESS_INFO.address,
    BUSINESS_INFO.city,
    `Phone: ${BUSINESS_INFO.phone}`,
    `Email: ${BUSINESS_INFO.email}`,
    BUSINESS_INFO.gst
  ];
  businessDetails.forEach((line, index) => {
    doc.text(line, pageWidth - margin, yPosition + (index * 4), { align: 'right' });
  });
  
  yPosition += 30;
  
  // Horizontal line
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;
  
  // ====================
  // INVOICE TITLE
  // ====================
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('INVOICE', margin, yPosition);
  
  // Invoice Number and Date (Right aligned)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const invoiceNumber = `#${orderData._id.toUpperCase().slice(-12)}`; // Last 12 chars to match Order Success page
  const invoiceDate = new Date(orderData.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  doc.text(`Invoice No: ${invoiceNumber}`, pageWidth - margin, yPosition, { align: 'right' });
  doc.text(`Date: ${invoiceDate}`, pageWidth - margin, yPosition + 5, { align: 'right' });
  
  yPosition += 15;
  
  // ====================
  // CUSTOMER INFORMATION
  // ====================
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, yPosition, (pageWidth - 2 * margin) / 2 - 5, 35, 'F');
  
  yPosition += 7;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(91, 69, 55);
  doc.text('Bill To:', margin + 5, yPosition);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  yPosition += 5;
  
  const customerInfo = [
    orderData.address?.name || orderData.address?.fullName || 'Customer',
    orderData.address?.phone || orderData.address?.mobileNumber || '',
    orderData.address?.addressLine || orderData.address?.address || '',
    `${orderData.address?.city || ''}, ${orderData.address?.state || ''}`.trim(),
    orderData.address?.zip || orderData.address?.pincode || ''
  ].filter(line => line && line.trim());
  
  customerInfo.forEach((line, index) => {
    doc.text(line, margin + 5, yPosition + (index * 5));
  });
  
  // Payment Information (Right Box)
  yPosition -= 12;
  doc.setFillColor(245, 245, 245);
  doc.rect(pageWidth / 2 + 5, yPosition, (pageWidth - 2 * margin) / 2 - 5, 35, 'F');
  
  yPosition += 7;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(91, 69, 55);
  doc.text('Payment Details:', pageWidth / 2 + 10, yPosition);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  yPosition += 5;
  
  const paymentInfo = [
    `Method: ${orderData.paymentMethod || 'N/A'}`,
    `Status: ${orderData.paymentStatus || 'N/A'}`,
    orderData.razorpayPaymentId ? `Transaction ID: ${orderData.razorpayPaymentId}` : '', // Full transaction ID to match Order Success page
    `Order Status: ${orderData.status || 'Processing'}`
  ].filter(line => line);
  
  paymentInfo.forEach((line, index) => {
    doc.text(line, pageWidth / 2 + 10, yPosition + (index * 5));
  });
  
  yPosition += 40;
  
  // ====================
  // PRODUCTS TABLE
  // ====================
  
  const tableColumn = ['#', 'Product Name', 'Qty', 'Unit Price', 'Total'];
  const tableRows = [];
  
  console.log('Processing items:', orderData.items);
  
  if (!orderData.items || orderData.items.length === 0) {
    console.warn('No items found in order');
    tableRows.push(['1', 'No items', '0', '₹0', '₹0']);
  } else {
    orderData.items.forEach((item, index) => {
      console.log(`Item ${index}:`, item);
      const rowData = [
        index + 1,
        item.name || 'Product',
        item.quantity || 1,
        `₹${(item.price || 0).toLocaleString('en-IN')}`,
        `₹${((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}`
      ];
      tableRows.push(rowData);
    });
  }
  
  autoTable(doc, {
    startY: yPosition,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [91, 69, 55], // Dark brown
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [0, 0, 0]
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 15 },
      1: { halign: 'left', cellWidth: 'auto' },
      2: { halign: 'center', cellWidth: 25 },
      3: { halign: 'right', cellWidth: 35 },
      4: { halign: 'right', cellWidth: 35 }
    },
    margin: { left: margin, right: margin }
  });
  
  yPosition = doc.lastAutoTable.finalY + 10;
  
  // ====================
  // TOTALS SECTION
  // ====================
  
  const totalsX = pageWidth - margin - 70;
  const totalsLabelX = totalsX - 40;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const subtotal = orderData.items?.reduce((sum, item) => {
    const itemPrice = parseFloat(item.price) || 0;
    const itemQty = parseInt(item.quantity) || 0;
    return sum + (itemPrice * itemQty);
  }, 0) || 0;
  
  const deliveryCharge = parseFloat(orderData.shippingCost) || 0;
  const tax = 0; // You can calculate tax if needed
  const discount = 0; // You can add discount if needed
  const grandTotal = parseFloat(orderData.totalAmount) || (subtotal + deliveryCharge);
  
  console.log('Totals:', { subtotal, deliveryCharge, tax, discount, grandTotal });
  
  const totals = [
    { label: 'Subtotal:', value: `₹${subtotal.toLocaleString('en-IN')}` },
    { label: 'Delivery Charge:', value: deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge.toLocaleString('en-IN')}` },
  ];
  
  if (tax > 0) {
    totals.push({ label: 'Tax (GST):', value: `₹${tax.toLocaleString('en-IN')}` });
  }
  
  if (discount > 0) {
    totals.push({ label: 'Discount:', value: `-₹${discount.toLocaleString('en-IN')}` });
  }
  
  totals.forEach((item, index) => {
    doc.text(item.label, totalsLabelX, yPosition + (index * 6));
    doc.text(item.value, totalsX, yPosition + (index * 6));
  });
  
  yPosition += totals.length * 6 + 5;
  
  // Grand Total (Bold, larger)
  doc.setDrawColor(91, 69, 55);
  doc.line(totalsLabelX - 5, yPosition - 2, pageWidth - margin, yPosition - 2);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(91, 69, 55);
  doc.text('Grand Total:', totalsLabelX, yPosition + 5);
  doc.text(`₹${grandTotal.toLocaleString('en-IN')}`, totalsX, yPosition + 5);
  
  yPosition += 15;
  
  // ====================
  // FOOTER SECTION
  // ====================
  
  // Check if we need a new page
  if (yPosition > pageHeight - 60) {
    doc.addPage();
    yPosition = 20;
  }
  
  yPosition += 10;
  
  // Thank you message
  doc.setFillColor(245, 240, 235);
  doc.rect(margin, yPosition, pageWidth - 2 * margin, 35, 'F');
  
  yPosition += 8;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(91, 69, 55);
  doc.text('Thank You for Your Purchase!', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  
  const footerText = [
    'We appreciate your business and hope you are satisfied with your purchase.',
    'For any queries or concerns, please contact us at ' + BUSINESS_INFO.phone + ' or ' + BUSINESS_INFO.email
  ];
  
  footerText.forEach((line, index) => {
    doc.text(line, pageWidth / 2, yPosition + (index * 5), { align: 'center' });
  });
  
  yPosition += 20;
  
  // Return/Service Policy
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Return & Service Policy:', margin, yPosition);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  yPosition += 4;
  
  const policyText = [
    '• Products can be returned within 7 days of delivery in original condition.',
    '• Custom-cut timber and made-to-order furniture are non-returnable.',
    '• Defective items will be replaced or refunded as per company policy.',
    '• Installation and maintenance services available on request.'
  ];
  
  policyText.forEach((line, index) => {
    doc.text(line, margin + 2, yPosition + (index * 4));
  });
  
  // Bottom border
  yPosition = pageHeight - 15;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  
  yPosition += 5;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('This is a computer-generated invoice and does not require a signature.', pageWidth / 2, yPosition, { align: 'center' });
  doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, pageWidth / 2, yPosition + 4, { align: 'center' });
  
    // Save the PDF - use the same invoice number format as displayed (last 12 chars)
    const fileName = `JC-Timbers-Invoice-${invoiceNumber.replace('#', '')}.pdf`;
    console.log('✅ Invoice generated successfully:', fileName);
    doc.save(fileName);
    
    return fileName;
  } catch (error) {
    console.error('❌ Invoice generation failed:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
    throw error; // Re-throw to be caught by the calling function
  }
};

// Preview invoice (open in new tab instead of download)
export const previewInvoice = (orderData) => {
  const doc = new jsPDF();
  // ... same code as generateInvoice but use output('bloburl') instead of save()
  // For simplicity, we'll just use the same function
  generateInvoice(orderData);
};

