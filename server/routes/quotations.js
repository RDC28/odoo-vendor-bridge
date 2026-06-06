const router = require('express').Router();
const { getQuotations, getQuotation, createQuotation, updateQuotation, compareQuotations } = require('../controllers/quotationController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getQuotations);
router.get('/:id', getQuotation);
router.post('/', createQuotation);
router.put('/:id', updateQuotation);
router.get('/compare/:rfqId', compareQuotations);

module.exports = router;
