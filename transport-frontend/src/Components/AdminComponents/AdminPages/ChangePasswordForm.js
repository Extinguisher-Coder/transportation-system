import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import axios for making API requests
import './ChangePasswordForm.css';

const ChangePasswordForm = () => {
  const [email, setEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState(''); // To handle error messages
  const navigate = useNavigate(); // Initialize useNavigate for navigation

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    // Clear any previous errors
    setError('');

    try {
      // Send request to the backend to change the password
      const response = await axios.put(`${process.env.REACT_APP_BACKEND_API_URL}/users/change-password`, {
        email,
        oldPassword,
        newPassword,
      });

      // Handle success response
      alert('Password changed successfully!');
      
      // Clear the form after successful password change
      setEmail('');
      setOldPassword('');
      setNewPassword('');
      
      // Optionally, navigate back to the Login Page
      navigate('/');
    } catch (err) {
      // Handle error response
      if (err.response) {
        // Backend error
        setError(err.response.data.message || 'Failed to change password');
      } else {
        // Network error or other issues
        setError('An error occurred, please try again');
      }
    }
  };

  return (
    <div className="change-password-form">
      
      <h2 className="form-title">Change Password</h2>

      <form onSubmit={handleChangePassword} className="form">
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter User Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Old Password</label>
          <input
            type="password"
            placeholder="Enter Old Password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>New Password</label>
          <input
            type="password"
            placeholder="Enter New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="change-password-button">
          Change Password
        </button>
      </form>

      {error && <p className="error-message">{error}</p>} {/* Display error message */}
    </div>
  );
};

export default ChangePasswordForm;
