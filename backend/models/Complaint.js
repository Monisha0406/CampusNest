const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student reference is required'],
    },
    title: {
      type: String,
      required: [true, 'Complaint title is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Maintenance', 'Cleanliness', 'Security', 'Food', 'Internet', 'Noise', 'Other'],
      default: 'Other',
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
      default: 'Pending',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    adminRemarks: { type: String, trim: true },
    resolvedAt: { type: Date },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Complaint', complaintSchema);
