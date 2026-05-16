const Complaint = require('../models/Complaint');

// @desc    Get all complaints (admin) or student's complaints
// @route   GET /api/complaints
const getComplaints = async (req, res) => {
  try {
    const { status, category, priority, page = 1, limit = 20 } = req.query;
    const query = {};
    if (req.user.role === 'student') query.student = req.user._id;
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    const total = await Complaint.countDocuments(query);
    const complaints = await Complaint.find(query)
      .populate('student', 'name email course')
      .populate('resolvedBy', 'name')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({ success: true, total, complaints });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single complaint
// @route   GET /api/complaints/:id
const getComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('student', 'name email course phone')
      .populate('resolvedBy', 'name email');
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    if (req.user.role === 'student' && complaint.student._id.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Access denied' });

    res.json({ success: true, complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create complaint (Student)
// @route   POST /api/complaints
const createComplaint = async (req, res) => {
  try {
    const { title, category, description, priority } = req.body;
    const complaint = await Complaint.create({
      student: req.user._id,
      title, category, description, priority,
    });
    await complaint.populate('student', 'name email');
    res.status(201).json({ success: true, complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update complaint status (Admin)
// @route   PUT /api/complaints/:id
const updateComplaint = async (req, res) => {
  try {
    const { status, adminRemarks, priority } = req.body;
    const updates = {};
    if (status) updates.status = status;
    if (adminRemarks) updates.adminRemarks = adminRemarks;
    if (priority) updates.priority = priority;
    if (status === 'Resolved' || status === 'Rejected') {
      updates.resolvedAt = new Date();
      updates.resolvedBy = req.user._id;
    }

    const complaint = await Complaint.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('student', 'name email')
      .populate('resolvedBy', 'name');
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    res.json({ success: true, complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete complaint (Admin)
// @route   DELETE /api/complaints/:id
const deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    res.json({ success: true, message: 'Complaint deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Complaint stats
// @route   GET /api/complaints/stats
const getComplaintStats = async (req, res) => {
  try {
    const [pending, inProgress, resolved, rejected] = await Promise.all([
      Complaint.countDocuments({ status: 'Pending' }),
      Complaint.countDocuments({ status: 'In Progress' }),
      Complaint.countDocuments({ status: 'Resolved' }),
      Complaint.countDocuments({ status: 'Rejected' }),
    ]);
    res.json({ success: true, stats: { pending, inProgress, resolved, rejected } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getComplaints, getComplaint, createComplaint, updateComplaint, deleteComplaint, getComplaintStats };
