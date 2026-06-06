const mongoose = require('mongoose');

const quotationItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, default: 'Nos' },
  unitPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
});

const quotationSchema = new mongoose.Schema(
  {
    rfq: { type: mongoose.Schema.Types.ObjectId, ref: 'RFQ', required: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [quotationItemSchema],
    totalAmount: { type: Number, required: true },
    deliveryDays: { type: Number, required: true },
    notes: { type: String },
    status: {
      type: String,
      enum: ['Draft', 'Submitted', 'Under Review', 'Selected', 'Rejected'],
      default: 'Draft',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quotation', quotationSchema);
