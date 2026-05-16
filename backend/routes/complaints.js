const express = require('express');
const router = express.Router();
const {
  getComplaints, getComplaint, createComplaint, updateComplaint,
  deleteComplaint, getComplaintStats,
} = require('../controllers/complaintController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);
router.get('/stats', adminOnly, getComplaintStats);
router.get('/', getComplaints);
router.post('/', createComplaint);
router.get('/:id', getComplaint);
router.put('/:id', adminOnly, updateComplaint);
router.delete('/:id', adminOnly, deleteComplaint);

module.exports = router;
