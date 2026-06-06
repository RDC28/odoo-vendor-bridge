const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, unique: true },
    purchaseOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseOrder', required: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subtotal: { type: Number, required: true },
    taxAmount: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled'],
      default: 'Draft',
    },
    dueDate: { type: Date },
    paidAt: { type: Date },
    emailSentAt: { type: Date },
  },
  { timestamps: true }
);

invoiceSchema.pre('save', async function (next) {
  if (!this.invoiceNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Invoice').countDocuments();
    this.invoiceNumber = `INV-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  if (!this.dueDate) {
    const due = new Date();
    due.setDate(due.getDate() + 30);
    this.dueDate = due;
  }
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);
