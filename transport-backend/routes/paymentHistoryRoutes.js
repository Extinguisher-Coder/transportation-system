const express = require('express');
const router = express.Router();

const {
  getAllPaymentHistories,
  getTodayPaymentHistories,
  getTodayTotalCollection,
  getTotalByLocation,


} = require('../controllers/paymentHistoryController');

router.get('/', getAllPaymentHistories);
router.get('/today', getTodayPaymentHistories);
router.get('/today-total', getTodayTotalCollection);
router.get('/by-location', getTotalByLocation);



module.exports = router;
