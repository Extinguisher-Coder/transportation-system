const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    contact: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['Admin', 'Cashier', 'Registrar', 'Accountant'],
      default: 'Admin',
    },
  },
  { timestamps: true }
);

// Auto-hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});



const UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;
