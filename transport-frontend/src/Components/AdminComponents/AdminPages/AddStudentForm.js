import React, { useState, useEffect } from 'react';
import './AddStudentForm.css';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URL;

const classOptions = [
  'Year 1A', 'Year 1B', 'Year 2A', 'Year 2B', 'Year 3A', 'Year 3B',
  'Year 4A', 'Year 4B', 'Year 5A', 'Year 5B', 'Year 6', 'Year 7', 'Year 8',
  'GC 1', 'GC 2', 'GC 3', 'TT A', 'TT B', 'TT C', 'TT D',
  'BB A', 'BB B', 'BB C', 'RS A', 'RS B', 'RS C',
  'KKJ A', 'KKJ B', 'KKJ C', 'KKS A', 'KKS B'
];

const directions = ['in', 'out', 'in_out'];

const initialFormState = {
  first_name: '',
  last_name: '',
  gender: '',
  dob: '',
  class: '',
  location_name: '',
  direction: '',
  guardian_name: '',
  guardian_tel: ''
};

const AddStudentForm = ({ onClose, onStudentAdded, initialData }) => {
  const isEditMode = !!initialData;
  const [formData, setFormData] = useState(initialFormState);
  const [locations, setLocations] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/locations`);
        setLocations(res.data.map(loc => loc.location_name));
      } catch (err) {
        console.error('Failed to fetch locations:', err);
      }
    };
    fetchLocations();
  }, []);

  useEffect(() => {
    if (isEditMode) {
      setFormData({
        first_name: initialData.first_name || '',
        last_name: initialData.last_name || '',
        gender: initialData.gender || '',
        dob: initialData.dob ? initialData.dob.split('T')[0] : '',
        class: initialData.class || '',
        location_name: initialData.location_name || '',
        direction: initialData.direction || '',
        guardian_name: initialData.guardian_name || '',
        guardian_tel: initialData.guardian_tel || ''
      });
    }
  }, [initialData, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isEditMode) {
        await axios.put(`${API_BASE_URL}/students/${initialData._id}`, formData);
        alert('Student updated successfully.');
      } else {
        await axios.post(`${API_BASE_URL}/students`, formData);
        alert('Student added successfully.');
        setFormData(initialFormState); // Reset
      }
      onStudentAdded();
    } catch (err) {
      console.error('Error submitting form:', err);
      const msg =
        err.response?.data?.message ||
        'There was an error. Please check the form and try again.';
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-form">
        <h2>{isEditMode ? 'Update Student' : 'Add New Student'}</h2>
        <form onSubmit={handleSubmit}>
          <input
            name="first_name"
            placeholder="First Name"
            value={formData.first_name}
            onChange={handleChange}
            required
          />
          <input
            name="last_name"
            placeholder="Last Name"
            value={formData.last_name}
            onChange={handleChange}
            required
          />
          <select name="gender" value={formData.gender} onChange={handleChange} required>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          <input
            name="dob"
            type="date"
            value={formData.dob}
            onChange={handleChange}
            required
          />
          <select name="class" value={formData.class} onChange={handleChange} required>
            <option value="">Select Class</option>
            {classOptions.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
          <select
            name="location_name"
            value={formData.location_name}
            onChange={handleChange}
            required
          >
            <option value="">Select Location</option>
            {locations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
          <select name="direction" value={formData.direction} onChange={handleChange} required>
            <option value="">Select Direction</option>
            {directions.map(dir => (
              <option key={dir} value={dir}>{dir}</option>
            ))}
          </select>
          <input
            name="guardian_name"
            placeholder="Guardian Name"
            value={formData.guardian_name}
            onChange={handleChange}
            required
          />
          <input
            name="guardian_tel"
            placeholder="Guardian Tel"
            value={formData.guardian_tel}
            onChange={handleChange}
            required
          />
          <div className="form-actions">
            <button type="submit" className="btn primary" disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : isEditMode ? 'Update' : 'Submit'}
            </button>
            <button type="button" className="btn" onClick={onClose}>
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudentForm;
