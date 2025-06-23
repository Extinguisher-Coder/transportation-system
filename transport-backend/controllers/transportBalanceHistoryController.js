const TransportBalanceHistory = require('../models/transportBalanceHistoryModel');

// @desc    Get all transport balance history records
// @route   GET /api/transport-balance-history
exports.getAllTransportBalanceHistories = async (req, res) => {
  try {
    const histories = await TransportBalanceHistory.find().sort({ lastAccountedDate: -1 }); // newest first
    res.status(200).json(histories);
  } catch (error) {
    console.error('Error fetching transport balance histories:', error);
    res.status(500).json({ error: 'Server error while fetching transport balance histories.' });
  }
};
