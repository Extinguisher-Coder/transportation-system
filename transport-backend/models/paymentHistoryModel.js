const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const paymentHistorySchema = new Schema({
  trans_id: {
    type: Number,
    required: true,
    unique: true
  },
  student_id: {
    type: String,
    required: true
  },
  first_name: {
    type: String,
    required: true
  },
  last_name: {
    type: String,
    required: true
  },
  class: {
    type: String,
    required: true
  },
  location_name: {
    type: String,
    required: true
  },
  direction: {
    type: String,
    enum: ['in', 'out', 'in_out'],
    required: true
  },
  amountPaid: {
    type: Number,
    required: true
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  cashier: {
    type: String,
    required: true
  },
  reference: {
    type: String,
    default: "Cash"
  },
  termName: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = model('PaymentHistory', paymentHistorySchema, 'payment_histories');
