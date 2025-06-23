import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TransportAddCashReceivedForm.css';

const TransportAddCashReceivedForm = () => {
  const [cashier, setCashier] = useState('');
  const [lastAmountAccounted, setLastAmountAccounted] = useState('');
  const [accountant, setAccountant] = useState('');
  const [cashiers, setCashiers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        setMessage('Error: No user info found. Please log in.');
        return;
      }

      const user = JSON.parse(storedUser);
      if (user && user.fullName) {
        setAccountant(user.fullName);
      } else {
        setMessage('Error: Full name not found in user data.');
      }
    } catch (err) {
      console.error('Error reading user from localStorage:', err);
      setMessage('Error loading user info.');
    }
  }, []);

  useEffect(() => {
    const fetchCashiers = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_API_URL}/transport-reconciliation/summary`);
        const result = await response.json();
        const uniqueCashiers = [...new Set(result.map((item) => item.cashier))];
        setCashiers(uniqueCashiers);
      } catch (err) {
        console.error('Error fetching cashiers:', err);
        setMessage('Error loading cashier list.');
      }
    };

    fetchCashiers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!cashier || !lastAmountAccounted || !accountant.trim()) {
      setMessage('Please fill all fields. Accountant name is required.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_API_URL}/transport-reconciliation/record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cashier,
          lastAmountAccounted: parseFloat(lastAmountAccounted),
          accountant,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        alert('Transport cash recorded successfully.');
        navigate(-1);
      } else {
        setMessage(result.error || 'Failed to record amount.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setMessage('Server error. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cash-form-container">
      <h3>Record Transport Cash Received</h3>
      <form onSubmit={handleSubmit} className="cash-form">
        <div>
          <label>Cashier</label>
          <select value={cashier} onChange={(e) => setCashier(e.target.value)} required>
            <option value="">Select Cashier</option>
            {cashiers.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Amount Received (GHS)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={lastAmountAccounted}
            onChange={(e) => setLastAmountAccounted(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Accountant Name</label>
          <input
            type="text"
            value={accountant}
            disabled
            style={{ fontWeight: 'bold', backgroundColor: '#f9f9f9' }}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Record Amount'}
        </button>

        <button
          type="button"
          onClick={() => navigate(-1)}
          disabled={loading}
          style={{ marginLeft: '10px', backgroundColor: '#ccc', color: '#333' }}
        >
          Close
        </button>

        {message && <p className="form-message">{message}</p>}
      </form>
    </div>
  );
};

export default TransportAddCashReceivedForm;
