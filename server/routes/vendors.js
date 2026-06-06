const router = require('express').Router();
const { getVendors, getVendor, createVendor, updateVendor, deleteVendor } = require('../controllers/vendorController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getVendors);
router.get('/:id', getVendor);
router.post('/', authorize('Admin', 'Procurement Officer'), createVendor);
router.put('/:id', authorize('Admin', 'Procurement Officer'), updateVendor);
router.delete('/:id', authorize('Admin'), deleteVendor);

module.exports = router;
