const router = require('express').Router();
const { getInvoices, getInvoice, createInvoice, downloadPDF, sendEmail, updateInvoice } = require('../controllers/invoiceController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getInvoices);
router.get('/:id', getInvoice);
router.post('/', authorize('Admin', 'Procurement Officer'), createInvoice);
router.get('/:id/pdf', downloadPDF);
router.post('/:id/email', authorize('Admin', 'Procurement Officer'), sendEmail);
router.put('/:id', authorize('Admin', 'Procurement Officer'), updateInvoice);

module.exports = router;
