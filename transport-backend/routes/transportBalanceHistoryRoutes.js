const express = require('express');
const router = express.Router();
const controller = require('../controllers/transportBalanceHistoryController');

// GET all transport balance histories
router.get('/', controller.getAllTransportBalanceHistories);

module.exports = router;
