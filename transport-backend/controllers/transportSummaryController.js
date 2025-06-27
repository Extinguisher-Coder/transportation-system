const PaymentHistory = require('../models/paymentHistoryModel');
const Term = require('../models/termModel');

exports.getTransportTermWeeklySummary = async (req, res) => {
  try {
    const { termName } = req.query;

    if (!termName) {
      return res.status(400).json({ error: 'termName query parameter is required' });
    }

    const term = await Term.findOne({ termName });
    if (!term) {
      return res.status(404).json({ error: 'Term not found' });
    }

    const { startDate, endDate, numberOfWeeks } = term;
    if (!startDate || !endDate || !numberOfWeeks) {
      return res.status(400).json({ error: 'Invalid term data' });
    }

    const weeks = [];
    let currentStart = new Date(startDate);

    for (let i = 0; i < numberOfWeeks; i++) {
      const weekStart = new Date(currentStart);
      const weekEnd = new Date(currentStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      if (weekEnd > new Date(endDate)) weekEnd.setTime(new Date(endDate).getTime());

      weeks.push({
        weekLabel: `Week ${i + 1}`,
        weekStart: weekStart.toISOString().slice(0, 10),
        weekEnd: weekEnd.toISOString().slice(0, 10)
      });

      currentStart.setDate(currentStart.getDate() + 7);
    }

    const results = await Promise.all(
      weeks.map(async ({ weekLabel, weekStart, weekEnd }) => {
        const payments = await PaymentHistory.find({
          paymentDate: {
            $gte: new Date(weekStart + 'T00:00:00Z'),
            $lte: new Date(weekEnd + 'T23:59:59Z'),
          },
          termName
        });

        const totalAmount = payments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);

        return {
          week: weekLabel,
          range: `${weekStart} - ${weekEnd}`,
          totalAmount
        };
      })
    );

    res.status(200).json({ term: termName, summary: results });

  } catch (error) {
    console.error('Transport weekly summary error:', error);
    res.status(500).json({ error: 'Server error while fetching transport weekly summary.' });
  }
};
