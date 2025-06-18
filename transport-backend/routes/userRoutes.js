const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

// @desc    Get all users
// @route   GET /api/users
router.get('/', userController.getAllUsers);

// @desc    Get total number of users
// @route   GET /api/users/count
router.get('/count', userController.getUserCount);

// @desc    Create a new user
// @route   POST /api/users
router.post('/', userController.createUser);

// @desc    Delete a user by email
// @route   DELETE /api/users/:email
router.delete('/:email', userController.deleteUserByEmail);

// @desc    Change user password using email
// @route   PUT /api/users/change-password
router.put('/change-password', userController.changeUserPassword);

// @desc    Reset a user's password to default
// @route   PUT /api/users/reset-password
router.put('/reset-password', userController.resetUserPassword);

// Login Route
router.post('/login', userController.loginUser);

module.exports = router;
