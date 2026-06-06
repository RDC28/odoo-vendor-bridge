const router = require('express').Router();
const { getSummary, getSpendByCategory, getTopVendors, getMonthlyTrend } = require('../controllers/reportsController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/summary', getSummary);
router.get('/spend-by-category', getSpendByCategory);
router.get('/top-vendors', getTopVendors);
router.get('/monthly-trend', getMonthlyTrend);

module.exports = router;
