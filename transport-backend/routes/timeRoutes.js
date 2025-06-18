const express = require('express');
const router = express.Router();
const { getServerTime } = require('../controllers/timeController');

router.get('/', getServerTime);

module.exports = router;
