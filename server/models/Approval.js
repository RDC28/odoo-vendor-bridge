const mongoose = require('mongoose');

const approvalSchema = new mongoose.Schema(
  {
    rfq: { type: mongoose.Schema.Types.ObjectId, ref: 'RFQ', required: true },
    quotation: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation', required: true },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    approver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    remarks: { type: String },
    decidedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Approval', approvalSchema);
