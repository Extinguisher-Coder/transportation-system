import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MakePaymentForm.css';

const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URL;

const MakePaymentForm = ({ student, cashier, onClose }) => {
  const [currentTerm, setCurrentTerm] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState('');
  const [transportRestriction, setTransportRestriction] = useState('');

  useEffect(() => {
    const fetchCurrentTerm = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/terms/current`);
        if (res.data?.termName) {
          setCurrentTerm(res.data.termName);
        }
      } catch (err) {
        console.error('Error fetching current term:', err);
        setCurrentTerm(null);
      }
    };

    const fetchTransportRestriction = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/settings/transportPaymentRestriction`);
        if (res.data?.value) {
          setTransportRestriction(res.data.value); // expects 'restrict' or 'allow'
        }
      } catch (err) {
        console.error('Error fetching transport restriction:', err);
      }
    };

    fetchCurrentTerm();
    fetchTransportRestriction();
  }, []);

  const handleAmountChange = (e) => {
    const value = e.target.value;
    setAmount(value);

    const numeric = parseFloat(value);
    const weeklyFee = parseFloat(student.weekly_fee);

    if (!value || isNaN(numeric)) {
      setAmountError('');
    } else if (transportRestriction === 'restrict' && numeric % weeklyFee !== 0) {
      setAmountError(`❌ Invalid amount. Must be a multiple of GHS ${weeklyFee}. Please Contact Madam Sharin.`);
    } else {
      setAmountError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentTerm || !transportRestriction) {
      alert('❌ Current term or transport restriction setting missing.');
      return;
    }

    const numeric = parseFloat(amount);
    const weeklyFee = parseFloat(student.weekly_fee);

    if (!amount || isNaN(numeric) || numeric <= 0) {
      alert('❌ Please enter a valid amount.');
      return;
    }

    if (transportRestriction === 'restrict' && numeric % weeklyFee !== 0) {
      alert(`❌ Amount must be a multiple of GHS ${weeklyFee}. Please Contact Madam Sharin.`) ;
      return;
    }

    setIsSaving(true);

    try {
      await axios.post(`${API_BASE_URL}/payments/payments/${student.student_id}`, {
        lastAmountPaid: numeric,
        termName: currentTerm,
        cashier
      });

      alert('✅ Transport payment recorded successfully!');
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
        <h2>Make Transport Payment</h2>

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
            <input type="text" value={currentTerm || 'No active term'} disabled />
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
            onChange={handleAmountChange}
            required
            min="1"
            disabled={!currentTerm || isSaving}
          />
          {amountError && (
            <p style={{ color: 'red', marginTop: '5px' }}>{amountError}</p>
          )}
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn-save"
            disabled={!currentTerm || isSaving || !!amountError}
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
