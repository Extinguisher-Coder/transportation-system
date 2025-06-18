const axios = require("axios");
const Student = require("../models/studentModel");

const sendBulkReminders = async (req, res) => {
  try {
    const { students } = req.body;

    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ message: "No students provided." });
    }

    const studentIds = students.map((s) => s.student_id);

    // 🧠 Get student guardian contacts from DB
    const studentRecords = await Student.find({ student_id: { $in: studentIds } });

    const phoneMap = {};
    studentRecords.forEach((student) => {
      phoneMap[student.student_id] = student.guardian_tel;
    });

    // ✉️ Prepare SMS messages
    const messages = students.map((s) => {
      const phone = phoneMap[s.student_id];
      if (!phone) return null;

const messageText = `Dear Parent, \nOur records show that ${s.full_name} owes Transport fee for ${s.weeksOwed} week(s) (GHS ${s.amountOwed}). Kindly make payment, else your ward will not be allowed to join the bus. For any concerns, please Call: 0242382484. Thank you.`;

      return {
        destinations: phone,
        text: messageText,
      };
    }).filter(Boolean);

    // 🚀 Send SMS messages one by one using v5 format
    const results = await Promise.all(
      messages.map(async (msg) => {
        try {
          await axios.post(
            "https://api.smsonlinegh.com/v5/message/sms/send",
            {
              text: msg.text,
              type: 0,
              sender: process.env.SMS_SENDER,
              destinations: [msg.destinations],
            },
            {
              headers: {
                Authorization: `key ${process.env.SMS_API_KEY}`,
                "Content-Type": "application/json",
                Accept: "application/json",
              },
            }
          );
          return { to: msg.destinations, success: true };
        } catch (err) {
          console.error("SMS send failed:", err.response?.data || err.message);
          return {
            to: msg.destinations,
            success: false,
            error: err.response?.data || err.message,
          };
        }
      })
    );

    const successCount = results.filter((r) => r.success).length;
    const failedCount = results.length - successCount;

    return res.status(200).json({
      message: `Reminder messages sent Successfully. Success: ${successCount}, Failed: ${failedCount}`,
      results,
    });

  } catch (error) {
    console.error("Error sending SMS reminders:", error);
    return res.status(500).json({ message: "Internal server error while sending reminders." });
  }
};

module.exports = {
  sendBulkReminders,
};
