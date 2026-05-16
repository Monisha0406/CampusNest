const User = require('../models/User');
const Room = require('../models/Room');
const Fee = require('../models/Fee');

// @desc    Get all students
// @route   GET /api/students
const getStudents = async (req, res) => {
  try {
    const { search, course, gender, page = 1, limit = 20 } = req.query;
    const query = { role: 'student' };
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
    if (course) query.course = { $regex: course, $options: 'i' };
    if (gender) query.gender = gender;

    const total = await User.countDocuments(query);
    const students = await User.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({ success: true, total, page: Number(page), students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single student
// @route   GET /api/students/:id
const getStudent = async (req, res) => {
  try {
    const student = await User.findOne({ _id: req.params.id, role: 'student' });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const room = await Room.findOne({ occupants: student._id });
    const fees = await Fee.find({ student: student._id }).sort({ createdAt: -1 });

    res.json({ success: true, student, room, fees });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create student (Admin)
// @route   POST /api/students
const createStudent = async (req, res) => {
  try {
    const { name, email, password, phone, gender, course, admissionYear, address, emergencyContact, dateOfBirth } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

    const student = await User.create({
      name, email, password: password || 'student123',
      role: 'student', phone, gender, course, admissionYear,
      address, emergencyContact, dateOfBirth,
    });

    res.status(201).json({ success: true, student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update student (Admin)
// @route   PUT /api/students/:id
const updateStudent = async (req, res) => {
  try {
    const fields = ['name', 'phone', 'gender', 'course', 'admissionYear', 'address', 'emergencyContact', 'dateOfBirth', 'isActive'];
    const updates = {};
    fields.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const student = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'student' },
      updates,
      { new: true, runValidators: true }
    );
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete student (Admin)
// @route   DELETE /api/students/:id
const deleteStudent = async (req, res) => {
  try {
    const student = await User.findOne({ _id: req.params.id, role: 'student' });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    // Remove from room
    await Room.updateMany({ occupants: student._id }, { $pull: { occupants: student._id } });
    await User.findByIdAndDelete(student._id);

    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getStudents, getStudent, createStudent, updateStudent, deleteStudent };
