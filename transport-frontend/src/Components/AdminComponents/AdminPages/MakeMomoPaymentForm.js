import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MakeMomoPaymentForm.css';

const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URL;

const MakeMomoPaymentForm = ({ student, cashier, onClose }) => {
  const [currentTerm, setCurrentTerm] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');

  useEffect(() => {
    const fetchCurrentTerm = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/terms/current`);
        setCurrentTerm(res.data?.termName || null);
      } catch (err) {
        console.error('Error fetching current term:', err);
        setCurrentTerm(null);
      }
    };

    fetchCurrentTerm();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      alert('❌ Please enter a valid amount.');
      return;
    }

    if (!reference.trim()) {
      alert('❌ Please provide a reference.');
      return;
    }

    setIsSaving(true);

    try {
      await axios.post(`${API_BASE_URL}/payments/payments/${student.student_id}`, {
        lastAmountPaid: parseFloat(amount),
        termName: currentTerm,
        cashier,
        reference,
      });

      alert('✅ Momo payment recorded successfully!');
      onClose();
    } catch (err) {
      console.error('Payment failed:', err.response || err);
      alert(
        err.response?.data?.message || '❌ Failed to record Momo payment. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="momo-form-container">
      <form className="momo-form" onSubmit={handleSubmit}>
        <h2>Momo Payment</h2>

        <div className="momo-grid-form">
          <div className="momo-form-group">
            <label>Student ID</label>
            <input type="text" value={student.student_id} disabled />
          </div>

          <div className="momo-form-group">
            <label>First Name</label>
            <input type="text" value={student.first_name} disabled />
          </div>

          <div className="momo-form-group">
            <label>Last Name</label>
            <input type="text" value={student.last_name} disabled />
          </div>

          <div className="momo-form-group">
            <label>Class</label>
            <input type="text" value={student.class} disabled />
          </div>

          <div className="momo-form-group">
            <label>Cashier</label>
            <input type="text" value={cashier} disabled />
          </div>

          <div className="momo-form-group">
            <label>Term</label>
            <input
              type="text"
              value={currentTerm ? currentTerm : 'No active term'}
              disabled
            />
          </div>
        </div>

        {!currentTerm && (
          <p className="momo-term-warning">
            ⚠️ A current term must be set before payments can be accepted.
          </p>
        )}

        <div className="momo-form-group momo-full-width">
          <label>Amount (GHS)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            min="1"
            disabled={!currentTerm || isSaving}
          />
        </div>

        <div className="momo-form-group momo-full-width">
          <label>Reference</label>
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            required
            disabled={!currentTerm || isSaving}
          />
        </div>

        <div className="momo-form-actions">
          <button
            type="submit"
            className="momo-btn-save"
            disabled={!currentTerm || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Momo Payment'}
          </button>
          <button
            type="button"
            className="momo-btn-cancel"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default MakeMomoPaymentForm;
