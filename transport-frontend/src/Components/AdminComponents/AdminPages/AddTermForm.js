import React, { useState, useEffect } from 'react';
import './AddTermForm.css';

const AddTermForm = ({ onCancel, fetchTerms, editTerm }) => {
  const [termName, setTermName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (editTerm) {
      setTermName(editTerm.termName || '');
      setStartDate(editTerm.startDate?.slice(0, 10) || '');
      setEndDate(editTerm.endDate?.slice(0, 10) || '');
    }
  }, [editTerm]);

  const calculateWeeks = (start, end) => {
    const startDt = new Date(start);
    const endDt = new Date(end);
    const msInWeek = 1000 * 60 * 60 * 24 * 7;
    const weeks = Math.ceil((endDt - startDt) / msInWeek);
    return weeks > 0 ? weeks : 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numberOfWeeks = calculateWeeks(startDate, endDate);
    const termData = { termName, startDate, endDate, numberOfWeeks };

    try {
      const url = `${process.env.REACT_APP_BACKEND_API_URL}/terms${editTerm ? `/${termName}` : ''}`;
      const method = editTerm ? 'put' : 'post';

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(termData),
      });

      alert(`Term ${editTerm ? 'updated' : 'created'} successfully.`);
      fetchTerms();
      onCancel();
    } catch (error) {
      console.error('Error saving term:', error);
      alert('Failed to save term.');
    }
  };

  return (
    <div className="overlay-form-container">
      <div className="form-box">
        <h2>{editTerm ? 'Edit Term' : 'Add New Term'}</h2>
        <form onSubmit={handleSubmit}>
          <label>Term Name</label>
          <input
            type="text"
            value={termName}
            onChange={(e) => setTermName(e.target.value)}
            required
            disabled={!!editTerm} // prevent editing termName
          />

          <label>Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />

          <label>End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />

          <div className="form-buttons">
            <button type="submit" className="save-btn">
              {editTerm ? 'Update Term' : 'Save Term'}
            </button>
            <button type="button" className="cancel-btn" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTermForm;
