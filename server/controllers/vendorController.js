const Vendor = require('../models/Vendor');
const { log } = require('../utils/logger');

exports.getVendors = async (req, res) => {
  try {
    const { category, status, search } = req.query;
    const query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    if (search) query.name = { $regex: search, $options: 'i' };
    const vendors = await Vendor.find(query).sort('-createdAt');
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    res.json(vendor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createVendor = async (req, res) => {
  try {
    const vendor = await Vendor.create(req.body);
    await log({ user: req.user, action: 'CREATE', entityType: 'Vendor', entityId: vendor._id, description: `${req.user.name} added vendor: ${vendor.name}` });
    res.status(201).json(vendor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    await log({ user: req.user, action: 'UPDATE', entityType: 'Vendor', entityId: vendor._id, description: `${req.user.name} updated vendor: ${vendor.name}` });
    res.json(vendor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndDelete(req.params.id);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    await log({ user: req.user, action: 'DELETE', entityType: 'Vendor', entityId: vendor._id, description: `${req.user.name} deleted vendor: ${vendor.name}` });
    res.json({ message: 'Vendor deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
