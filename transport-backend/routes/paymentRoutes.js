const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

// Make a payment by student ID
router.post("/payments/:student_id", paymentController.makePayment);
router.get('/all', paymentController.getAllPayments);
router.get('/unpaid-up-to-week', paymentController.getUnpaidUpToWeek);
router.get('/total/weekly-fee', paymentController.getTotalWeeklyFee);
router.get('/total/amount-paid', paymentController.getTotalAmountPaid);

module.exports = router;
