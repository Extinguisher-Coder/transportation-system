import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import './AdminReportPage.css';
import { printTableWithHeader } from '../../../utils/printUtils';

const AdminReportPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCashier, setSelectedCashier] = useState('All');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  const user = JSON.parse(localStorage.getItem("user")) || {};

  const classList = [
    'Year 1A', 'Year 1B', 'Year 2A', 'Year 2B', 'Year 3A', 'Year 3B',
    'Year 4A', 'Year 4B', 'Year 5A', 'Year 5B', 'Year 6', 'Year 7', 'Year 8',
    'GC 1', 'GC 2', 'GC 3', 'TT A', 'TT B', 'TT C', 'TT D',
    'BB A', 'BB B', 'BB C', 'RS A', 'RS B', 'RS C',
    'KKJ A', 'KKJ B', 'KKJ C', 'KKS A', 'KKS B'
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/payment-histories`);
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCashier, selectedClass, selectedLocation, selectedDate]);

  const uniqueCashiers = ['All', ...new Set(data.map(item => item.cashier))];
  const uniqueLocations = ['All', ...new Set(data.map(item => item.location_name).filter(Boolean))];

  const filteredData = data.filter(item => {
    const searchText = searchQuery.toLowerCase();
    const matchesSearch =
      item.student_id?.toLowerCase().includes(searchText) ||
      item.first_name?.toLowerCase().includes(searchText) ||
      item.last_name?.toLowerCase().includes(searchText) ||
      `${item.first_name} ${item.last_name}`.toLowerCase().includes(searchText) ||
      item.class?.toLowerCase().includes(searchText) ||
      item.location_name?.toLowerCase().includes(searchText) ||
      item.direction?.toLowerCase().includes(searchText);

    const matchesCashier = selectedCashier === 'All' || item.cashier === selectedCashier;
    const matchesClass = selectedClass === 'All' || item.class === selectedClass;
    const matchesLocation = selectedLocation === 'All' || item.location_name === selectedLocation;
    const matchesDate = !selectedDate || new Date(item.paymentDate).toDateString() === new Date(selectedDate).toDateString();

    return matchesSearch && matchesCashier && matchesClass && matchesLocation && matchesDate;
  });

  const totalAmount = filteredData.reduce((sum, item) => sum + (item.amountPaid || 0), 0);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handleExport = () => {
    const exportData = filteredData.map((item, index) => ({
      SN: index + 1,
      "Trans-ID": item.trans_id,
      StudentID: item.student_id,
      Name: `${item.first_name} ${item.last_name}`,
      Class: item.class,
      Location: item.location_name || '',
      Direction: item.direction || '',
      "Amount Paid": item.amountPaid,
      "Payment Date": new Date(item.paymentDate).toLocaleDateString('en-US'),
      Cashier: item.cashier,
      Reference: item.reference,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reports');
    XLSX.writeFile(workbook, 'AdminReport.xlsx');
  };

  const handlePrint = () => {
    printTableWithHeader({
      title: `Payment Report`,
      summary: `Total Amount Collected: GHS ${totalAmount.toFixed(2)}`,
      columns: [
        { key: 'sn', label: 'SN' },
        { key: 'trans_id', label: 'Trans-ID' },
        { key: 'student_id', label: 'Student ID' },
        { key: 'name', label: 'Name' },
        { key: 'class', label: 'Class' },
        { key: 'location', label: 'Location' },
        { key: 'direction', label: 'Direction' },
        { key: 'amountPaid', label: 'Amount Paid' },
        { key: 'paymentDate', label: 'Payment Date' },
        { key: 'cashier', label: 'Cashier' },
        { key: 'reference', label: 'Reference' },
      ],
      rows: filteredData.map((item, index) => ({
        sn: index + 1,
        trans_id: item.trans_id,
        student_id: item.student_id,
        name: `${item.first_name} ${item.last_name}`,
        class: item.class,
        location: item.location_name || '',
        direction: item.direction || '',
        amountPaid: `GHS ${item.amountPaid}`,
        paymentDate: new Date(item.paymentDate).toLocaleDateString('en-US'),
        cashier: item.cashier,
        reference: item.reference,
      })),
    });
  };

  return (
    <div className="admin-reports__page">
      <div className="admin-reports__container">
        <header className="admin-reports__header">
          <h1 className="admin-reports__title">Transport Payment Report</h1>
        </header>

        <div className="admin-reports__buttons">
          <button onClick={() => navigate(`/${user.role.toLowerCase()}/today`)} className="admin-reports__btn admin-reports__btn--today">Today's Report</button>
          <button onClick={() => navigate(`/${user.role.toLowerCase()}/weekly`)} className="admin-reports__btn admin-reports__btn--weekly">Weekly Report</button>
          <button onClick={() => navigate(`/${user.role.toLowerCase()}/unpaid`)} className="admin-reports__btn admin-reports__btn--unpaid">Unpaid Students</button>
          <button onClick={handlePrint} className="admin-reports__btn admin-reports__btn--print">Print</button>
          <button onClick={handleExport} className="admin-reports__btn admin-reports__btn--export">Export</button>
        </div>

        <div className="admin-reports__filter">
          <input
            type="text"
            placeholder="Search by name, ID, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="admin-reports__search"
          />
          <select value={selectedCashier} onChange={(e) => setSelectedCashier(e.target.value)} className="admin-reports__dropdown">
            {uniqueCashiers.map((cashier, idx) => (
              <option key={idx} value={cashier}>{cashier === 'All' ? 'All Cashiers' : cashier}</option>
            ))}
          </select>
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="admin-reports__dropdown">
            <option value="All">All Classes</option>
            {classList.map((cls, idx) => (
              <option key={idx} value={cls}>{cls}</option>
            ))}
          </select>
          <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} className="admin-reports__dropdown">
            <option value="All">All Locations</option>
            {uniqueLocations.map((loc, idx) => (
              <option key={idx} value={loc}>{loc}</option>
            ))}
          </select>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="admin-reports__dropdown"
          />
        </div>

        {loading ? (
          <div className="admin-reports__loading">Loading...</div>
        ) : (
          <div>
            <div className="admin-reports__summary">
              <strong>Total Amount Collected: GHS {totalAmount.toFixed(2)}</strong>
            </div>

            <table className="admin-reports__table">
              <thead>
                <tr>
                  <th>SN</th>
                  <th>Trans-ID</th>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Class</th>
                  <th>Location</th>
                  <th>Direction</th>
                  <th>Amount Paid</th>
                  <th>Payment Date</th>
                  <th>Cashier</th>
                  <th>Reference</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item, index) => (
                  <tr key={item._id}>
                    <td>{indexOfFirstItem + index + 1}</td>
                    <td>{item.trans_id}</td>
                    <td>{item.student_id}</td>
                    <td>{item.first_name} {item.last_name}</td>
                    <td>{item.class}</td>
                    <td>{item.location_name}</td>
                    <td>{item.direction}</td>
                    <td>GHS {item.amountPaid}</td>
                    <td>{new Date(item.paymentDate).toLocaleDateString('en-US')}</td>
                    <td>{item.cashier}</td>
                    <td>{item.reference}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="admin-reports__pagination">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>Previous</button>
              <span>Page {currentPage} of {totalPages}</span>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReportPage;
