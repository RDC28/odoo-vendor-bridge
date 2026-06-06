const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String },
    action: { type: String, required: true },
    entityType: {
      type: String,
      enum: ['RFQ', 'Quotation', 'Approval', 'PurchaseOrder', 'Invoice', 'Vendor', 'User'],
    },
    entityId: { type: mongoose.Schema.Types.ObjectId },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ActivityLog', activityLogSchema);
