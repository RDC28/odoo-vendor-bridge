require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Vendor = require('../models/Vendor');
const RFQ = require('../models/RFQ');
const Quotation = require('../models/Quotation');
const Approval = require('../models/Approval');
const PurchaseOrder = require('../models/PurchaseOrder');
const Invoice = require('../models/Invoice');
const ActivityLog = require('../models/ActivityLog');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Vendor.deleteMany({}),
      RFQ.deleteMany({}),
      Quotation.deleteMany({}),
      Approval.deleteMany({}),
      PurchaseOrder.deleteMany({}),
      Invoice.deleteMany({}),
      ActivityLog.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // Create vendors
    const vendors = await Vendor.insertMany([
      { name: 'TechCore Ltd', email: 'techcore@example.com', phone: '+91 98200 11234', gstNumber: '27AABCT1234P1Z5', category: 'IT & Software', country: 'India', status: 'Active' },
      { name: 'Infra Supplies', email: 'infra@example.com', phone: '+91 98760 43210', gstNumber: '29AACTS9876Q2A1', category: 'Infrastructure', country: 'India', status: 'Active' },
      { name: 'FurniCo', email: 'furnico@example.com', phone: '+91 97531 86420', gstNumber: '06AAFCF3456R3Z9', category: 'Furniture', country: 'India', status: 'Active' },
      { name: 'StatioMart', email: 'statio@example.com', phone: '+91 96320 75310', gstNumber: '24AAACS7654S4B2', category: 'Office Supplies', country: 'India', status: 'Active' },
      { name: 'FormsLog', email: 'forms@example.com', phone: '+91 95100 64200', gstNumber: '19AABCF4567T5C3', category: 'IT & Software', country: 'India', status: 'Active' },
      { name: 'CloudNet Systems', email: 'cloudnet@example.com', phone: '+91 94100 55500', gstNumber: '07AABCF5555T1A1', category: 'IT & Software', country: 'India', status: 'Active' },
      { name: 'BuildRight Materials', email: 'buildright@example.com', phone: '+91 93100 44400', gstNumber: '05AABCF4444T2B2', category: 'Infrastructure', country: 'India', status: 'Active' },
    ]);
    console.log(`✅ Created ${vendors.length} vendors`);

    // Create users (password: password123 for all)
    const hashedPassword = await bcrypt.hash('password123', 12);
    const users = await User.insertMany([
      { name: 'Admin', email: 'admin@vendorbridge.com', password: hashedPassword, role: 'Admin' },
      { name: 'Arjun Kumar', email: 'arjun@vendorbridge.com', password: hashedPassword, role: 'Procurement Officer' },
      { name: 'Priya Manager', email: 'priya@vendorbridge.com', password: hashedPassword, role: 'Manager' },
      { name: 'Ravi Vendor', email: 'ravi@vendorbridge.com', password: hashedPassword, role: 'Vendor', vendorId: vendors[0]._id },
      { name: 'Deepak Vendor', email: 'deepak@vendorbridge.com', password: hashedPassword, role: 'Vendor', vendorId: vendors[1]._id },
      { name: 'Neha Officer', email: 'neha@vendorbridge.com', password: hashedPassword, role: 'Procurement Officer' },
      { name: 'Sanjay Vendor', email: 'sanjay@vendorbridge.com', password: hashedPassword, role: 'Vendor', vendorId: vendors[5]._id },
      { name: 'Rohan Vendor', email: 'rohan@vendorbridge.com', password: hashedPassword, role: 'Vendor', vendorId: vendors[6]._id },
    ]);
    console.log(`✅ Created ${users.length} users`);

    const [admin, officer, manager, vendorUser1, vendorUser2, officer2, vendorUser3, vendorUser4] = users;
    const [techcore, infra, furnico, statio, formslog, cloudnet, buildright] = vendors;

    // RFQ 1: Office Furniture (Sent - with quotations)
    const rfq1 = await RFQ.create({
      title: 'Office Furniture Q4 2024',
      description: 'Procurement of ergonomic chairs, L-shaped desks, and storage units for the new Goa office wing (approx. 40 seats).',
      category: 'Furniture',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'Sent',
      createdBy: officer._id,
      assignedVendors: [furnico._id, techcore._id, infra._id, statio._id],
      items: [
        { name: 'Ergonomic Chair', quantity: 40, unit: 'Nos', estimatedPrice: 8500 },
        { name: 'L-Shaped Desk', quantity: 20, unit: 'Nos', estimatedPrice: 15000 },
      ],
    });

    // RFQ 2: Network Equipment (Approved - full workflow complete)
    const rfq2 = await RFQ.create({
      title: 'Network Equipment',
      description: 'Switches, routers, and cabling for new data center.',
      category: 'IT & Software',
      deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      status: 'Approved',
      createdBy: officer._id,
      assignedVendors: [techcore._id, formslog._id, infra._id],
      items: [
        { name: 'Managed Switch 24-Port', quantity: 10, unit: 'Nos', estimatedPrice: 12000 },
        { name: 'Router Enterprise', quantity: 5, unit: 'Nos', estimatedPrice: 25000 },
        { name: 'CAT6 Cable (305m)', quantity: 20, unit: 'Box', estimatedPrice: 4500 },
      ],
    });

    // RFQ 3: Stationery Supplies (Sent)
    const rfq3 = await RFQ.create({
      title: 'Stationery Supplies',
      description: 'Pens, paper, folders, and whiteboard markers for office use.',
      category: 'Office Supplies',
      deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      status: 'Sent',
      createdBy: officer._id,
      assignedVendors: [statio._id, formslog._id],
      items: [
        { name: 'A4 Copy Paper (500 sheets)', quantity: 20, unit: 'Ream', estimatedPrice: 420 },
        { name: 'Ballpoint Pens (Blue)', quantity: 10, unit: 'Box', estimatedPrice: 180 },
        { name: 'Document Folders', quantity: 50, unit: 'Nos', estimatedPrice: 65 },
        { name: 'Whiteboard Markers', quantity: 5, unit: 'Pack', estimatedPrice: 340 },
      ],
    });

    // RFQ 4: Cloud Hosting Services
    const rfq4 = await RFQ.create({
      title: 'Cloud Hosting Services 2025',
      description: 'Annual contract for cloud hosting infrastructure, load balancers, and CDN.',
      category: 'IT & Software',
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      status: 'Sent',
      createdBy: officer2._id,
      assignedVendors: [techcore._id, formslog._id, cloudnet._id],
      items: [
        { name: 'Compute Instances (Annual)', quantity: 20, unit: 'Nos', estimatedPrice: 150000 },
        { name: 'Managed Database', quantity: 2, unit: 'Nos', estimatedPrice: 200000 },
      ],
    });

    // RFQ 5: Building Materials for Warehouse
    const rfq5 = await RFQ.create({
      title: 'Building Materials for Warehouse',
      description: 'Cement, steel, and roofing for the new warehouse expansion.',
      category: 'Infrastructure',
      deadline: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // deadline passed
      status: 'Closed',
      createdBy: officer._id,
      assignedVendors: [infra._id, buildright._id],
      items: [
        { name: 'Portland Cement', quantity: 500, unit: 'Bags', estimatedPrice: 350 },
        { name: 'TMT Steel Bars', quantity: 10, unit: 'Tons', estimatedPrice: 60000 },
      ],
    });

    console.log(`✅ Created 5 RFQs`);

    // Quotations for RFQ 1 (Office Furniture)
    const q1_furnico = await Quotation.create({
      rfq: rfq1._id, vendor: furnico._id, submittedBy: officer._id,
      items: [
        { name: 'Ergonomic Chair', quantity: 40, unit: 'Nos', unitPrice: 8200, totalPrice: 328000 },
        { name: 'L-Shaped Desk', quantity: 20, unit: 'Nos', unitPrice: 14000, totalPrice: 280000 },
      ],
      totalAmount: 608000, deliveryDays: 14, notes: 'Includes basic installation.', status: 'Submitted',
    });

    const q1_techcore = await Quotation.create({
      rfq: rfq1._id, vendor: techcore._id, submittedBy: vendorUser1._id,
      items: [
        { name: 'Ergonomic Chair', quantity: 40, unit: 'Nos', unitPrice: 7800, totalPrice: 312000 },
        { name: 'L-Shaped Desk', quantity: 20, unit: 'Nos', unitPrice: 13500, totalPrice: 270000 },
      ],
      totalAmount: 582000, deliveryDays: 14, notes: 'Includes installation. 1-year warranty on all items.', status: 'Submitted',
    });

    const q1_infra = await Quotation.create({
      rfq: rfq1._id, vendor: infra._id, submittedBy: vendorUser2._id,
      items: [
        { name: 'Ergonomic Chair', quantity: 40, unit: 'Nos', unitPrice: 8600, totalPrice: 344000 },
        { name: 'L-Shaped Desk', quantity: 20, unit: 'Nos', unitPrice: 15200, totalPrice: 304000 },
      ],
      totalAmount: 648000, deliveryDays: 21, notes: 'Premium quality, extended warranty.', status: 'Submitted',
    });

    const q1_statio = await Quotation.create({
      rfq: rfq1._id, vendor: statio._id, submittedBy: officer._id,
      items: [
        { name: 'Ergonomic Chair', quantity: 40, unit: 'Nos', unitPrice: 9100, totalPrice: 364000 },
        { name: 'L-Shaped Desk', quantity: 20, unit: 'Nos', unitPrice: 13800, totalPrice: 276000 },
      ],
      totalAmount: 640000, deliveryDays: 10, notes: 'Quick delivery, basic warranty.', status: 'Submitted',
    });

    // Quotations for RFQ 2 (Network Equipment) — selected TechCore
    const q2_techcore = await Quotation.create({
      rfq: rfq2._id, vendor: techcore._id, submittedBy: vendorUser1._id,
      items: [
        { name: 'Managed Switch 24-Port', quantity: 10, unit: 'Nos', unitPrice: 11000, totalPrice: 110000 },
        { name: 'Router Enterprise', quantity: 5, unit: 'Nos', unitPrice: 23000, totalPrice: 115000 },
        { name: 'CAT6 Cable (305m)', quantity: 20, unit: 'Box', unitPrice: 4000, totalPrice: 80000 },
      ],
      totalAmount: 305000, deliveryDays: 7, notes: 'Certified Cisco partner. Includes setup support.', status: 'Selected',
    });

    const q2_formslog = await Quotation.create({
      rfq: rfq2._id, vendor: formslog._id, submittedBy: officer._id,
      items: [
        { name: 'Managed Switch 24-Port', quantity: 10, unit: 'Nos', unitPrice: 12500, totalPrice: 125000 },
        { name: 'Router Enterprise', quantity: 5, unit: 'Nos', unitPrice: 26000, totalPrice: 130000 },
        { name: 'CAT6 Cable (305m)', quantity: 20, unit: 'Box', unitPrice: 4200, totalPrice: 84000 },
      ],
      totalAmount: 339000, deliveryDays: 10, notes: 'Standard pricing.', status: 'Rejected',
    });

    // Quotation for RFQ 3 (Stationery)
    const q3_statio = await Quotation.create({
      rfq: rfq3._id, vendor: statio._id, submittedBy: officer._id,
      items: [
        { name: 'A4 Copy Paper (500 sheets)', quantity: 20, unit: 'Ream', unitPrice: 420, totalPrice: 8400 },
        { name: 'Ballpoint Pens (Blue)', quantity: 10, unit: 'Box', unitPrice: 180, totalPrice: 1800 },
        { name: 'Document Folders', quantity: 50, unit: 'Nos', unitPrice: 65, totalPrice: 3250 },
        { name: 'Whiteboard Markers', quantity: 5, unit: 'Pack', unitPrice: 340, totalPrice: 1700 },
      ],
      totalAmount: 15150, deliveryDays: 5, notes: 'Ready stock. Same-week delivery.', status: 'Submitted',
    });

    // Quotations for RFQ 4
    const q4_cloudnet = await Quotation.create({
      rfq: rfq4._id, vendor: cloudnet._id, submittedBy: vendorUser3._id,
      items: [
        { name: 'Compute Instances (Annual)', quantity: 20, unit: 'Nos', unitPrice: 145000, totalPrice: 2900000 },
        { name: 'Managed Database', quantity: 2, unit: 'Nos', unitPrice: 190000, totalPrice: 380000 },
      ],
      totalAmount: 3280000, deliveryDays: 2, notes: 'Enterprise SLAs included.', status: 'Submitted',
    });

    // Quotations for RFQ 5
    const q5_buildright = await Quotation.create({
      rfq: rfq5._id, vendor: buildright._id, submittedBy: vendorUser4._id,
      items: [
        { name: 'Portland Cement', quantity: 500, unit: 'Bags', unitPrice: 340, totalPrice: 170000 },
        { name: 'TMT Steel Bars', quantity: 10, unit: 'Tons', unitPrice: 58000, totalPrice: 580000 },
      ],
      totalAmount: 750000, deliveryDays: 10, notes: 'Includes transport.', status: 'Selected',
    });

    console.log(`✅ Created quotations`);

    // Approval for RFQ 2 — Approved
    const approval1 = await Approval.create({
      rfq: rfq2._id, quotation: q2_techcore._id, requestedBy: officer._id,
      approver: manager._id, status: 'Approved', remarks: 'Best price and certified partner. Approved.',
      decidedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    });

    const approval2 = await Approval.create({
      rfq: rfq5._id, quotation: q5_buildright._id, requestedBy: officer._id,
      approver: manager._id, status: 'Approved', remarks: 'Good pricing for bulk.',
      decidedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    });

    console.log(`✅ Created approvals`);

    // PO for RFQ 2
    const po1 = await PurchaseOrder.create({
      poNumber: `PO-${new Date().getFullYear()}-0001`,
      rfq: rfq2._id, quotation: q2_techcore._id, vendor: techcore._id, createdBy: officer._id,
      items: q2_techcore.items,
      subtotal: 305000, taxAmount: 54900, totalAmount: 359900,
      status: 'Confirmed', deliveryDays: 7,
    });

    // PO for stationery (Paid)
    const po2 = await PurchaseOrder.create({
      poNumber: `PO-${new Date().getFullYear()}-0002`,
      rfq: rfq3._id, quotation: q3_statio._id, vendor: statio._id, createdBy: officer._id,
      items: q3_statio.items,
      subtotal: 15150, taxAmount: 2727, totalAmount: 17877,
      status: 'Paid', deliveryDays: 5,
    });

    const po3 = await PurchaseOrder.create({
      poNumber: `PO-${new Date().getFullYear()}-0003`,
      rfq: rfq5._id, quotation: q5_buildright._id, vendor: buildright._id, createdBy: officer._id,
      items: q5_buildright.items,
      subtotal: 750000, taxAmount: 135000, totalAmount: 885000,
      status: 'Confirmed', deliveryDays: 10,
    });

    console.log(`✅ Created purchase orders`);

    // Invoice for PO2 (Paid)
    const inv1 = await Invoice.create({
      invoiceNumber: `INV-${new Date().getFullYear()}-0001`,
      purchaseOrder: po2._id, vendor: statio._id, createdBy: officer._id,
      subtotal: 15150, taxAmount: 2727, totalAmount: 17877,
      status: 'Paid', paidAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    });

    // Invoice for PO1 (Draft)
    const inv2 = await Invoice.create({
      invoiceNumber: `INV-${new Date().getFullYear()}-0002`,
      purchaseOrder: po1._id, vendor: techcore._id, createdBy: officer._id,
      subtotal: 305000, taxAmount: 54900, totalAmount: 359900,
      status: 'Draft',
    });

    const inv3 = await Invoice.create({
      invoiceNumber: `INV-${new Date().getFullYear()}-0003`,
      purchaseOrder: po3._id, vendor: buildright._id, createdBy: officer._id,
      subtotal: 750000, taxAmount: 135000, totalAmount: 885000,
      status: 'Paid', paidAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    });

    console.log(`✅ Created invoices`);

    // Activity logs
    const now = Date.now();
    await ActivityLog.insertMany([
      { user: officer._id, userName: 'Arjun Kumar', action: 'CREATE', entityType: 'RFQ', entityId: rfq1._id, description: 'Arjun Kumar created RFQ: Office Furniture Q4 2024', createdAt: new Date(now - 7 * 24 * 60 * 60 * 1000) },
      { user: officer._id, userName: 'Arjun Kumar', action: 'SEND', entityType: 'RFQ', entityId: rfq1._id, description: 'Arjun Kumar sent RFQ "Office Furniture Q4 2024" to 4 vendors', createdAt: new Date(now - 7 * 24 * 60 * 60 * 1000 + 3600000) },
      { user: officer._id, userName: 'Arjun Kumar', action: 'CREATE', entityType: 'RFQ', entityId: rfq2._id, description: 'Arjun Kumar created RFQ: Network Equipment', createdAt: new Date(now - 6 * 24 * 60 * 60 * 1000) },
      { user: vendorUser1._id, userName: 'Ravi Vendor', action: 'SUBMIT', entityType: 'Quotation', entityId: q2_techcore._id, description: 'Ravi Vendor (TechCore Ltd) submitted quotation for Network Equipment', createdAt: new Date(now - 5 * 24 * 60 * 60 * 1000) },
      { user: vendorUser2._id, userName: 'Deepak Vendor', action: 'SUBMIT', entityType: 'Quotation', entityId: q1_infra._id, description: 'Deepak Vendor (Infra Supplies) submitted quotation for Office Furniture', createdAt: new Date(now - 4 * 24 * 60 * 60 * 1000) },
      { user: manager._id, userName: 'Priya Manager', action: 'APPROVED', entityType: 'Approval', entityId: approval1._id, description: 'Priya Manager approved quotation for RFQ: Network Equipment', createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000) },
      { user: officer._id, userName: 'Arjun Kumar', action: 'CREATE', entityType: 'PurchaseOrder', entityId: po1._id, description: `Arjun Kumar generated ${po1.poNumber} for TechCore Ltd`, createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000 + 3600000) },
      { user: officer._id, userName: 'Arjun Kumar', action: 'CREATE', entityType: 'Invoice', entityId: inv1._id, description: `Arjun Kumar generated invoice ${inv1.invoiceNumber} from ${po2.poNumber}`, createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000) },
      { user: admin._id, userName: 'Admin', action: 'CREATE', entityType: 'Vendor', entityId: formslog._id, description: 'Admin registered new vendor: FormsLog', createdAt: new Date(now - 1 * 24 * 60 * 60 * 1000) },
      { user: manager._id, userName: 'Priya Manager', action: 'REJECTED', entityType: 'Approval', entityId: approval1._id, description: 'Priya Manager rejected quotation from FormsLog — "Price exceeds budget by 18%"', createdAt: new Date(now - 12 * 60 * 60 * 1000) },
      { user: officer2._id, userName: 'Neha Officer', action: 'CREATE', entityType: 'RFQ', entityId: rfq4._id, description: 'Neha Officer created RFQ: Cloud Hosting Services 2025', createdAt: new Date(now - 4 * 24 * 60 * 60 * 1000) },
      { user: vendorUser3._id, userName: 'Sanjay Vendor', action: 'SUBMIT', entityType: 'Quotation', entityId: q4_cloudnet._id, description: 'Sanjay Vendor submitted quotation for Cloud Hosting', createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000) },
    ]);

    console.log(`✅ Created activity logs`);
    console.log('\n🎉 Seed data complete! All demo data is ready.');
    console.log('\n📋 Login credentials (password: password123 for all):');
    console.log('   Admin:    admin@vendorbridge.com');
    console.log('   Officer:  arjun@vendorbridge.com');
    console.log('   Officer2: neha@vendorbridge.com');
    console.log('   Manager:  priya@vendorbridge.com');
    console.log('   Vendor1:  ravi@vendorbridge.com');
    console.log('   Vendor2:  deepak@vendorbridge.com');
    console.log('   Vendor3:  sanjay@vendorbridge.com');
    console.log('   Vendor4:  rohan@vendorbridge.com');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seed();
