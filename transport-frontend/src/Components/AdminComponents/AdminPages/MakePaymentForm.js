import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MakePaymentForm.css';

const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URL;

const MakePaymentForm = ({ student, cashier, onClose }) => {
  const [currentTerm, setCurrentTerm] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [amount, setAmount] = useState('');

  useEffect(() => {
    const fetchCurrentTerm = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/terms/current`);
        if (res.data?.termName) {
          setCurrentTerm(res.data.termName);
        } else {
          setCurrentTerm(null);
        }
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

    setIsSaving(true);

    try {
      await axios.post(`${API_BASE_URL}/payments/payments/${student.student_id}`, {
        lastAmountPaid: parseFloat(amount),
        termName: currentTerm,
        cashier,
        // reference: 'Cash' // optional; will default if not provided
      });

      alert('✅ Payment recorded successfully!');
      onClose();
    } catch (err) {
      console.error('Payment failed:', err.response || err);
      alert(
        err.response?.data?.message || '❌ Failed to record payment. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="payment-form-container">
      <form className="payment-form" onSubmit={handleSubmit}>
        <h2>Make Payment</h2>

        <div className="grid-form">
          <div className="form-group">
            <label>Student ID</label>
            <input type="text" value={student.student_id} disabled />
          </div>

          <div className="form-group">
            <label>First Name</label>
            <input type="text" value={student.first_name} disabled />
          </div>

          <div className="form-group">
            <label>Last Name</label>
            <input type="text" value={student.last_name} disabled />
          </div>

          <div className="form-group">
            <label>Class</label>
            <input type="text" value={student.class} disabled />
          </div>

          <div className="form-group">
            <label>Cashier</label>
            <input type="text" value={cashier} disabled />
          </div>

          <div className="form-group">
            <label>Term</label>
            <input
              type="text"
              value={currentTerm ? currentTerm : 'No active term'}
              disabled
            />
          </div>
        </div>

        {!currentTerm && (
          <p className="term-warning">
            ⚠️ A current term must be set before payments can be accepted.
          </p>
        )}

        <div className="form-group full-width">
          <label>Amount (GHS)</label>
          <input
            type="number"
            name="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            min="1"
            disabled={!currentTerm || isSaving}
          />
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn-save"
            disabled={!currentTerm || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Payment'}
          </button>
          <button
            type="button"
            className="btn-cancel"
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

export default MakePaymentForm;
