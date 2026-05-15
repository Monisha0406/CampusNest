const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: [true, 'Room number is required'],
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['Single', 'Double', 'Triple', 'Dormitory'],
      default: 'Single',
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: 1,
      max: 10,
    },
    floor: { type: Number, default: 1 },
    block: { type: String, trim: true, default: 'A' },
    monthlyRent: {
      type: Number,
      required: [true, 'Monthly rent is required'],
      min: 0,
    },
    amenities: [{ type: String }],
    occupants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    status: {
      type: String,
      enum: ['Available', 'Full', 'Maintenance'],
      default: 'Available',
    },
    description: { type: String, trim: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for current occupancy
roomSchema.virtual('currentOccupancy').get(function () {
  return this.occupants.length;
});

// Virtual for available slots
roomSchema.virtual('availableSlots').get(function () {
  return this.capacity - this.occupants.length;
});

// Auto-update status based on occupancy
roomSchema.pre('save', function (next) {
  if (this.status !== 'Maintenance') {
    this.status = this.occupants.length >= this.capacity ? 'Full' : 'Available';
  }
  next();
});

module.exports = mongoose.model('Room', roomSchema);
