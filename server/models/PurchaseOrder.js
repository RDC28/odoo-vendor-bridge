const mongoose = require('mongoose');

const poItemSchema = new mongoose.Schema({
  name: String,
  quantity: Number,
  unit: String,
  unitPrice: Number,
  totalPrice: Number,
});

const purchaseOrderSchema = new mongoose.Schema(
  {
    poNumber: { type: String, unique: true },
    rfq: { type: mongoose.Schema.Types.ObjectId, ref: 'RFQ', required: true },
    quotation: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation', required: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [poItemSchema],
    subtotal: { type: Number, required: true },
    taxRate: { type: Number, default: 18 },
    taxAmount: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['Draft', 'Confirmed', 'Delivered', 'Paid', 'Cancelled'],
      default: 'Confirmed',
    },
    deliveryDays: { type: Number },
    notes: { type: String },
  },
  { timestamps: true }
);

purchaseOrderSchema.pre('save', async function (next) {
  if (!this.poNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('PurchaseOrder').countDocuments();
    this.poNumber = `PO-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);
