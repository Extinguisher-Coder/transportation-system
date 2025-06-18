import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ResetParentPasswordForm.css';

const ResetParentPasswordForm = () => {
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!studentId.trim()) {
      alert('Please enter a Student ID');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_API_URL}/parents/reset-password/${studentId}`
      );

      if (response.status === 200) {
        alert(`Password for Student ID ${studentId} has been reset.`);
        setStudentId('');
        navigate('/admin/users');
      }
    } catch (err) {
      console.error(err.response ? err.response.data : err);
      setError('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <button className="reset-back-button" onClick={() => navigate('/admin/users')}>
        ← Back
      </button>

      <h2>Reset Parent Password</h2>

      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleResetPassword} className="form">
        <div className="form-group">
          <label>Student ID:</label>
          <input
            type="text"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            required
            placeholder="Enter Student ID"
          />
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
};

export default ResetParentPasswordForm;
