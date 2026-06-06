const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const { log } = require('../utils/logger');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone, gstNumber, category } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    let finalVendorId = req.body.vendorId || null;

    if (role === 'Vendor' && !finalVendorId) {
      const vendorExisting = await Vendor.findOne({ email });
      if (vendorExisting) {
        finalVendorId = vendorExisting._id;
      } else {
        const newVendor = await Vendor.create({ name, email, phone, gstNumber, category });
        finalVendorId = newVendor._id;
      }
    }

    const user = await User.create({ name, email, password, role, vendorId: finalVendorId });
    await log({ user, action: 'REGISTER', entityType: 'User', entityId: user._id, description: `${name} registered as ${role}` });

    res.status(201).json({ token: signToken(user._id), user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });

    if (!user.isActive) return res.status(403).json({ message: 'Account is deactivated' });

    let vendorProfile = null;
    if (user.role === 'Vendor' && user.vendorId) {
      vendorProfile = await Vendor.findById(user.vendorId);
    }

    await log({ user, action: 'LOGIN', entityType: 'User', entityId: user._id, description: `${user.name} logged in` });
    res.json({ token: signToken(user._id), user, vendorProfile });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    let vendorProfile = null;
    if (req.user.role === 'Vendor' && req.user.vendorId) {
      vendorProfile = await Vendor.findById(req.user.vendorId);
    }
    res.json({ user: req.user, vendorProfile });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().sort('-createdAt');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
