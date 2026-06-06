const Quotation = require('../models/Quotation');
const RFQ = require('../models/RFQ');
const { log } = require('../utils/logger');

exports.getQuotations = async (req, res) => {
  try {
    const { rfqId, vendorId } = req.query;
    const query = {};
    if (rfqId) query.rfq = rfqId;
    if (vendorId) query.vendor = vendorId;

    if (req.user.role === 'Vendor' && req.user.vendorId) {
      query.vendor = req.user.vendorId;
    }

    const quotations = await Quotation.find(query)
      .populate('rfq', 'title category deadline items status')
      .populate('vendor', 'name email category')
      .populate('submittedBy', 'name')
      .sort('-createdAt');
    res.json(quotations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getQuotation = async (req, res) => {
  try {
    const q = await Quotation.findById(req.params.id)
      .populate('rfq')
      .populate('vendor')
      .populate('submittedBy', 'name');
    if (!q) return res.status(404).json({ message: 'Quotation not found' });
    res.json(q);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createQuotation = async (req, res) => {
  try {
    const rfqId = req.body.rfq || req.body.rfqId;
    const vendorId = req.body.vendor || req.body.vendorId;
    const { items, deliveryDays, notes } = req.body;

    const existing = await Quotation.findOne({ rfq: rfqId, vendor: vendorId || req.user.vendorId });
    if (existing) return res.status(400).json({ message: 'Quotation already submitted for this RFQ' });

    const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const q = await Quotation.create({
      rfq: rfqId,
      vendor: vendorId || req.user.vendorId,
      submittedBy: req.user._id,
      items,
      totalAmount,
      deliveryDays,
      notes,
      status: req.body.status || 'Submitted',
    });

    if (q.status !== 'Draft') {
      await RFQ.findByIdAndUpdate(rfqId, { status: 'Under Review' });
    }
    await log({ user: req.user, action: 'SUBMIT', entityType: 'Quotation', entityId: q._id, description: `${req.user.name} ${q.status === 'Draft' ? 'saved a draft' : 'submitted'} quotation for RFQ` });

    res.status(201).json(q);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateQuotation = async (req, res) => {
  try {
    if (req.body.items) {
      req.body.totalAmount = req.body.items.reduce((sum, item) => sum + item.totalPrice, 0);
    }
    const q = await Quotation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!q) return res.status(404).json({ message: 'Quotation not found' });
    res.json(q);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.compareQuotations = async (req, res) => {
  try {
    const { rfqId } = req.params;
    const rfq = await RFQ.findById(rfqId);
    if (!rfq) return res.status(404).json({ message: 'RFQ not found' });

    const quotations = await Quotation.find({ rfq: rfqId })
      .populate('vendor', 'name email')
      .sort('totalAmount');

    const itemMap = {};
    quotations.forEach(q => {
      q.items.forEach(item => {
        if (!itemMap[item.name] || item.unitPrice < itemMap[item.name]) {
          itemMap[item.name] = item.unitPrice;
        }
      });
    });

    res.json({ rfq, quotations, lowestPrices: itemMap });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
