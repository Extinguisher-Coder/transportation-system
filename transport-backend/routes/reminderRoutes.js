const express = require("express");
const router = express.Router();
const reminderMessageController = require("../controllers/reminderMessageController");

// 🔁 Send SMS reminders to multiple students
router.post("/send-bulk", reminderMessageController.sendBulkReminders);

module.exports = router;
