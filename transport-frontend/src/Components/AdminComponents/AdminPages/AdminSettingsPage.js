import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminSettingsPage.css';
import AddTermForm from './AddTermForm';

const AdminSettingsPage = () => {
  const [terms, setTerms] = useState([]);
  const [filteredTerms, setFilteredTerms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddTermForm, setShowAddTermForm] = useState(false);
  const [editTerm, setEditTerm] = useState(null);
  const [transportRestriction, setTransportRestriction] = useState('allow');

  useEffect(() => {
    fetchTerms();
    fetchTransportRestriction();
  }, []);

  useEffect(() => {
    const filtered = terms.filter((term) =>
      (term.termName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
    setFilteredTerms(filtered);
  }, [searchTerm, terms]);

  const fetchTerms = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/terms`);
      setTerms(response.data);
    } catch (error) {
      console.error("Error fetching terms:", error);
    }
  };

  const fetchTransportRestriction = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/settings/transportPaymentRestriction`);
      setTransportRestriction(res.data.value); // ✅ Use .value not full res.data
    } catch (error) {
      console.error("Error fetching transport restriction:", error);
    }
  };

  const updateTransportRestriction = async (value) => {
    try {
      await axios.put(`${process.env.REACT_APP_BACKEND_API_URL}/settings/transportPaymentRestriction`, { value });
      setTransportRestriction(value);
    } catch (error) {
      console.error("Failed to update transport restriction:", error);
    }
  };

  const handleAddTermClick = () => {
    setEditTerm(null);
    setShowAddTermForm(true);
  };

  const handleCancel = () => {
    setShowAddTermForm(false);
    setEditTerm(null);
  };

  const handleDelete = async (termId) => {
    if (window.confirm('Are you sure you want to delete this term?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_BACKEND_API_URL}/terms/${termId}`);
        setTerms((prev) => prev.filter((term) => term._id !== termId));
      } catch (error) {
        console.error("Failed to delete term:", error);
        alert("Error deleting term");
        fetchTerms();
      }
    }
  };

  const handleEdit = (term) => {
    setEditTerm(term);
    setShowAddTermForm(true);
  };

  const formatDate = (dateStr) => {
    return dateStr
      ? new Date(dateStr).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : 'N/A';
  };

  const handleStudentFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      const rows = text.split('\n').filter(Boolean);
      const headers = rows[0].split(',').map(h => h.trim());

      const students = rows.slice(1).map(row => {
        const values = row.split(',').map(v => v.trim());
        return headers.reduce((obj, key, idx) => {
          obj[key] = values[idx];
          return obj;
        }, {});
      });

      for (const student of students) {
        try {
          await axios.post(`${process.env.REACT_APP_BACKEND_API_URL}/students/register`, student);
        } catch (err) {
          console.error('Failed to upload student:', student, err);
          alert(`Failed to upload: ${student.firstName} ${student.lastName}`);
        }
      }

      alert('Student upload completed.');
    };

    reader.readAsText(file);
  };

  return (
    <div className="settings-page-container">
      <h1 className="page-title">Transport Setting - Manage Terms</h1>

      {/* 🚌 Transport Restriction */}
      <div className="restriction-options">
        <label>
          <input
            type="radio"
            name="transportRestriction"
            value="restrict"
            checked={transportRestriction === 'restrict'}
            onChange={() => updateTransportRestriction('restrict')}
          />
          Restrict Partial Payment for Transport
        </label>
        <label>
          <input
            type="radio"
            name="transportRestriction"
            value="allow"
            checked={transportRestriction === 'allow'}
            onChange={() => updateTransportRestriction('allow')}
          />
          Allow Partial Payment for Transport
        </label>
      </div>

      <div className="top-controls">
        <button className="add-term-btn" onClick={handleAddTermClick}>Add New Term</button>

        <label className="upload-students-btn">
          Upload Students
          <input type="file" accept=".csv" onChange={handleStudentFileUpload} hidden />
        </label>

        <input
          type="text"
          className="search-input"
          placeholder="Search by term name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {showAddTermForm && (
        <AddTermForm
          onCancel={handleCancel}
          fetchTerms={fetchTerms}
          editTerm={editTerm}
        />
      )}

      <div className="terms-list">
        <table className="terms-table">
          <thead>
            <tr>
              <th>Term Name</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Number of Weeks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTerms.map((term) => (
              <tr key={term._id}>
                <td>{term.termName}</td>
                <td>{formatDate(term.startDate)}</td>
                <td>{formatDate(term.endDate)}</td>
                <td>{term.numberOfWeeks}</td>
                <td>
                  <button className="edit-btn" onClick={() => handleEdit(term)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(term._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
