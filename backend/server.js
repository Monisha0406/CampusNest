const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/fees', require('./routes/fees'));
app.use('/api/complaints', require('./routes/complaints'));

// Dashboard stats route (admin)
app.get('/api/dashboard/stats', require('./middleware/auth').protect, require('./middleware/auth').adminOnly, async (req, res) => {
  try {
    const User = require('./models/User');
    const Room = require('./models/Room');
    const Fee = require('./models/Fee');
    const Complaint = require('./models/Complaint');

    const [totalStudents, totalRooms, availableRooms, pendingComplaints,
           totalFees, paidFees, pendingFees, overdueFees,
           recentStudents, recentComplaints, courseDistribution, complaintCategories] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Room.countDocuments(),
      Room.countDocuments({ status: 'Available' }),
      Complaint.countDocuments({ status: 'Pending' }),
      Fee.countDocuments(),
      Fee.countDocuments({ status: 'Paid' }),
      Fee.countDocuments({ status: { $in: ['Pending', 'Partial'] } }),
      Fee.countDocuments({ status: 'Overdue' }),
      User.find({ role: 'student' }).sort({ createdAt: -1 }).limit(5).select('name email course createdAt'),
      Complaint.find({ status: 'Pending' }).sort({ createdAt: -1 }).limit(5)
        .populate('student', 'name email'),
      User.aggregate([
        { $match: { role: 'student' } },
        { $group: { _id: '$course', count: { $sum: 1 } } }
      ]),
      Complaint.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ])
    ]);

    // Monthly fee collection (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyCollection = await Fee.aggregate([
      { $match: { status: 'Paid', updatedAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$updatedAt' } },
          total: { $sum: '$paidAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      stats: {
        totalStudents, totalRooms, availableRooms,
        occupiedRooms: totalRooms - availableRooms,
        pendingComplaints, totalFees, paidFees, pendingFees, overdueFees,
        collectionRate: totalFees > 0 ? Math.round((paidFees / totalFees) * 100) : 0,
      },
      recentStudents,
      recentComplaints,
      monthlyCollection,
      courseDistribution,
      complaintCategories
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => res.json({ success: true, message: 'SmartStay API is running 🚀' }));

// 404 handler
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 SmartStay Server running on port ${PORT}`));

module.exports = app;
