const Approval = require('../models/Approval');
const Quotation = require('../models/Quotation');
const RFQ = require('../models/RFQ');
const { log } = require('../utils/logger');

exports.getApprovals = async (req, res) => {
  try {
    const query = {};
    if (req.query.status) query.status = req.query.status;
    const approvals = await Approval.find(query)
      .populate('rfq', 'title category')
      .populate('quotation')
      .populate({ path: 'quotation', populate: { path: 'vendor', select: 'name email' } })
      .populate('requestedBy', 'name')
      .populate('approver', 'name')
      .sort('-createdAt');
    res.json(approvals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createApproval = async (req, res) => {
  try {
    const { rfqId, quotationId } = req.body;
    const existing = await Approval.findOne({ rfq: rfqId, quotation: quotationId });
    if (existing) return res.status(400).json({ message: 'Approval request already exists' });

    const approval = await Approval.create({
      rfq: rfqId,
      quotation: quotationId,
      requestedBy: req.user._id,
    });

    await Quotation.findByIdAndUpdate(quotationId, { status: 'Under Review' });
    await log({ user: req.user, action: 'REQUEST_APPROVAL', entityType: 'Approval', entityId: approval._id, description: `${req.user.name} requested approval for quotation` });

    res.status(201).json(approval);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.decideApproval = async (req, res) => {
  try {
    const { status, remarks } = req.body;
    if (!['Approved', 'Rejected'].includes(status))
      return res.status(400).json({ message: 'Status must be Approved or Rejected' });

    const approval = await Approval.findByIdAndUpdate(
      req.params.id,
      { status, remarks, approver: req.user._id, decidedAt: new Date() },
      { new: true }
    ).populate('rfq').populate('quotation');

    if (!approval) return res.status(404).json({ message: 'Approval not found' });

    if (status === 'Approved') {
      await Quotation.findByIdAndUpdate(approval.quotation._id, { status: 'Selected' });
      await RFQ.findByIdAndUpdate(approval.rfq._id, { status: 'Approved' });
    } else {
      await Quotation.findByIdAndUpdate(approval.quotation._id, { status: 'Rejected' });
    }

    await log({
      user: req.user,
      action: status.toUpperCase(),
      entityType: 'Approval',
      entityId: approval._id,
      description: `${req.user.name} ${status.toLowerCase()} approval for RFQ: ${approval.rfq.title}${remarks ? ` — "${remarks}"` : ''}`,
    });

    res.json(approval);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
