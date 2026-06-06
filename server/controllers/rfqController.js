const RFQ = require('../models/RFQ');
const { log } = require('../utils/logger');

exports.getRFQs = async (req, res) => {
  try {
    const { status, vendorId } = req.query;
    const query = {};
    if (status) query.status = status;

    if (req.user.role === 'Vendor' && req.user.vendorId) {
      query.assignedVendors = req.user.vendorId;
      query.status = { $in: ['Sent', 'Under Review', 'Approved', 'Closed'] };
    }

    const rfqs = await RFQ.find(query)
      .populate('createdBy', 'name email')
      .populate('assignedVendors', 'name email category')
      .sort('-createdAt');
    res.json(rfqs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRFQ = async (req, res) => {
  try {
    const rfq = await RFQ.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedVendors', 'name email category phone');
    if (!rfq) return res.status(404).json({ message: 'RFQ not found' });
    res.json(rfq);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createRFQ = async (req, res) => {
  try {
    const rfq = await RFQ.create({ ...req.body, createdBy: req.user._id });
    await log({ user: req.user, action: 'CREATE', entityType: 'RFQ', entityId: rfq._id, description: `${req.user.name} created RFQ: ${rfq.title}` });
    res.status(201).json(rfq);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateRFQ = async (req, res) => {
  try {
    const rfq = await RFQ.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!rfq) return res.status(404).json({ message: 'RFQ not found' });
    await log({ user: req.user, action: 'UPDATE', entityType: 'RFQ', entityId: rfq._id, description: `${req.user.name} updated RFQ: ${rfq.title}` });
    res.json(rfq);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.sendRFQ = async (req, res) => {
  try {
    const rfq = await RFQ.findByIdAndUpdate(
      req.params.id,
      { status: 'Sent' },
      { new: true }
    ).populate('assignedVendors', 'name email');
    if (!rfq) return res.status(404).json({ message: 'RFQ not found' });
    await log({ user: req.user, action: 'SEND', entityType: 'RFQ', entityId: rfq._id, description: `${req.user.name} sent RFQ "${rfq.title}" to ${rfq.assignedVendors.length} vendors` });
    res.json({ message: 'RFQ sent to vendors', rfq });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
