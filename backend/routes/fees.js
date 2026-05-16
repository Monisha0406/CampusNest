const express = require('express');
const router = express.Router();
const { getFees, getFee, createFee, recordPayment, updateFee, deleteFee, getFeeStats } = require('../controllers/feeController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);
router.get('/stats', adminOnly, getFeeStats);
router.get('/', getFees);
router.get('/:id', getFee);
router.post('/', adminOnly, createFee);
router.post('/:id/pay', adminOnly, recordPayment);
router.put('/:id', adminOnly, updateFee);
router.delete('/:id', adminOnly, deleteFee);

module.exports = router;
