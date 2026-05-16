const Room = require('../models/Room');
const User = require('../models/User');

// @desc    Get all rooms
// @route   GET /api/rooms
const getRooms = async (req, res) => {
  try {
    const { status, type, block, search } = req.query;
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (block) query.block = block;
    if (search) query.roomNumber = { $regex: search, $options: 'i' };

    const rooms = await Room.find(query).populate('occupants', 'name email course').sort({ roomNumber: 1 });
    res.json({ success: true, rooms });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single room
// @route   GET /api/rooms/:id
const getRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('occupants', 'name email phone course gender');
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    res.json({ success: true, room });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create room
// @route   POST /api/rooms
const createRoom = async (req, res) => {
  try {
    const { roomNumber, type, capacity, floor, block, monthlyRent, amenities, description } = req.body;
    const existing = await Room.findOne({ roomNumber });
    if (existing) return res.status(400).json({ success: false, message: 'Room number already exists' });

    const room = await Room.create({ roomNumber, type, capacity, floor, block, monthlyRent, amenities, description });
    res.status(201).json({ success: true, room });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update room
// @route   PUT /api/rooms/:id
const updateRoom = async (req, res) => {
  try {
    const fields = ['type', 'capacity', 'floor', 'block', 'monthlyRent', 'amenities', 'description', 'status'];
    const updates = {};
    fields.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const room = await Room.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).populate('occupants', 'name email');
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    res.json({ success: true, room });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete room
// @route   DELETE /api/rooms/:id
const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    if (room.occupants.length > 0)
      return res.status(400).json({ success: false, message: 'Cannot delete room with occupants. Unassign students first.' });
    await Room.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Room deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Assign student to room
// @route   POST /api/rooms/:id/assign
const assignStudent = async (req, res) => {
  try {
    const { studentId } = req.body;
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    if (room.status === 'Full') return res.status(400).json({ success: false, message: 'Room is full' });
    if (room.status === 'Maintenance') return res.status(400).json({ success: false, message: 'Room is under maintenance' });

    const student = await User.findOne({ _id: studentId, role: 'student' });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    // Remove from any existing room first
    await Room.updateMany({ occupants: studentId }, { $pull: { occupants: studentId } });

    room.occupants.push(studentId);
    await room.save();
    await room.populate('occupants', 'name email course');
    res.json({ success: true, message: 'Student assigned to room', room });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Unassign student from room
// @route   POST /api/rooms/:id/unassign
const unassignStudent = async (req, res) => {
  try {
    const { studentId } = req.body;
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

    room.occupants = room.occupants.filter((id) => id.toString() !== studentId);
    await room.save();
    res.json({ success: true, message: 'Student removed from room', room });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get room stats
// @route   GET /api/rooms/stats
const getRoomStats = async (req, res) => {
  try {
    const total = await Room.countDocuments();
    const available = await Room.countDocuments({ status: 'Available' });
    const full = await Room.countDocuments({ status: 'Full' });
    const maintenance = await Room.countDocuments({ status: 'Maintenance' });
    res.json({ success: true, stats: { total, available, full, maintenance } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getRooms, getRoom, createRoom, updateRoom, deleteRoom, assignStudent, unassignStudent, getRoomStats };
