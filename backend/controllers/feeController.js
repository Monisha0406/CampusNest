const Fee = require('../models/Fee');
const User = require('../models/User');

// @desc    Get all fees (admin) or student's fees
// @route   GET /api/fees
const getFees = async (req, res) => {
  try {
    const { status, studentId, month, page = 1, limit = 20 } = req.query;
    const query = {};
    if (req.user.role === 'student') query.student = req.user._id;
    else if (studentId) query.student = studentId;
    if (status) query.status = status;
    if (month) query.month = { $regex: month, $options: 'i' };

    const total = await Fee.countDocuments(query);
    const fees = await Fee.find(query)
      .populate('student', 'name email course')
      .populate('room', 'roomNumber block')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({ success: true, total, fees });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, stack: err.stack });
  }
};

// @desc    Get single fee record
// @route   GET /api/fees/:id
const getFee = async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id)
      .populate('student', 'name email course phone')
      .populate('room', 'roomNumber block floor');
    if (!fee) return res.status(404).json({ success: false, message: 'Fee record not found' });

    // Students can only see their own
    if (req.user.role === 'student' && fee.student._id.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Access denied' });

    res.json({ success: true, fee });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create fee record (Admin)
// @route   POST /api/fees
const createFee = async (req, res) => {
  try {
    const { student, room, month, amount, dueDate, lateFee, discount, notes } = req.body;
    const studentExists = await User.findOne({ _id: student, role: 'student' });
    if (!studentExists) return res.status(404).json({ success: false, message: 'Student not found' });

    const fee = await Fee.create({ student, room, month, amount, dueDate, lateFee, discount, notes });
    await fee.populate('student', 'name email');
    res.status(201).json({ success: true, fee });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Record a payment (Admin)
// @route   POST /api/fees/:id/pay
const recordPayment = async (req, res) => {
  try {
    const { amount, method, transactionId, remarks } = req.body;
    const fee = await Fee.findById(req.params.id);
    if (!fee) return res.status(404).json({ success: false, message: 'Fee record not found' });

    fee.paymentHistory.push({ amount, method, transactionId, remarks });
    fee.paidAmount += Number(amount);
    await fee.save();
    await fee.populate('student', 'name email');
    res.json({ success: true, message: 'Payment recorded', fee });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update fee record (Admin)
// @route   PUT /api/fees/:id
const updateFee = async (req, res) => {
  try {
    const fields = ['amount', 'dueDate', 'lateFee', 'discount', 'notes'];
    const updates = {};
    fields.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const fee = await Fee.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
      .populate('student', 'name email');
    if (!fee) return res.status(404).json({ success: false, message: 'Fee record not found' });
    res.json({ success: true, fee });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete fee record (Admin)
// @route   DELETE /api/fees/:id
const deleteFee = async (req, res) => {
  try {
    const fee = await Fee.findByIdAndDelete(req.params.id);
    if (!fee) return res.status(404).json({ success: false, message: 'Fee record not found' });
    res.json({ success: true, message: 'Fee record deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Fee statistics (Admin dashboard)
// @route   GET /api/fees/stats
const getFeeStats = async (req, res) => {
  try {
    const [pending, paid, overdue, partial] = await Promise.all([
      Fee.countDocuments({ status: 'Pending' }),
      Fee.countDocuments({ status: 'Paid' }),
      Fee.countDocuments({ status: 'Overdue' }),
      Fee.countDocuments({ status: 'Partial' }),
    ]);
    const totalCollected = await Fee.aggregate([
      { $match: { status: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$paidAmount' } } },
    ]);
    const totalDue = await Fee.aggregate([
      { $match: { status: { $in: ['Pending', 'Overdue', 'Partial'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    res.json({
      success: true,
      stats: {
        pending, paid, overdue, partial,
        totalCollected: totalCollected[0]?.total || 0,
        totalDue: totalDue[0]?.total || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getFees, getFee, createFee, recordPayment, updateFee, deleteFee, getFeeStats };
