const mongoose = require("mongoose");

const loginRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  email: {
    type: String,
  },
  role: {
    type: String,
  },
  loginTime: {
    type: Date,
    default: Date.now,
  },
  ipAddress: {
    type: String,
  },
});

module.exports = mongoose.model("LoginRecord", loginRecordSchema);
