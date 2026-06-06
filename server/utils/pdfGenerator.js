const PDFDocument = require('pdfkit');

const generateInvoicePDF = (invoice, po, vendor, res) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${invoice.invoiceNumber}.pdf`);
  doc.pipe(res);

  // Header bar
  doc.rect(50, 45, 495, 4).fill('#16a34a');

  // Logo & Company
  doc.fontSize(22).font('Helvetica-Bold').fillColor('#16a34a').text('Vendor', 50, 60, { continued: true });
  doc.fillColor('#111827').text('Bridge');
  doc.fontSize(9).font('Helvetica').fillColor('#6b7280')
    .text('Your Company Pvt. Ltd.', 50, 88)
    .text('123 Business Park, Goa — 403001', 50, 100)
    .text('GST: 30AABCY1234P1Z5', 50, 112);

  // Invoice title
  doc.fontSize(26).font('Helvetica-Bold').fillColor('#111827').text('INVOICE', 380, 60);
  doc.fontSize(10).font('Helvetica').fillColor('#6b7280')
    .text(`Invoice No: ${invoice.invoiceNumber}`, 380, 94)
    .text(`Date: ${new Date(invoice.createdAt).toLocaleDateString('en-IN')}`, 380, 108)
    .text(`Due: ${new Date(invoice.dueDate).toLocaleDateString('en-IN')}`, 380, 122)
    .text(`Status: ${invoice.status}`, 380, 136);

  // Divider
  doc.rect(50, 148, 495, 0.5).fill('#e5e7eb');

  // Vendor info
  doc.fontSize(9).font('Helvetica-Bold').fillColor('#9ca3af').text('BILLED TO', 50, 158);
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#111827').text(vendor.name, 50, 172);
  doc.fontSize(9).font('Helvetica').fillColor('#6b7280')
    .text(vendor.email, 50, 186)
    .text(vendor.phone || '', 50, 198)
    .text(`GST: ${vendor.gstNumber || 'N/A'}`, 50, 210);

  doc.fontSize(9).font('Helvetica-Bold').fillColor('#9ca3af').text('PO REFERENCE', 340, 158);
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#111827').text(po.poNumber, 340, 172);
  doc.fontSize(9).font('Helvetica').fillColor('#6b7280').text(`RFQ Reference attached`, 340, 186);

  // Table header
  const tableTop = 240;
  doc.rect(50, tableTop, 495, 22).fill('#f3f4f6');
  doc.fontSize(9).font('Helvetica-Bold').fillColor('#374151');
  doc.text('#', 58, tableTop + 7);
  doc.text('Description', 75, tableTop + 7);
  doc.text('Qty', 300, tableTop + 7);
  doc.text('Unit', 340, tableTop + 7);
  doc.text('Rate', 385, tableTop + 7);
  doc.text('Amount', 445, tableTop + 7);

  // Table rows
  let y = tableTop + 30;
  po.items.forEach((item, i) => {
    if (i % 2 === 1) doc.rect(50, y - 5, 495, 20).fill('#f9fafb');
    doc.fontSize(9).font('Helvetica').fillColor('#111827');
    doc.text(String(i + 1), 58, y);
    doc.text(item.name, 75, y, { width: 210 });
    doc.text(String(item.quantity), 300, y);
    doc.text(item.unit || 'Nos', 340, y);
    doc.text(`₹${item.unitPrice?.toLocaleString('en-IN') || '0'}`, 385, y);
    doc.text(`₹${item.totalPrice?.toLocaleString('en-IN') || '0'}`, 445, y);
    y += 24;
  });

  // Divider after items
  doc.rect(50, y + 4, 495, 0.5).fill('#e5e7eb');
  y += 14;

  // Totals
  const totalsX = 370;
  doc.fontSize(10).font('Helvetica').fillColor('#6b7280');
  doc.text('Subtotal:', totalsX, y).text(`₹${invoice.subtotal?.toLocaleString('en-IN') || '0'}`, 480, y, { align: 'right' });
  y += 18;
  doc.text('GST (18%):', totalsX, y).text(`₹${invoice.taxAmount?.toLocaleString('en-IN') || '0'}`, 480, y, { align: 'right' });
  y += 10;
  doc.rect(totalsX, y + 4, 175, 0.5).fill('#e5e7eb');
  y += 14;
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#111827');
  doc.text('Grand Total:', totalsX, y).text(`₹${invoice.totalAmount?.toLocaleString('en-IN') || '0'}`, 480, y, { align: 'right' });

  // Footer
  doc.rect(50, 760, 495, 4).fill('#16a34a');
  doc.fontSize(8).font('Helvetica').fillColor('#9ca3af')
    .text('Payment Terms: Net 30 days  ·  Bank: HDFC Bank  ·  A/C: 50100123456789  ·  IFSC: HDFC0001234', 50, 770, { align: 'center' });

  doc.end();
};

module.exports = { generateInvoicePDF };
