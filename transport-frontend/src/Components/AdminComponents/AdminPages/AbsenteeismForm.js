import React, { useState } from 'react';
import axios from 'axios';
import './AbsenteeismForm.css';

const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URL;

const AbsenteeismForm = ({ student, cashier, onClose }) => {
  const [week, setWeek] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!week) {
      alert('Please select a week');
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(`${API_BASE_URL}/absenteeism/mark`, {
        student_id: student.student_id,
        weekKey: week,
        status: 'Absent',
        cashier,
      });

      alert(`Marked ${week} as Absent for ${student.first_name} ${student.last_name}`);
      onClose();
    } catch (err) {
      console.error('Error marking absent:', err);
      alert('Failed to mark student as absent.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="absentee-form-container">
      <h3>Mark Student as Absent</h3>
      <form onSubmit={handleSubmit} className="absentee-form">
        <div className="absentee-form-row">
          <label>Student ID:</label>
          <span>{student.student_id}</span>
        </div>

        <div className="absentee-form-row">
          <label>First Name:</label>
          <span>{student.first_name}</span>
        </div>

        <div className="absentee-form-row">
          <label>Last Name:</label>
          <span>{student.last_name}</span>
        </div>

        <div className="absentee-form-row">
          <label>Status:</label>
          <span className="absent-status">Absent</span>
        </div>

        <div className="absentee-form-row">
          <label>Cashier:</label>
          <span>{cashier}</span>
        </div>

        <div className="absentee-form-row">
          <label>Week:</label>
          <select value={week} onChange={(e) => setWeek(e.target.value)} required>
            <option value="">Select Week</option>
            {[...Array(20)].map((_, i) => (
              <option key={i} value={`week${i + 1}`}>{`Week ${i + 1}`}</option>
            ))}
          </select>
        </div>

        <div className="absentee-form-actions">
          <button type="submit" className="absentee-btn" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save'}
          </button>
          <button type="button" className="absentee-btn cancel" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AbsenteeismForm;
