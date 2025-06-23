const express = require('express');
const router = express.Router();
const {
  transportCashierWeeklySummary
} = require('../controllers/cashierTransportSummaryController');

// @route GET /api/cashier-transport-summary/weekly?termName=...
router.get('/weekly', transportCashierWeeklySummary);

module.exports = router;
