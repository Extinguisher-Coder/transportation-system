import React, { useEffect, useState } from 'react';
import './TransportCashBalancingPage.css';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';

const TransportCashBalancingPage = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [cashiers, setCashiers] = useState([]);
  const [selectedCashier, setSelectedCashier] = useState('All Cashiers');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const navigate = useNavigate();

  const formatCurrency = (amount) => `GHS ${amount.toFixed(2)}`;

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [selectedCashier, selectedStatus, data]);

  const fetchData = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_API_URL}/transport-reconciliation/summary`);
      const result = await response.json();
      setData(result);
      setFilteredData(result);
      const uniqueCashiers = ['All Cashiers', ...new Set(result.map((item) => item.cashier))];
      setCashiers(uniqueCashiers);
    } catch (error) {
      console.error('Error fetching transport cash reconciliation summary:', error);
    }
  };

  const applyFilters = () => {
    let filtered = data;
    if (selectedCashier !== 'All Cashiers') {
      filtered = filtered.filter((item) => item.cashier === selectedCashier);
    }
    if (selectedStatus !== 'All Status') {
      filtered = filtered.filter((item) => item.status === selectedStatus);
    }
    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalDifference = filteredData.reduce((acc, item) => acc + item.difference, 0);
  const overallStatus =
    filteredData.length === 0
      ? 'No Data'
      : filteredData.every((item) => item.status === 'Balanced')
      ? 'All Balanced'
      : 'Unbalanced Entries Exist';

  const getStatusClass = (status) => {
    if (status === 'Balanced') return 'status-balanced';
    if (status === 'Unbalanced') return 'status-unbalanced';
    if (status === 'Over Balanced') return 'status-over';
    return '';
  };

  const getDiffClass = (status) => {
    if (status === 'Balanced') return 'diff-balanced';
    if (status === 'Unbalanced') return 'diff-unbalanced';
    if (status === 'Over Balanced') return 'diff-over';
    return '';
  };

  const handleExportExcel = () => {
    const worksheetData = filteredData.map((item, index) => ({
      SN: index + 1,
      Cashier: item.cashier,
      'Total Payment Entries': item.recordedTotal,
      'Total Accounted': item.handedOver,
      Difference: item.difference,
      Status: item.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transport Cash Balancing Report');
    XLSX.writeFile(workbook, 'Transport_Cash_Balancing_Report.xlsx');
  };

  return (
    <div className="cash-page">
      <h2 className="pagetitle">Transport Cash Balancing</h2>

      <div className="action-row">
        <button
          className="primary-btn"
          onClick={() => {
            const { role } = JSON.parse(localStorage.getItem('user'));
            const routeMap = {
              Admin: '/admin/transport-add-received',
              Accountant: '/accountant/transport-add-received',
            };
            navigate(routeMap[role] || '/unauthorized');
          }}
        >
          Add Cash Received
        </button>

        <button
          className="primary-btn"
          onClick={() => {
            const { role } = JSON.parse(localStorage.getItem('user'));
            const routeMap = {
              Admin: '/admin/transport-daily-balancing',
              Accountant: '/accountant/transport-daily-balancing',
            };
            navigate(routeMap[role] || '/unauthorized');
          }}
        >
          Cash Received History
        </button>

        <button className="secondary-btn" onClick={handleExportExcel}>
          Export to Excel
        </button>
      </div>

      <div className="filter-row">
        <select value={selectedCashier} onChange={(e) => setSelectedCashier(e.target.value)}>
          {cashiers.map((cashier) => (
            <option key={cashier} value={cashier}>
              {cashier}
            </option>
          ))}
        </select>

        <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
          <option value="All Status">All Status</option>
          <option value="Balanced">Balanced</option>
          <option value="Unbalanced">Unbalanced</option>
          <option value="Over Balanced">Over Balanced</option>
        </select>
      </div>

      <div className={`status-line ${overallStatus === 'All Balanced' ? 'balanced' : 'unbalanced'}`}>
        <strong>Status:</strong> {overallStatus} | <strong>Total Difference:</strong> {formatCurrency(totalDifference)}
      </div>

      <table className="cash-table">
        <thead>
          <tr>
            <th>SN</th>
            <th>Cashier</th>
            <th>Total Payment Entries</th>
            <th>Total Accounted</th>
            <th>Difference</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((item, index) => (
            <tr key={index}>
              <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
              <td>{item.cashier}</td>
              <td>{formatCurrency(item.recordedTotal)}</td>
              <td>{formatCurrency(item.handedOver)}</td>
              <td className={getDiffClass(item.status)}>{formatCurrency(item.difference)}</td>
              <td className={getStatusClass(item.status)}>{item.status}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="grand-total-row">
            <td colSpan="2"><strong>Grand Total</strong></td>
            <td><strong>{formatCurrency(filteredData.reduce((acc, item) => acc + item.recordedTotal, 0))}</strong></td>
            <td><strong>{formatCurrency(filteredData.reduce((acc, item) => acc + item.handedOver, 0))}</strong></td>
            <td><strong>{formatCurrency(filteredData.reduce((acc, item) => acc + item.difference, 0))}</strong></td>
            <td></td>
          </tr>
        </tfoot>
      </table>

      <div className="pagination">
        Page {currentPage} of {totalPages}
        <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}>
          Prev
        </button>
        <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
};

export default TransportCashBalancingPage;
