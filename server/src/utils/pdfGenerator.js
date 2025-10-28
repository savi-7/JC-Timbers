import { jsPDF } from 'jspdf';
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

/**
 * Generate PDF invoice buffer for email attachment
 * @param {Object} orderData - Order data object
 * @returns {Buffer} PDF buffer
 */
export const generateInvoicePDF = (orderData) => {
  try {
    console.log('📄 Generating PDF invoice for order:', orderData._id);
    
    if (!orderData || !orderData._id) {
      throw new Error('Invalid order data');
    }
    
    const doc = new jsPDF();
    
    // Set up document properties
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const contentWidth = pageWidth - (2 * margin);
    let yPosition = margin;
  
    // ====================
    // HEADER SECTION
    // ====================
    
    // Top colored header bar
    doc.setFillColor(91, 69, 55);
    doc.rect(0, 0, pageWidth, 8, 'F');
    
    yPosition = 18;
    
    // Business Name
    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(91, 69, 55);
    doc.text(BUSINESS_INFO.name, margin, yPosition);
    
    // Business Details (Right aligned)
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    
    const rightStartX = pageWidth - margin;
    doc.text(BUSINESS_INFO.address, rightStartX, yPosition - 2, { align: 'right' });
    doc.text(BUSINESS_INFO.city, rightStartX, yPosition + 2, { align: 'right' });
    doc.text(`☎ ${BUSINESS_INFO.phone}`, rightStartX, yPosition + 6, { align: 'right' });
    doc.text(`✉ ${BUSINESS_INFO.email}`, rightStartX, yPosition + 10, { align: 'right' });
    
    yPosition += 16;
    
    // Horizontal line separator
    doc.setDrawColor(91, 69, 55);
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    
    yPosition += 12;
    
    // ====================
    // INVOICE TITLE & ORDER DETAILS
    // ====================
    
    // "INVOICE" title with background
    doc.setFillColor(245, 242, 240);
    doc.rect(margin, yPosition, 45, 12, 'F');
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(91, 69, 55);
    doc.text('INVOICE', margin + 3, yPosition + 8);
    
    // Invoice Number and Date
    const invoiceNumber = `#${orderData._id.toString().toUpperCase().slice(-12)}`;
    const invoiceDate = new Date(orderData.createdAt).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    
    const infoBoxWidth = 65;
    const infoBoxX = pageWidth - margin - infoBoxWidth;
    
    doc.setFillColor(245, 242, 240);
    doc.rect(infoBoxX, yPosition, infoBoxWidth, 12, 'F');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 60);
    doc.text('Invoice No:', infoBoxX + 3, yPosition + 5);
    doc.text('Date:', infoBoxX + 3, yPosition + 10);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(invoiceNumber, infoBoxX + 25, yPosition + 5);
    doc.text(invoiceDate, infoBoxX + 25, yPosition + 10);
    
    yPosition += 20;
    
    // ====================
    // CUSTOMER & PAYMENT INFORMATION
    // ====================
    
    const boxHeight = 42;
    const boxGap = 6;
    const boxWidth = (contentWidth - boxGap) / 2;
    
    // Left Box - Customer Information
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.setFillColor(252, 252, 252);
    doc.roundedRect(margin, yPosition, boxWidth, boxHeight, 2, 2, 'FD');
    
    let leftYPos = yPosition + 6;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(91, 69, 55);
    doc.text('BILL TO', margin + 4, leftYPos);
    
    leftYPos += 7;
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(orderData.address?.name || orderData.address?.fullName || 'Customer', margin + 4, leftYPos);
    
    leftYPos += 5;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    
    const customerLines = [
      orderData.address?.phone || orderData.address?.mobileNumber || '',
      orderData.address?.addressLine || orderData.address?.address || '',
      orderData.address?.flatHouseCompany || '',
      `${orderData.address?.city || ''}, ${orderData.address?.state || ''}`.replace(', ,', ',').trim(),
      (orderData.address?.zip || orderData.address?.pincode) ? `PIN: ${orderData.address?.zip || orderData.address?.pincode}` : ''
    ].filter(line => line && line.trim() && line !== ',');
    
    customerLines.forEach((line) => {
      if (leftYPos < yPosition + boxHeight - 3) {
        doc.text(line, margin + 4, leftYPos, { maxWidth: boxWidth - 8 });
        leftYPos += 4.5;
      }
    });
    
    // Right Box - Payment Information
    const rightBoxX = margin + boxWidth + boxGap;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.setFillColor(252, 252, 252);
    doc.roundedRect(rightBoxX, yPosition, boxWidth, boxHeight, 2, 2, 'FD');
    
    let rightYPos = yPosition + 6;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(91, 69, 55);
    doc.text('PAYMENT DETAILS', rightBoxX + 4, rightYPos);
    
    rightYPos += 7;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    
    const paymentLines = [
      { label: 'Method:', value: orderData.paymentMethod || 'N/A' },
      { label: 'Status:', value: orderData.paymentStatus || 'N/A' },
      { label: 'Transaction ID:', value: orderData.razorpayPaymentId ? orderData.razorpayPaymentId.substring(0, 20) + '...' : 'N/A' },
      { label: 'Order Status:', value: orderData.status || 'Processing' }
    ];
    
    paymentLines.forEach((item) => {
      doc.setFont('helvetica', 'bold');
      doc.text(item.label, rightBoxX + 4, rightYPos);
      doc.setFont('helvetica', 'normal');
      doc.text(item.value, rightBoxX + 32, rightYPos);
      rightYPos += 5;
    });
    
    yPosition += boxHeight + 15;
    
    // ====================
    // PRODUCTS TABLE
    // ====================
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(91, 69, 55);
    doc.text('Order Items', margin, yPosition);
    
    yPosition += 8;
    
    const tableColumn = ['S.No', 'Product Description', 'Quantity', 'Unit Price', 'Amount'];
    const tableRows = [];
    
    if (!orderData.items || orderData.items.length === 0) {
      tableRows.push(['1', 'No items', '0', '₹0.00', '₹0.00']);
    } else {
      orderData.items.forEach((item, index) => {
        const itemPrice = parseFloat(item.price) || 0;
        const itemQty = parseInt(item.quantity) || 1;
        const itemTotal = itemPrice * itemQty;
        
        const rowData = [
          (index + 1).toString(),
          item.name || 'Product',
          itemQty.toString(),
          `₹${itemPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          `₹${itemTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        ];
        tableRows.push(rowData);
      });
    }
    
    autoTable(doc, {
      startY: yPosition,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      headStyles: {
        fillColor: [91, 69, 55],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center',
        cellPadding: 4
      },
      bodyStyles: {
        fontSize: 9.5,
        textColor: [40, 40, 40],
        cellPadding: 3
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250]
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 18 },
        1: { halign: 'left', cellWidth: 'auto' },
        2: { halign: 'center', cellWidth: 22 },
        3: { halign: 'right', cellWidth: 32 },
        4: { halign: 'right', cellWidth: 35, fontStyle: 'bold' }
      },
      margin: { left: margin, right: margin },
      tableLineColor: [200, 200, 200],
      tableLineWidth: 0.2
    });
    
    yPosition = doc.lastAutoTable.finalY + 8;
    
    // ====================
    // TOTALS SECTION
    // ====================
    
    const subtotal = orderData.items?.reduce((sum, item) => {
      const itemPrice = parseFloat(item.price) || 0;
      const itemQty = parseInt(item.quantity) || 0;
      return sum + (itemPrice * itemQty);
    }, 0) || 0;
    
    const deliveryCharge = parseFloat(orderData.shippingCost) || 0;
    const grandTotal = parseFloat(orderData.totalAmount) || (subtotal + deliveryCharge);
    
    const totalsBoxWidth = 75;
    const totalsBoxX = pageWidth - margin - totalsBoxWidth;
    const totalsBoxStartY = yPosition;
    
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.setFillColor(248, 248, 248);
    
    let totalsYPos = totalsBoxStartY + 6;
    
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    
    // Subtotal
    doc.text('Subtotal:', totalsBoxX + 3, totalsYPos);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(`₹${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
      pageWidth - margin - 3, totalsYPos, { align: 'right' });
    
    totalsYPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    
    // Delivery Charge
    doc.text('Delivery:', totalsBoxX + 3, totalsYPos);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    if (deliveryCharge === 0) {
      doc.setTextColor(34, 139, 34);
      doc.text('FREE', pageWidth - margin - 3, totalsYPos, { align: 'right' });
    } else {
      doc.text(`₹${deliveryCharge.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
        pageWidth - margin - 3, totalsYPos, { align: 'right' });
    }
    
    totalsYPos += 8;
    
    // Separator line
    doc.setDrawColor(91, 69, 55);
    doc.setLineWidth(0.5);
    doc.line(totalsBoxX + 3, totalsYPos - 2, pageWidth - margin - 3, totalsYPos - 2);
    
    // Grand Total
    doc.setFillColor(91, 69, 55);
    doc.rect(totalsBoxX, totalsYPos, totalsBoxWidth, 10, 'F');
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('GRAND TOTAL:', totalsBoxX + 3, totalsYPos + 6.5);
    doc.setFontSize(12);
    doc.text(`₹${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
      pageWidth - margin - 3, totalsYPos + 6.5, { align: 'right' });
    
    const boxTotalHeight = totalsYPos - totalsBoxStartY + 10;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.roundedRect(totalsBoxX, totalsBoxStartY, totalsBoxWidth, boxTotalHeight, 2, 2, 'D');
    
    yPosition = totalsYPos + 15;
    
    // ====================
    // FOOTER SECTION
    // ====================
    
    if (yPosition > pageHeight - 80) {
      doc.addPage();
      yPosition = margin + 10;
    }
    
    yPosition += 8;
    
    // Thank you message
    doc.setFillColor(252, 248, 245);
    doc.setDrawColor(91, 69, 55);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, yPosition, contentWidth, 28, 2, 2, 'FD');
    
    yPosition += 10;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(91, 69, 55);
    doc.text('Thank You for Your Purchase!', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 7;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text('We appreciate your business and hope you are satisfied with your purchase.', 
      pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 5;
    doc.setFontSize(8.5);
    doc.setTextColor(100, 100, 100);
    doc.text(`For queries, contact us: ${BUSINESS_INFO.phone} | ${BUSINESS_INFO.email}`, 
      pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 15;
    
    // Terms & Conditions
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.2);
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(margin, yPosition, contentWidth, 24, 1, 1, 'FD');
    
    yPosition += 5;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(91, 69, 55);
    doc.text('Terms & Conditions', margin + 4, yPosition);
    
    yPosition += 5;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(70, 70, 70);
    
    const policyLines = [
      '• Products can be returned within 7 days of delivery in original condition.',
      '• Custom-cut timber and made-to-order furniture are non-returnable.',
      '• Defective items will be replaced or refunded as per company policy.',
      '• Installation and maintenance services available on request.'
    ];
    
    policyLines.forEach((line, index) => {
      if (index < 2) {
        doc.text(line, margin + 5, yPosition + (index * 4), { maxWidth: (contentWidth / 2) - 10 });
      } else {
        doc.text(line, pageWidth / 2 + 3, yPosition + ((index - 2) * 4), { maxWidth: (contentWidth / 2) - 10 });
      }
    });
    
    // Page footer
    const footerY = pageHeight - 12;
    
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY - 2, pageWidth - margin, footerY - 2);
    
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(140, 140, 140);
    doc.text('This is a computer-generated invoice and does not require a signature.', 
      pageWidth / 2, footerY + 2, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(`Generated on: ${new Date().toLocaleString('en-IN', { 
      day: '2-digit', month: 'short', year: 'numeric', 
      hour: '2-digit', minute: '2-digit', hour12: true 
    })}`, pageWidth / 2, footerY + 6, { align: 'center' });
    
    doc.setTextColor(91, 69, 55);
    doc.setFont('helvetica', 'bold');
    doc.text(BUSINESS_INFO.website, pageWidth - margin, footerY + 6, { align: 'right' });
    
    // Return PDF as Buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    console.log('✅ PDF invoice generated successfully');
    
    return pdfBuffer;
  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    throw error;
  }
};

export default generateInvoicePDF;

