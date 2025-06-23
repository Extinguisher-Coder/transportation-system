const TransportReconciliation = require('../models/transportReconciliationModel');
const TransportBalanceHistory = require('../models/transportBalanceHistoryModel');
const PaymentHistory = require('../models/paymentHistoryModel'); // ✅ Correct model

// Utility to get date in YYYY-MM-DD format
const getDateOnly = (date) => date.toISOString().split('T')[0];

// @desc    Record new amount received by accountant from cashier
// @route   POST /api/transport-reconciliation/record
exports.recordTransportReconciliation = async (req, res) => {
  try {
    const { cashier, lastAmountAccounted, accountant } = req.body;

    if (!cashier || !lastAmountAccounted || !accountant) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const now = new Date();
    const dateOnly = getDateOnly(now);

    // Update or create TransportReconciliation record
    const reconciliation = await TransportReconciliation.findOneAndUpdate(
      { cashier },
      {
        $inc: { totalAmountAccounted: lastAmountAccounted },
        $set: {
          lastAmountAccounted,
          lastAccountedDate: now,
          accountant,
        },
      },
      { new: true, upsert: true }
    );

    // Save entry in TransportBalanceHistory
    const history = new TransportBalanceHistory({
      cashier,
      lastAmountAccounted,
      lastAccountedDate: now,
      dateOnly,
      accountant,
    });
    await history.save();

    res.status(200).json({ message: '✅ Transport balance recorded successfully.', reconciliation });
  } catch (err) {
    console.error('❌ Transport Reconciliation Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Get summary for all cashiers based on PaymentHistory
// @route   GET /api/transport-reconciliation/summary
exports.getTransportReconciliationSummary = async (req, res) => {
  try {
    const cashiers = await PaymentHistory.distinct('cashier');

    const summary = await Promise.all(
      cashiers.map(async (cashier) => {
        const recorded = await PaymentHistory.aggregate([
          { $match: { cashier } },
          { $group: { _id: null, total: { $sum: '$amountPaid' } } },
        ]);

        const recordedTotal = recorded[0]?.total || 0;

        const reconciliation = await TransportReconciliation.findOne({ cashier });

        const handedOver = reconciliation?.totalAmountAccounted || 0;
        const difference = handedOver - recordedTotal;

        let status = 'Balanced';
        if (difference < 0) status = 'Unbalanced';
        if (difference > 0) status = 'Over Balanced';

        return {
          cashier,
          recordedTotal,
          handedOver,
          difference,
          status,
          lastAccountedDate: reconciliation?.lastAccountedDate || null,
          accountant: reconciliation?.accountant || null,
        };
      })
    );

    res.status(200).json(summary);
  } catch (err) {
    console.error('❌ Transport Summary Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
