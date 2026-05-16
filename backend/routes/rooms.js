const express = require('express');
const router = express.Router();
const {
  getRooms, getRoom, createRoom, updateRoom, deleteRoom,
  assignStudent, unassignStudent, getRoomStats,
} = require('../controllers/roomController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);
router.get('/stats', adminOnly, getRoomStats);
router.get('/', getRooms);
router.get('/:id', getRoom);
router.post('/', adminOnly, createRoom);
router.put('/:id', adminOnly, updateRoom);
router.delete('/:id', adminOnly, deleteRoom);
router.post('/:id/assign', adminOnly, assignStudent);
router.post('/:id/unassign', adminOnly, unassignStudent);

module.exports = router;
