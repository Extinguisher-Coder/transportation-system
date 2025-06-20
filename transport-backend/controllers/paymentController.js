
const axios = require('axios');
const Payment = require('../models/paymentModel');
const PaymentHistory = require('../models/paymentHistoryModel');
const Counter = require('../models/transCounterModel');
const Student = require('../models/studentModel');
const distributeLastPayment = require('../utils/distributeLastPayment'); 

exports.makePayment = async (req, res) => {
  try {
    const { lastAmountPaid, termName, cashier, reference } = req.body;
    const { student_id } = req.params;

    // Validation
    if (!student_id || lastAmountPaid == null || !termName || !cashier) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Get payment record
    const payment = await Payment.findOne({ student_id });
    if (!payment) {
      return res.status(404).json({ message: "Payment record not found for this student." });
    }

    // Get student for SMS
    const student = await Student.findOne({ student_id });
    if (!student) {
      return res.status(404).json({ message: "Student record not found." });
    }

    // Update payment data
    payment.lastAmountPaid = lastAmountPaid;
    payment.totalAmountPaid += lastAmountPaid;
    payment.lastPaymentDate = new Date();
    payment.termName = termName;

    // Distribute to weeks
    payment.weeks = distributeLastPayment(
      lastAmountPaid,
      payment.weeks,
      payment.weekly_fee
    );

    await payment.save();

    // Create transaction ID
    const counter = await Counter.findOneAndUpdate(
      { name: 'payment_history' },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );

    // Save payment history
    const history = new PaymentHistory({
      trans_id: counter.value,
      student_id: payment.student_id,
      first_name: payment.first_name,
      last_name: payment.last_name,
      class: payment.class,
      location_name: payment.location_name,
      direction: payment.direction,
      amountPaid: lastAmountPaid,
      paymentDate: new Date(),
      cashier,
      reference,
      termName,
    });

    await history.save();

    // ✅ Send SMS to guardian
    const dateObj = new Date(payment.lastPaymentDate);
const dateStr = dateObj.toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric'
});
const timeStr = dateObj.toLocaleTimeString('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true
});

const messageText = `Dear Parent,\nTransport fee payment of GHS ${lastAmountPaid} for ${student.first_name} ${student.last_name} (${student.class}) is received on ${dateStr} at ${timeStr}. For any concerns, call: 0242382484. Thank you.`;


    await axios.post(
      'https://api.smsonlinegh.com/v5/message/sms/send',
      {
        text: messageText,
        type: 0,
        sender: process.env.SMS_SENDER,
        destinations: [student.guardian_tel]
      },
      {
        headers: {
          'Authorization': `key ${process.env.SMS_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    res.json({
      message: "Payment successfully recorded and SMS sent.",
      payment,
      history
    });

  } catch (error) {
    console.error("Make payment failed:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



// Get Payments by Term Name (or all if not provided)
exports.getAllPayments = async (req, res) => {
  try {
    const { termName } = req.query;

    const query = termName ? { termName } : {};

    const payments = await Payment.find(query).sort({ lastPaymentDate: -1 });

    res.json({
      message: "Payment records retrieved successfully.",
      count: payments.length,
      payments
    });
  } catch (error) {
    console.error("Failed to fetch payment records:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Get unpaid students up to a selected week
exports.getUnpaidUpToWeek = async (req, res) => {
  try {
    const { selectedWeek, termName } = req.query;

    if (!selectedWeek || !selectedWeek.startsWith('week')) {
      return res.status(400).json({ message: 'Invalid or missing selectedWeek' });
    }

    const weekNumber = parseInt(selectedWeek.replace('week', ''));
    if (isNaN(weekNumber) || weekNumber < 1 || weekNumber > 20) {
      return res.status(400).json({ message: 'Week number must be between 1 and 20' });
    }

    // Build dynamic OR query to find students owing in any of week1 to weekN
    const unpaidConditions = [];
    for (let i = 1; i <= weekNumber; i++) {
      unpaidConditions.push({ [`weeks.week${i}`]: 0 });
    }

    const query = {
      $or: unpaidConditions
    };

    if (termName) {
      query.termName = termName;
    }

    const payments = await Payment.find(query);

    const result = payments.map(payment => {
      let weeksOwed = 0;
      for (let i = 1; i <= weekNumber; i++) {
        if (payment.weeks[`week${i}`] === 0) {
          weeksOwed += 1;
        }
      }

      return {
        ...payment.toObject(),
        weeksOwed,
      };
    });

    res.json({
      message: `Unpaid students up to ${selectedWeek} retrieved.`,
      count: result.length,
      records: result
    });

  } catch (error) {
    console.error('Error fetching unpaid students:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// @desc    Get total of all weekly fees
// @route   GET /payments/total/weekly-fee
exports.getTotalWeeklyFee = async (req, res) => {
  try {
    const result = await Payment.aggregate([
      {
        $group: {
          _id: null,
          totalWeeklyFee: { $sum: "$weekly_fee" }
        }
      }
    ]);

    res.status(200).json({ totalWeeklyFee: result[0]?.totalWeeklyFee || 0 });
  } catch (err) {
    console.error("Error calculating total weekly fee:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get total of all amount paid
// @route   GET /payments/total/amount-paid
exports.getTotalAmountPaid = async (req, res) => {
  try {
    const result = await Payment.aggregate([
      {
        $group: {
          _id: null,
          totalAmountPaid: { $sum: "$totalAmountPaid" }
        }
      }
    ]);

    res.status(200).json({ totalAmountPaid: result[0]?.totalAmountPaid || 0 });
  } catch (err) {
    console.error("Error calculating total amount paid:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};


