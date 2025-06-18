const mongoose = require('mongoose');

// Helper: Calculate number of weeks between two dates
const calculateWeeks = (start, end) => {
  const msPerWeek = 1000 * 60 * 60 * 24 * 7;
  const diffInMs = end - start;
  return Math.ceil(diffInMs / msPerWeek);
};

const termSchema = new mongoose.Schema({
  termName: {
    type: String,
    required: [true, 'Term name is required'],
    unique: true,
    trim: true,
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
  },
  numberOfWeeks: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Auto-calculate number of weeks on save
termSchema.pre('save', function (next) {
  if (this.startDate && this.endDate) {
    this.numberOfWeeks = calculateWeeks(this.startDate, this.endDate);
  }
  next();
});

// Auto-calculate number of weeks on update
termSchema.pre(['findOneAndUpdate', 'updateOne'], function (next) {
  const update = this.getUpdate();
  if (update.startDate && update.endDate) {
    const weeks = calculateWeeks(new Date(update.startDate), new Date(update.endDate));
    update.numberOfWeeks = Math.max(weeks, 0);
  }
  next();
});

module.exports = mongoose.model('Term', termSchema);
