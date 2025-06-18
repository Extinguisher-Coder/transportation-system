const Payment = require('../models/paymentModel');

// @desc    Mark a student as Absent or Omitted for a specific week
// @route   POST /absenteeism/mark
exports.markAbsenteeism = async (req, res) => {
  try {
    const { student_id, weekKey, status, cashier } = req.body;

    if (!student_id || !weekKey || !status || !cashier) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    if (!["Absent", "Omitted"].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Must be 'Absent' or 'Omitted'." });
    }

    const weekNumber = parseInt(weekKey.replace('week', ''), 10);
    if (isNaN(weekNumber) || weekNumber < 1 || weekNumber > 20) {
      return res.status(400).json({ message: "Invalid week key." });
    }

    // Find the most recent payment record for the student
    const payment = await Payment.findOne({ student_id }).sort({ createdAt: -1 });

    if (!payment) {
      return res.status(404).json({ message: "Payment record not found." });
    }

    const weeks = { ...payment.weeks };

    // Shift values forward starting from the last week to the target week + 1
    for (let i = 20; i > weekNumber; i--) {
      weeks[`week${i}`] = weeks[`week${i - 1}`];
    }

    // Insert the status into the specified week
    weeks[`week${weekNumber}`] = status;

    // Optionally, log or track who did the marking (in a separate array or field)
    // You can extend your schema with a `markHistory` or similar array.
    if (!payment.absenteeLog) payment.absenteeLog = [];
    payment.absenteeLog.push({
      week: weekKey,
      status,
      cashier,
      date: new Date(),
    });

    payment.weeks = weeks;
    await payment.save();

    res.status(200).json({
      message: `Marked ${status} in ${weekKey} for student ${student_id} by ${cashier}.`,
      updatedWeeks: payment.weeks,
    });
  } catch (err) {
    console.error("Error marking absenteeism:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};


// @desc    Mark all students as Absent or Omitted for a specific week
// @route   POST /absenteeism/mark-all
exports.markAllAbsentees = async (req, res) => {
  try {
    const { weekKey, status, cashier } = req.body;

    if (!weekKey || !status || !cashier) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    if (!["Absent", "Omitted"].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Must be 'Absent' or 'Omitted'." });
    }

    const weekNumber = parseInt(weekKey.replace('week', ''), 10);
    if (isNaN(weekNumber) || weekNumber < 1 || weekNumber > 20) {
      return res.status(400).json({ message: "Invalid week key." });
    }

    // Fetch all students' payment records
    const payments = await Payment.find();

    const updatePromises = payments.map(async (payment) => {
      const weeks = { ...payment.weeks };

      // Shift weeks forward to make room for the status in the specified week
      for (let i = 20; i > weekNumber; i--) {
        weeks[`week${i}`] = weeks[`week${i - 1}`];
      }

      weeks[`week${weekNumber}`] = status;

      // Log the update in absenteeLog
      if (!payment.absenteeLog) payment.absenteeLog = [];
      payment.absenteeLog.push({
        week: weekKey,
        status,
        cashier,
        date: new Date(),
      });

      payment.weeks = weeks;
      return payment.save();
    });

    await Promise.all(updatePromises);

    res.status(200).json({
      message: `All students marked as ${status} for ${weekKey} by ${cashier}.`,
      totalUpdated: payments.length,
    });
  } catch (err) {
    console.error("Error marking all absentees:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};


exports.getAbsentStudents = async (req, res) => {
  try {
    const allPayments = await Payment.find();

    const absentees = [];

    for (const record of allPayments) {
      if (!record.absenteeLog || record.absenteeLog.length === 0) continue;

      for (const log of record.absenteeLog) {
        if (log.status === 'Absent') {
          absentees.push({
            studentId: record.student_id,
            firstName: record.first_name,
            lastName: record.last_name,
            classLevel: record.class,
            location: record.location_name,
            direction: record.direction,
            week: log.week,
            status: log.status,
            cashier: log.cashier,
            markedDate: log.date
          });
        }
      }
    }

    res.status(200).json(absentees);
  } catch (err) {
    console.error('Error fetching absent list:', err);
    res.status(500).json({ message: 'Server error while fetching absentees.' });
  }
};
