const express = require('express');
const router = express.Router();
const absenteeismController = require('../controllers/absenteeismController');

// Mark a single student as Absent or Omitted
router.post('/mark', absenteeismController.markAbsenteeism);

// Mark all students as Absent or Omitted
router.post('/mark-all', absenteeismController.markAllAbsentees);


// ✅ New route to get absent students
router.get('/absentees', absenteeismController.getAbsentStudents);

module.exports = router;
