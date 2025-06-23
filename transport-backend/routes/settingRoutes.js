const express = require('express');
const router = express.Router();
const { getSetting, updateSetting } = require('../controllers/settingController');

// GET a setting by key (e.g., transportPaymentRestriction)
router.get('/:key', getSetting);

// PUT (update or create) a setting by key
router.put('/:key', updateSetting);

module.exports = router;
