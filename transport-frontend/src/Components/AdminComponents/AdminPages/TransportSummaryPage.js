import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './TransportSummaryPage.css'; // reuse the same styling

const TransportSummaryPage = () => {
  const [termName, setTermName] = useState('');
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCurrentTerm = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/terms/current`);
        if (res.data && res.data.termName) {
          setTermName(res.data.termName);
        }
      } catch (error) {
        console.error('Error fetching current term:', error);
      }
    };

    fetchCurrentTerm();
  }, []);

  useEffect(() => {
    const fetchSummary = async () => {
      if (!termName) return;
      setLoading(true);
      try {
        const res = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/transport/weekly-summary?termName=${termName}`);
        setSummary(res.data.summary);
      } catch (error) {
        console.error('Error fetching transport weekly summary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [termName]);

  const formatCurrency = (amount) => {
    return `GHS ${Number(amount).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const grandTotal = summary.reduce((acc, item) => acc + (item.totalAmount || 0), 0);

  return (
    <div className="summary-container">
      <h2 className="summary-title">Transport Weekly Summary</h2>

      <p className="summary-term">
        <strong>Term:</strong> {termName || 'Loading...'}
      </p>

      {loading ? (
        <p className="summary-loading">Loading summary...</p>
      ) : (
        <table className="summary-table">
          <thead>
            <tr>
              <th>Week</th>
              <th>Date Range</th>
              <th>Total Amount Collected</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((item, index) => (
              <tr key={index}>
                <td>{item.week}</td>
                <td>{item.range}</td>
                <td>{formatCurrency(item.totalAmount)}</td>
              </tr>
            ))}
            <tr className="grand-total-row">
              <td colSpan={2} style={{ fontWeight: 'bold', textAlign: 'right' }}>
                Grand Total:
              </td>
              <td style={{ fontWeight: 'bold' }}>
                {formatCurrency(grandTotal)}
              </td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TransportSummaryPage;
