const Student = require("../models/studentModel");
const Counter = require("../models/counterModel");
const Payment = require("../models/paymentModel");
const Term = require("../models/termModel");

// @desc    Create a new student with auto-incremented ID and payment record
// @route   POST /students
exports.createStudent = async (req, res) => {
  try {
    console.log("Received student form data:", req.body);

    // Step 1: Fetch or initialize the counter
    let counter = await Counter.findOne({ name: "studentId" });
    if (!counter) {
      counter = await Counter.create({ name: "studentId", value: 1 });
    }

    // Step 2: Generate the student_id
    const padded = String(counter.value).padStart(3, "0");
    const year = new Date().getFullYear();
    const student_id = `TRSP-${year}-${padded}`;

    // Step 3: Attach student_id to the request body
    const studentData = { ...req.body, student_id };

    // Step 4: Create and save the student
    const student = new Student(studentData);
    await student.save();

    // Step 5: Fetch current term and create payment record
    const today = new Date();
    const currentTerm = await Term.findOne({
      startDate: { $lte: today },
      endDate: { $gte: today },
    });

    if (!currentTerm) {
      return res.status(400).json({ message: "No active term found. Cannot create payment." });
    }

    const paymentData = {
      student_id,
      first_name: student.first_name,
      last_name: student.last_name,
      class: student.class,
      location_name: student.location_name,
      direction: student.direction,
      weekly_fee: student.weekly_fee,
      termName: currentTerm.termName,
    };

    await Payment.create(paymentData);

    // Step 6: Increment counter
    counter.value += 1;
    await counter.save();

    res.status(201).json(student);
  } catch (err) {
    console.error("Create student failed:", err.message);
    if (err.errors) {
      for (const field in err.errors) {
        console.error(`Validation error for ${field}: ${err.errors[field].message}`);
      }
    }
    res.status(400).json({ message: err.message });
  }
};

// @desc    Get all students
// @route   GET /students
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch (err) {
    console.error("Get all students failed:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get a single student by ID
// @route   GET /students/:id
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json(student);
  } catch (err) {
    console.error("Get student by ID failed:", err.message);
    res.status(500).json({ message: err.message });
  }
};



// @desc    Update student

exports.updateStudent = async (req, res) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    // 🔄 Sync relevant fields in the Payment collection
    await Payment.findOneAndUpdate(
      { student_id: updatedStudent.student_id },
      {
        first_name: updatedStudent.first_name,
        last_name: updatedStudent.last_name,
        class: updatedStudent.class,
        location_name: updatedStudent.location_name,
        direction: updatedStudent.direction,
        weekly_fee: updatedStudent.weekly_fee,
      }
    );

    res.status(200).json(updatedStudent);
  } catch (err) {
    console.error("Update student failed:", err.message);
    res.status(400).json({ message: err.message });
  }
};


// @desc    Delete student
// @route   DELETE /students/:id
exports.deleteStudent = async (req, res) => {
  try {
    const deleted = await Student.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json({ message: "Student deleted successfully" });
  } catch (err) {
    console.error("Delete student failed:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get total number of students
// @route   GET /students/total
exports.getTotalStudents = async (req, res) => {
  try {
    const count = await Student.countDocuments();
    res.status(200).json({ totalStudents: count });
  } catch (err) {
    console.error("Get total students failed:", err.message);
    res.status(500).json({ message: err.message });
  }
};
