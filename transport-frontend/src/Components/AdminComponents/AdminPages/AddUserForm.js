import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom
import './AddUserForm.css'; // Import your CSS file
import axios from 'axios'; // Import axios for HTTP requests

const AddUserForm = () => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [contact, setContact] = useState('');
  const [role, setRole] = useState('Admin');
  const navigate = useNavigate(); // Initialize useNavigate for navigation

  // Handle form submit
  const handleSave = async (e) => {
    e.preventDefault();

    // Create the new user object
    const newUser = { email, fullName, password, contact, role };

    try {
      // Send a POST request to the backend to create the new user
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_API_URL}/users`,
        newUser
      );

      // Check if the request was successful
      if (response.status === 201) {
        alert('User is Added Successfully');
        navigate('/admin/users');
      } else {
        // Handle errors or failed response
        alert('Error: Could not create user');
      }
    } catch (error) {
      console.error('There was an error creating the user!', error);
      alert('Error: Could not create user');
    }
  };

  return (
    <div className="add-user-form">
      <button className="addback-button" onClick={() => navigate('/admin/users')}>
        Back to List
      </button>

      <h2 className="form-title">Add User</h2>

      <form onSubmit={handleSave} className="form">
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            placeholder="Enter Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Contact</label>
          <input
            type="text"
            placeholder="Enter Contact Number"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="Admin">Admin</option>
            <option value="Cashier">Cashier</option>
            <option value="Registrar">Registrar</option>
            <option value="Accountant">Accountant</option>
          </select>
        </div>

        <button type="submit" className="save-button">
          Save User
        </button>
      </form>
    </div>
  );
};

export default AddUserForm;
