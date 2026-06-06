const PurchaseOrder = require('../models/PurchaseOrder');
const Invoice = require('../models/Invoice');
const Vendor = require('../models/Vendor');
const RFQ = require('../models/RFQ');
const Approval = require('../models/Approval');

exports.getSummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const y = parseInt(year) || now.getFullYear();
    const m = parseInt(month) || now.getMonth() + 1;
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59);

    const [totalSpend, activeVendors, activeRFQs, pendingApprovals, pendingInvoices, fulfilledPOs, totalPOs] = await Promise.all([
      PurchaseOrder.aggregate([{ $match: { createdAt: { $gte: start, $lte: end } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Vendor.countDocuments({ status: 'Active' }),
      RFQ.countDocuments({ status: { $in: ['Sent', 'Under Review'] } }),
      Approval.countDocuments({ status: 'Pending' }),
      Invoice.countDocuments({ status: { $in: ['Draft', 'Sent', 'Overdue'] } }),
      PurchaseOrder.countDocuments({ status: { $in: ['Delivered', 'Paid'] }, createdAt: { $gte: start, $lte: end } }),
      PurchaseOrder.countDocuments({ createdAt: { $gte: start, $lte: end } }),
    ]);

    res.json({
      totalSpend: totalSpend[0]?.total || 0,
      activeVendors,
      activeRFQs,
      pendingApprovals,
      pendingInvoices,
      poFulfilledPct: totalPOs > 0 ? Math.round((fulfilledPOs / totalPOs) * 100) : 0,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSpendByCategory = async (req, res) => {
  try {
    const data = await PurchaseOrder.aggregate([
      { $lookup: { from: 'rfqs', localField: 'rfq', foreignField: '_id', as: 'rfqData' } },
      { $unwind: '$rfqData' },
      { $group: { _id: '$rfqData.category', total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTopVendors = async (req, res) => {
  try {
    const data = await PurchaseOrder.aggregate([
      { $group: { _id: '$vendor', totalSpend: { $sum: '$totalAmount' }, poCount: { $sum: 1 } } },
      { $sort: { totalSpend: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'vendors', localField: '_id', foreignField: '_id', as: 'vendorData' } },
      { $unwind: '$vendorData' },
      { $project: { vendorName: '$vendorData.name', category: '$vendorData.category', totalSpend: 1, poCount: 1 } },
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMonthlyTrend = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const data = await PurchaseOrder.aggregate([
      { $match: { createdAt: { $gte: new Date(year, 0, 1), $lte: new Date(year, 11, 31) } } },
      { $group: { _id: { month: { $month: '$createdAt' } }, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
      { $sort: { '_id.month': 1 } },
    ]);
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const filled = months.map((label, i) => {
      const found = data.find(d => d._id.month === i + 1);
      return { month: label, total: found?.total || 0, count: found?.count || 0 };
    });
    res.json(filled);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
