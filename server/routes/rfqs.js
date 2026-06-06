const router = require('express').Router();
const { getRFQs, getRFQ, createRFQ, updateRFQ, sendRFQ } = require('../controllers/rfqController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getRFQs);
router.get('/:id', getRFQ);
router.post('/', authorize('Admin', 'Procurement Officer'), createRFQ);
router.put('/:id', authorize('Admin', 'Procurement Officer'), updateRFQ);
router.post('/:id/send', authorize('Admin', 'Procurement Officer'), sendRFQ);

module.exports = router;
