const mongoose = require('mongoose');

const lineItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, default: 'Nos' },
  estimatedPrice: { type: Number, default: 0 },
});

const rfqSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    category: {
      type: String,
      enum: ['IT & Software', 'Infrastructure', 'Furniture', 'Office Supplies', 'Other'],
      required: true,
    },
    deadline: { type: Date, required: true },
    status: {
      type: String,
      enum: ['Draft', 'Sent', 'Under Review', 'Approved', 'Closed'],
      default: 'Draft',
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedVendors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' }],
    items: [lineItemSchema],
    attachments: [{ filename: String, path: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('RFQ', rfqSchema);
