// Updated React Component with unique classNames
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import './TransportDailyBalancingPage.css';

const TransportDailyBalancingPage = () => {
  const [history, setHistory] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [cashierFilter, setCashierFilter] = useState('');
  const [accountantFilter, setAccountantFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [cashiers, setCashiers] = useState([]);
  const [accountants, setAccountants] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_API_URL}/transport-balance-history`);
      const data = await response.json();
      setHistory(data);
      setFiltered(data);
      setCashiers([...new Set(data.map(item => item.cashier))]);
      setAccountants([...new Set(data.map(item => item.accountant))]);
    } catch (err) {
      console.error('Error fetching transport balance history:', err);
    }
  };

  useEffect(() => {
    let data = history;

    if (search) {
      data = data.filter(d => d.lastAmountAccounted?.toString().includes(search));
    }
    if (cashierFilter) {
      data = data.filter(d => d.cashier === cashierFilter);
    }
    if (accountantFilter) {
      data = data.filter(d => d.accountant === accountantFilter);
    }
    if (dateFilter) {
      data = data.filter(d => d.lastAccountedDate?.slice(0, 10) === dateFilter);
    }

    setFiltered(data);
  }, [search, cashierFilter, accountantFilter, dateFilter, history]);

  const handleExport = () => {
    const exportData = filtered.map((item, index) => ({
      SN: index + 1,
      Cashier: item.cashier,
      'Amount Accounted': item.lastAmountAccounted,
      'Date Accounted': item.lastAccountedDate
        ? new Date(item.lastAccountedDate).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          })
        : '',
      Accountant: item.accountant
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'TransportBalanceHistory');
    XLSX.writeFile(workbook, 'Transport_Daily_Balance_History.xlsx');
  };

  const totalAccounted = filtered.reduce((acc, curr) => acc + Number(curr.lastAmountAccounted || 0), 0);

  return (
    <div className="transport-daily-page">
      <h1 className="transport-daily-title">Transport Cash Balancing History</h1>

      <div className="transport-daily-actions">
        <button className="transport-daily-export-btn" onClick={handleExport}>
          Export to Excel
        </button>
      </div>

      <div className="transport-daily-filters">
        <div className="transport-daily-search-date">
          <input
            type="text"
            placeholder="Search by Amount"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>

        <select value={cashierFilter} onChange={(e) => setCashierFilter(e.target.value)}>
          <option value="">All Cashiers</option>
          {cashiers.map(cashier => (
            <option key={cashier} value={cashier}>{cashier}</option>
          ))}
        </select>

        <select value={accountantFilter} onChange={(e) => setAccountantFilter(e.target.value)}>
          <option value="">All Accountants</option>
          {accountants.map(accountant => (
            <option key={accountant} value={accountant}>{accountant}</option>
          ))}
        </select>
      </div>

      <div className="transport-daily-total">
        Total Accounted: GHS {totalAccounted.toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </div>

      <table className="transport-daily-table">
        <thead>
          <tr>
            <th>SN</th>
            <th>Cashier</th>
            <th>Amount Accounted</th>
            <th>Date Accounted</th>
            <th>Accountant</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length > 0 ? (
            filtered.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{item.cashier}</td>
                <td>GHS {Number(item.lastAmountAccounted).toLocaleString()}</td>
                <td>
                  {item.lastAccountedDate
                    ? new Date(item.lastAccountedDate).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })
                    : ''}
                </td>
                <td>{item.accountant}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center' }}>No records found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TransportDailyBalancingPage;
