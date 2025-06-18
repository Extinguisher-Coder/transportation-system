import React from 'react';
import './StudentDetailView.css';
import { printTableWithHeader } from '../../../utils/printUtils'; // ✅ Import utility

const StudentDetailView = ({ student, onClose }) => {
  if (!student) return null;

  const handlePrint = () => {
    printTableWithHeader({
      title: 'Student Details',
      columns: [
        { key: 'student_id', label: 'Student ID' },
        { key: 'full_name', label: 'Name' },
        { key: 'gender', label: 'Gender' },
        { key: 'dob', label: 'Date of Birth' },
        { key: 'age', label: 'Age' },
        { key: 'class', label: 'Class' },
        { key: 'location_name', label: 'Location' },
        { key: 'direction', label: 'Direction' },
        { key: 'weekly_fee', label: 'Weekly Fee' },
        { key: 'guardian_name', label: 'Guardian Name' },
        { key: 'guardian_tel', label: 'Guardian Phone' },
      ],
      rows: [
        {
          student_id: student.student_id,
          full_name: `${student.first_name} ${student.last_name}`,
          gender: student.gender,
          dob: new Date(student.dob).toLocaleDateString(),
          age: student.age,
          class: student.class,
          location_name: student.location_name,
          direction: student.direction,
          weekly_fee: student.weekly_fee,
          guardian_name: student.guardian_name,
          guardian_tel: student.guardian_tel,
        },
      ],
    });
  };

  return (
    <div className="student-detail-overlay">
      <div className="student-detail-modal">
        <div id="student-print-area">
          <h2>Student Details</h2>
          <table>
            <tbody>
              <tr><td><strong>Student ID:</strong></td><td>{student.student_id}</td></tr>
              <tr><td><strong>Name:</strong></td><td>{student.first_name} {student.last_name}</td></tr>
              <tr><td><strong>Gender:</strong></td><td>{student.gender}</td></tr>
              <tr><td><strong>Date of Birth:</strong></td><td>{new Date(student.dob).toLocaleDateString()}</td></tr>
              <tr><td><strong>Age:</strong></td><td>{student.age}</td></tr>
              <tr><td><strong>Class:</strong></td><td>{student.class}</td></tr>
              <tr><td><strong>Location:</strong></td><td>{student.location_name}</td></tr>
              <tr><td><strong>Direction:</strong></td><td>{student.direction}</td></tr>
              <tr><td><strong>Weekly Fee:</strong></td><td>{student.weekly_fee}</td></tr>
              <tr><td><strong>Guardian Name:</strong></td><td>{student.guardian_name}</td></tr>
              <tr><td><strong>Guardian Phone:</strong></td><td>{student.guardian_tel}</td></tr>
            </tbody>
          </table>
        </div>
        <div className="student-detail-actions">
          <button className="btn primary" onClick={handlePrint}>🖨️ Print</button>
          <button className="btn danger" onClick={onClose}>❌ Close</button>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailView;
