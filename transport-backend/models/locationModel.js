const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  location_name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  price_in: {
    type: Number,
    required: true,
    min: 0
  },
  price_out: {
    type: Number,
    required: true,
    min: 0
  },
  price_in_out: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

const locationModel = mongoose.model("Location", locationSchema);
module.exports = locationModel;
