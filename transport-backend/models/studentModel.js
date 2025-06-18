const mongoose = require("mongoose");
const Location = require("./locationModel");

const studentSchema = new mongoose.Schema({
  student_id: {
    type: String,
    unique: true,
    required: true
  },
  first_name: {
    type: String,
    required: true,
    trim: true,
  },
  last_name: {
    type: String,
    required: true,
    trim: true,
  },
  gender: {
    type: String,
    enum: ["Male", "Female"],
    required: true,
  },
  dob: {
    type: Date,
    required: true,
  },
  age: {
    type: Number,
  },
  class: {
    type: String,
    required: true,
  },
  location_name: {
    type: String,
    required: true,
  },
  direction: {
    type: String,
    enum: ["in", "out", "in_out"],
    required: true,
  },
  weekly_fee: {
    type: Number,
  },
  guardian_name: {
    type: String,
    required: true,
  },
  guardian_tel: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

// 🔁 Calculate age before saving
studentSchema.pre("save", function (next) {
  const today = new Date();
  const birthDate = new Date(this.dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  this.age = age;
  next();
});

// 💰 Set weekly_fee based on location and direction
studentSchema.pre("save", async function (next) {
  if (!this.location_name || !this.direction) return next();

  try {
    const location = await Location.findOne({ location_name: this.location_name });
    if (!location) throw new Error("Invalid location name");

    switch (this.direction) {
      case "in":
        this.weekly_fee = location.price_in;
        break;
      case "out":
        this.weekly_fee = location.price_out;
        break;
      case "in_out":
        this.weekly_fee = location.price_in_out;
        break;
      default:
        this.weekly_fee = 0;
    }

    next();
  } catch (err) {
    next(err);
  }
});

const Student = mongoose.model("Student", studentSchema);
module.exports = Student;
