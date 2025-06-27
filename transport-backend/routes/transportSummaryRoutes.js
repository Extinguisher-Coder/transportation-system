const express = require('express');
const router = express.Router();
const {
  getTransportTermWeeklySummary,
} = require('../controllers/transportSummaryController');

// Route: GET /api/transport/weekly-summary?termName=TERM_NAME
router.get('/weekly-summary', getTransportTermWeeklySummary);

module.exports = router;
