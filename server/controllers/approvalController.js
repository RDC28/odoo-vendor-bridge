const Approval = require('../models/Approval');
const Quotation = require('../models/Quotation');
const RFQ = require('../models/RFQ');
const PurchaseOrder = require('../models/PurchaseOrder');
const Invoice = require('../models/Invoice');
const { log } = require('../utils/logger');
const { notify } = require('../utils/notify');

exports.getApprovals = async (req, res) => {
  try {
    const query = {};
    if (req.query.status) query.status = req.query.status;
    const approvals = await Approval.find(query)
      .populate({ path: 'rfq', populate: { path: 'createdBy', select: 'name' } })
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

    await notify({
      roles: ['Manager'],
      title: 'Approval Required',
      message: `${req.user.name} has requested manager approval for a vendor quotation.`,
      link: '/approvals'
    });

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
      const quotation = approval.quotation;
      const subtotal = quotation.totalAmount;
      const taxAmount = Math.round(subtotal * 0.18);
      const totalAmount = subtotal + taxAmount;

      const po = await PurchaseOrder.create({
        rfq: approval.rfq._id,
        quotation: quotation._id,
        vendor: quotation.vendor,
        createdBy: req.user._id,
        items: quotation.items,
        subtotal,
        taxAmount,
        totalAmount,
        deliveryDays: quotation.deliveryDays,
        notes: quotation.notes,
      });

      const invoice = await Invoice.create({
        purchaseOrder: po._id,
        vendor: po.vendor,
        createdBy: req.user._id,
        subtotal: po.subtotal,
        taxAmount: po.taxAmount,
        totalAmount: po.totalAmount,
        status: 'Draft',
      });

      const vendorUserId = await require('../models/User').findOne({ vendorId: quotation.vendor });
      if (vendorUserId) {
        await notify({
          userId: vendorUserId._id,
          title: 'New PO & Invoice',
          message: `Purchase Order ${po.poNumber} and Invoice ${invoice.invoiceNumber} generated.`,
          link: '/purchase-orders'
        });
      }
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

    await notify({
      userId: approval.requestedBy,
      title: `Approval ${status}`,
      message: `Your approval request for RFQ "${approval.rfq.title}" has been ${status.toLowerCase()} by ${req.user.name}.`,
      link: '/approvals'
    });

    res.json(approval);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
