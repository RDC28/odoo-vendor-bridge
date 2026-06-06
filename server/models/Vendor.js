const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    gstNumber: { type: String, trim: true },
    category: {
      type: String,
      enum: ['IT & Software', 'Infrastructure', 'Furniture', 'Office Supplies', 'Logistics', 'Other'],
      required: true,
    },
    country: { type: String, default: 'India' },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
    address: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vendor', vendorSchema);
