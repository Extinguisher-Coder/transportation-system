const express = require('express');
const router = express.Router();
const transportReconciliationController = require('../controllers/transportReconciliationController');

// POST: Record a new reconciliation
router.post('/record', transportReconciliationController.recordTransportReconciliation);

// GET: Get summary for all cashiers
router.get('/summary', transportReconciliationController.getTransportReconciliationSummary);

module.exports = router;
