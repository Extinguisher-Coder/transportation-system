import React, { useState } from 'react';
import axios from 'axios';
import './MarkAllStudentsForm.css';

const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URL;

const MarkAllStudentsForm = ({ cashier, onClose }) => {
  const [week, setWeek] = useState('');
  const [status, setStatus] = useState('Absent');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!week || !status) {
      alert('Please select both week and status.');
      return;
    }

    try {
      setSubmitting(true);

      await axios.post(`${API_BASE_URL}/absenteeism/mark-all`, {
        weekKey: week,
        status,
        cashier,
      });

      alert(`All students marked as ${status} for ${week} by ${cashier}`);
      onClose();
    } catch (err) {
      console.error('Error marking all students:', err);
      alert('Failed to mark all students.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mark-all-form-container">
      <h3>Mark All Students</h3>
      <form className="mark-all-form" onSubmit={handleSubmit}>
        <div className="mark-all-form-row">
          <label>Cashier:</label>
          <span>{cashier}</span>
        </div>

        <div className="mark-all-form-row">
          <label>Status:</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} required>
            <option value="Absent">Absent</option>
            <option value="Omitted">Omitted</option>
          </select>
        </div>

        <div className="mark-all-form-row">
          <label>Week:</label>
          <select value={week} onChange={(e) => setWeek(e.target.value)} required>
            <option value="">Select Week</option>
            {[...Array(20)].map((_, i) => (
              <option key={i} value={`week${i + 1}`}>{`Week ${i + 1}`}</option>
            ))}
          </select>
        </div>

        <div className="mark-all-form-actions">
          <button type="submit" className="mark-btn" disabled={submitting}>
            {submitting ? 'Marking...' : 'Submit'}
          </button>
          <button type="button" className="mark-btn cancel" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default MarkAllStudentsForm;
