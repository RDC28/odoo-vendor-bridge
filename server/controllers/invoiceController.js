const Invoice = require('../models/Invoice');
const PurchaseOrder = require('../models/PurchaseOrder');
const { generateInvoicePDF } = require('../utils/pdfGenerator');
const { sendInvoiceEmail } = require('../utils/emailSender');
const { log } = require('../utils/logger');

exports.getInvoices = async (req, res) => {
  try {
    const query = {};
    if (req.user.role === 'Vendor' && req.user.vendorId) query.vendor = req.user.vendorId;
    const invoices = await Invoice.find(query)
      .populate('purchaseOrder', 'poNumber')
      .populate('vendor', 'name email')
      .populate('createdBy', 'name')
      .sort('-createdAt');
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate({ path: 'purchaseOrder', populate: { path: 'vendor rfq' } })
      .populate('vendor')
      .populate('createdBy', 'name');
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createInvoice = async (req, res) => {
  try {
    const { poId } = req.body;
    const po = await PurchaseOrder.findById(poId).populate('vendor');
    if (!po) return res.status(404).json({ message: 'Purchase Order not found' });

    const existing = await Invoice.findOne({ purchaseOrder: poId });
    if (existing) return res.status(400).json({ message: 'Invoice already exists for this PO' });

    const invoice = await Invoice.create({
      purchaseOrder: poId,
      vendor: po.vendor._id,
      createdBy: req.user._id,
      subtotal: po.subtotal,
      taxAmount: po.taxAmount,
      totalAmount: po.totalAmount,
      status: 'Draft',
    });

    await log({ user: req.user, action: 'CREATE', entityType: 'Invoice', entityId: invoice._id, description: `${req.user.name} generated invoice ${invoice.invoiceNumber} from ${po.poNumber}` });

    res.status(201).json(invoice);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.downloadPDF = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    const po = await PurchaseOrder.findById(invoice.purchaseOrder).populate('vendor');
    generateInvoicePDF(invoice, po, po.vendor, res);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.sendEmail = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    const po = await PurchaseOrder.findById(invoice.purchaseOrder).populate('vendor');

    await sendInvoiceEmail({
      to: po.vendor.email,
      invoiceNumber: invoice.invoiceNumber,
      vendorName: po.vendor.name,
      totalAmount: invoice.totalAmount,
    });

    await Invoice.findByIdAndUpdate(req.params.id, { emailSentAt: new Date(), status: 'Sent' });
    await log({ user: req.user, action: 'EMAIL', entityType: 'Invoice', entityId: invoice._id, description: `${req.user.name} emailed invoice ${invoice.invoiceNumber} to ${po.vendor.email}` });

    res.json({ message: 'Invoice emailed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Email sending failed (check SMTP settings). ' + err.message });
  }
};

exports.updateInvoice = async (req, res) => {
  try {
    const updates = req.body;
    if (updates.status === 'Paid') updates.paidAt = new Date();
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
