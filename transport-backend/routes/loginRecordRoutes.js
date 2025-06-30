const express = require("express");
const router = express.Router();
const { getLoginRecords } = require("../controllers/loginRecordController");
const { verifyToken, isAdmin } = require("../middlewares/authMiddleware");

router.get("/", verifyToken, isAdmin, getLoginRecords); // Only Admins

module.exports = router;
