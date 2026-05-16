const mongoose = require('mongoose');

const paymentHistorySchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  paidOn: { type: Date, default: Date.now },
  method: {
    type: String,
    enum: ['Cash', 'Online', 'Bank Transfer', 'UPI'],
    default: 'Cash',
  },
  transactionId: { type: String, trim: true },
  remarks: { type: String, trim: true },
});

const feeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student reference is required'],
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
    },
    month: { type: String, required: [true, 'Month is required'] }, // e.g. "June 2024"
    amount: { type: Number, required: [true, 'Fee amount is required'], min: 0 },
    dueDate: { type: Date, required: [true, 'Due date is required'] },
    status: {
      type: String,
      enum: ['Pending', 'Paid', 'Overdue', 'Partial'],
      default: 'Pending',
    },
    paidAmount: { type: Number, default: 0 },
    paymentHistory: [paymentHistorySchema],
    lateFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

// Auto-update status
feeSchema.pre('save', function (next) {
  const total = this.amount + this.lateFee - this.discount;
  if (this.paidAmount >= total) {
    this.status = 'Paid';
  } else if (this.paidAmount > 0) {
    this.status = 'Partial';
  } else if (new Date() > this.dueDate) {
    this.status = 'Overdue';
  } else {
    this.status = 'Pending';
  }
  next();
});

module.exports = mongoose.model('Fee', feeSchema);
