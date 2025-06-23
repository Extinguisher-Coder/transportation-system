const Term = require('../models/termModel');
const PaymentHistory = require('../models/paymentHistoryModel'); // Transport collections
const TransportBalanceHistory = require('../models/transportBalanceHistoryModel'); // Transport handovers

// Format e.g., "May 1"
const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  });
};

// Utility to get weekly ranges from start to end date
const getWeeklyRanges = (startDate, endDate) => {
  const weeks = [];
  let current = new Date(startDate);
  let count = 1;

  while (current <= endDate) {
    const weekStart = new Date(current);
    const weekEnd = new Date(current);
    weekEnd.setDate(weekStart.getDate() + 6);

    if (weekEnd > endDate) {
      weekEnd.setTime(endDate.getTime());
    }

    // Include full end of day
    weekEnd.setHours(23, 59, 59, 999);

    weeks.push({
      label: `week${count}`,
      start: new Date(weekStart),
      end: new Date(weekEnd)
    });

    count++;
    current.setDate(current.getDate() + 7);
  }

  return weeks;
};

// @desc Get weekly transport summary per cashier
// @route GET /api/transport-cashier-summary/weekly?termName=Term%203%20-%202025
exports.transportCashierWeeklySummary = async (req, res) => {
  try {
    const { termName } = req.query;
    if (!termName) {
      return res.status(400).json({ error: 'termName is required.' });
    }

    const term = await Term.findOne({ termName });
    if (!term) {
      return res.status(404).json({ error: 'Term not found.' });
    }

    const { startDate, endDate } = term;
    const weeklyRanges = getWeeklyRanges(new Date(startDate), new Date(endDate));

    const cashiers = await PaymentHistory.distinct('cashier');

    const summary = await Promise.all(
      cashiers.map(async (cashier) => {
        const weeks = {};

        for (const week of weeklyRanges) {
          const { label, start, end } = week;

          // Total collected by cashier
          const recordedAgg = await PaymentHistory.aggregate([
            {
              $match: {
                cashier,
                paymentDate: { $gte: start, $lte: end }
              }
            },
            {
              $group: { _id: null, total: { $sum: '$amountPaid' } }
            }
          ]);
          const recorded = recordedAgg[0]?.total || 0;

          // Total handed over to accountant
          const accountedAgg = await TransportBalanceHistory.aggregate([
            {
              $match: {
                cashier,
                lastAccountedDate: { $gte: start, $lte: end }
              }
            },
            {
              $group: { _id: null, total: { $sum: '$lastAmountAccounted' } }
            }
          ]);
          const accounted = accountedAgg[0]?.total || 0;

          const difference = accounted - recorded;
          let status = 'Balanced';
          if (difference < 0) status = 'Unbalanced';
          else if (difference > 0) status = 'Over Balanced';

          const dateRange = `${formatDate(start)} - ${formatDate(end)}`;

          weeks[label] = {
            recorded,
            accounted,
            difference,
            status,
            dateRange
          };
        }

        return { cashier, weeks };
      })
    );

    res.status(200).json({ termName, startDate, endDate, summary });
  } catch (err) {
    console.error('Transport Weekly Summary Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
