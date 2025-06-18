const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const paymentSchema = new Schema({
  student_id: {
    type: String,
    required: true,
    index: true,
  },
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  class: {
    type: String,
    required: true,
  },
  location_name: {
    type: String,
    required: true,
  },
  direction: {
    type: String,
    enum: ['in', 'out', 'in_out'],
    required: true,
  },
  weekly_fee: {
    type: Number,
    required: true,
  },
  lastAmountPaid: {
    type: Number,
    default: 0,
  },
  totalAmountPaid: {
    type: Number,
    default: 0,
  },
  lastPaymentDate: {
    type: Date,
    default: null,
  },
  termName: {
    type: String,
    required: true, 
  },
  weeks: {
    week1: { type: Schema.Types.Mixed, default: 0 },
    week2: { type: Schema.Types.Mixed, default: 0 },
    week3: { type: Schema.Types.Mixed, default: 0 },
    week4: { type: Schema.Types.Mixed, default: 0 },
    week5: { type: Schema.Types.Mixed, default: 0 },
    week6: { type: Schema.Types.Mixed, default: 0 },
    week7: { type: Schema.Types.Mixed, default: 0 },
    week8: { type: Schema.Types.Mixed, default: 0 },
    week9: { type: Schema.Types.Mixed, default: 0 },
    week10: { type: Schema.Types.Mixed, default: 0 },
    week11: { type: Schema.Types.Mixed, default: 0 },
    week12: { type: Schema.Types.Mixed, default: 0 },
    week13: { type: Schema.Types.Mixed, default: 0 },
    week14: { type: Schema.Types.Mixed, default: 0 },
    week15: { type: Schema.Types.Mixed, default: 0 },
    week16: { type: Schema.Types.Mixed, default: 0 },
    week17: { type: Schema.Types.Mixed, default: 0 },
    week18: { type: Schema.Types.Mixed, default: 0 },
    week19: { type: Schema.Types.Mixed, default: 0 },
    week20: { type: Schema.Types.Mixed, default: 0 },
  },
  absenteeLog: [
    {
      week: { type: String, required: true },
      status: { type: String, enum: ['Absent', 'Omitted'], required: true },
      cashier: { type: String, required: true },
      date: { type: Date, default: Date.now },
    }
  ]
}, {
  timestamps: true,
});

module.exports = model('Payment', paymentSchema, 'payments');
