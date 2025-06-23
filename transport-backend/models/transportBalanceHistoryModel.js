const mongoose = require('mongoose');

const transportBalanceHistorySchema = new mongoose.Schema({
  cashier: { type: String, required: true },
  lastAmountAccounted: { type: Number, required: true },
  lastAccountedDate: { type: Date, default: Date.now },
  dateOnly: { type: String, required: true }, // e.g., "2025-06-21"
  accountant: { type: String, required: true },
});

module.exports = mongoose.model('TransportBalanceHistory', transportBalanceHistorySchema);
