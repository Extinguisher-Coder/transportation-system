const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");

// @route   POST /students
// @desc    Create a new student
router.post("/", studentController.createStudent);

// @route   GET /students
// @desc    Get all students
router.get("/", studentController.getAllStudents);

// @route   GET /students/:id
// @desc    Get a single student by ID
router.get("/:id", studentController.getStudentById);

// @route   PUT /students/:id
// @desc    Update student
router.put("/:id", studentController.updateStudent);

// @route   DELETE /students/:id
// @desc    Delete student
router.delete("/:id", studentController.deleteStudent);

// Get the total students
router.get('/total/count', studentController.getTotalStudents);

module.exports = router;
