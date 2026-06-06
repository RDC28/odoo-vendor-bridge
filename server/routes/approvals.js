const router = require('express').Router();
const { getApprovals, createApproval, decideApproval } = require('../controllers/approvalController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getApprovals);
router.post('/', authorize('Admin', 'Procurement Officer'), createApproval);
router.put('/:id', authorize('Admin', 'Manager'), decideApproval);

module.exports = router;
