const LoginRecord = require("../models/loginRecordModel");

const getLoginRecords = async (req, res) => {
  try {
    const records = await LoginRecord.find()
      .sort({ loginTime: -1 }) // Most recent first
      .populate("userId", "fullName email") // Get user's name/email
      .limit(100); // Optional: limit for performance

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch login records" });
  }
};

module.exports = { getLoginRecords };
