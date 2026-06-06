const PurchaseOrder = require('../models/PurchaseOrder');
const Quotation = require('../models/Quotation');
const { log } = require('../utils/logger');

exports.getPurchaseOrders = async (req, res) => {
  try {
    const query = {};
    if (req.user.role === 'Vendor' && req.user.vendorId) query.vendor = req.user.vendorId;
    const pos = await PurchaseOrder.find(query)
      .populate('rfq', 'title category')
      .populate('vendor', 'name email')
      .populate('createdBy', 'name')
      .sort('-createdAt');
    res.json(pos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPurchaseOrder = async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id)
      .populate('rfq', 'title category description')
      .populate('vendor')
      .populate('quotation')
      .populate('createdBy', 'name email');
    if (!po) return res.status(404).json({ message: 'Purchase Order not found' });
    res.json(po);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createPurchaseOrder = async (req, res) => {
  try {
    const { rfqId, quotationId } = req.body;
    const quotation = await Quotation.findById(quotationId).populate('vendor');
    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });

    const subtotal = quotation.totalAmount;
    const taxAmount = Math.round(subtotal * 0.18);
    const totalAmount = subtotal + taxAmount;

    const po = await PurchaseOrder.create({
      rfq: rfqId,
      quotation: quotationId,
      vendor: quotation.vendor._id,
      createdBy: req.user._id,
      items: quotation.items,
      subtotal,
      taxAmount,
      totalAmount,
      deliveryDays: quotation.deliveryDays,
      notes: quotation.notes,
    });

    await log({ user: req.user, action: 'CREATE', entityType: 'PurchaseOrder', entityId: po._id, description: `${req.user.name} generated ${po.poNumber} for ${quotation.vendor.name}` });

    res.status(201).json(po);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updatePurchaseOrder = async (req, res) => {
  try {
    const po = await PurchaseOrder.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!po) return res.status(404).json({ message: 'PO not found' });
    await log({ user: req.user, action: 'UPDATE', entityType: 'PurchaseOrder', entityId: po._id, description: `${req.user.name} updated ${po.poNumber} status to ${po.status}` });
    res.json(po);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
