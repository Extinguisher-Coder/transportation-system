const PaymentHistory = require('../models/paymentHistoryModel');

// Get all payment histories
const getAllPaymentHistories = async (req, res) => {
  try {
    const histories = await PaymentHistory.find().sort({ paymentDate: -1 }); // latest first
    res.status(200).json(histories);
  } catch (error) {
    console.error('Error fetching payment histories:', error);
    res.status(500).json({ error: 'Server error fetching payment histories' });
  }
};

// Get payment histories for today
const getTodayPaymentHistories = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const histories = await PaymentHistory.find({
      paymentDate: { $gte: startOfDay, $lte: endOfDay },
    }).sort({ paymentDate: -1 });

    res.status(200).json(histories);
  } catch (error) {
    console.error('Error fetching today\'s payment histories:', error);
    res.status(500).json({ error: 'Server error fetching today\'s payment histories' });
  }
};

const getTodayTotalCollection = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const result = await PaymentHistory.aggregate([
      {
        $match: {
          paymentDate: { $gte: startOfDay, $lte: endOfDay }
        }
      },
      {
        $group: {
          _id: null,
          totalCollection: { $sum: "$amountPaid" }
        }
      }
    ]);

    const totalCollection = result[0]?.totalCollection || 0;

    res.status(200).json({ totalCollection });
  } catch (error) {
    console.error("Error calculating today's total collection:", error);
    res.status(500).json({ error: "Server error calculating today's total collection" });
  }
};



const getTotalByLocation = async (req, res) => {
  try {
    const results = await PaymentHistory.aggregate([
      {
        $group: {
          _id: "$location_name",
          totalCollected: { $sum: "$amountPaid" },
        },
      },
      {
        $project: {
          locationName: "$_id",
          totalCollected: 1,
          _id: 0
        }
      },
      { $sort: { locationName: 1 } }
    ]);

    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching total by location:', error);
    res.status(500).json({ error: 'Failed to fetch total amount by location' });
  }
};

module.exports = {
  getAllPaymentHistories,
  getTodayPaymentHistories,
  getTodayTotalCollection,
  getTotalByLocation,


};
