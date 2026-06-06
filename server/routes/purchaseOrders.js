const router = require('express').Router();
const { getPurchaseOrders, getPurchaseOrder, createPurchaseOrder, updatePurchaseOrder } = require('../controllers/purchaseOrderController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getPurchaseOrders);
router.get('/:id', getPurchaseOrder);
router.post('/', authorize('Admin', 'Procurement Officer', 'Manager'), createPurchaseOrder);
router.put('/:id', authorize('Admin', 'Procurement Officer'), updatePurchaseOrder);

module.exports = router;
