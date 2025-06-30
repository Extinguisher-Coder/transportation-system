const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const UserModel = require('../models/userModel');
const LoginRecord = require('../models/loginRecordModel');


// 📌 Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.find().select('-password'); // exclude password
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

// 📌 Create a new user
const createUser = async (req, res) => {
  const { email, fullName, password, contact, role } = req.body;

  if (!email || !fullName || !password || !contact || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = new UserModel({ email, fullName, password, contact, role });
    await newUser.save();

    res.status(201).json({ message: 'User created successfully', user: { ...newUser.toObject(), password: undefined } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create user' });
  }
};

// 📌 Delete a user by email
const deleteUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await UserModel.findOneAndDelete({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user' });
  }
};

// 📌 Change password
const changeUserPassword = async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  try {
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Old password is incorrect' });

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to change password' });
  }
};

// 📌 Reset password to default (e.g. '123456')
const resetUserPassword = async (req, res) => {
  const { email } = req.body;
  const defaultPassword = '...';

  try {
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.password = defaultPassword;
    await user.save();

    res.json({ message: 'Password has been reset to default' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reset password' });
  }
};

// 📌 Get total number of users
const getUserCount = async (req, res) => {
  try {
    const count = await UserModel.countDocuments();
    res.json({ totalUsers: count });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user count' });
  }
};


// 📌 Login user
// 📌 Login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    // ✅ Log the successful login
    await LoginRecord.create({
      userId: user._id,
      email: user.email,
      role: user.role,
      loginTime: new Date(),
      ipAddress: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
    });

    // Send success response
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        contact: user.contact,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Login failed' });
  }
};




module.exports = {
  getAllUsers,
  createUser,
  deleteUserByEmail,
  changeUserPassword,
  resetUserPassword,
  getUserCount,
  loginUser,
};
