import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import './TodayReportPage.css';
import { printTableWithHeader } from '../../../utils/printUtils';

const TodayReportPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCashier, setSelectedCashier] = useState('All');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  const classList = [
    'Year 1A', 'Year 1B', 'Year 2A', 'Year 2B', 'Year 3A', 'Year 3B',
    'Year 4A', 'Year 4B', 'Year 5A', 'Year 5B', 'Year 6', 'Year 7', 'Year 8',
    'GC 1', 'GC 2', 'GC 3', 'TT A', 'TT B', 'TT C', 'TT D',
    'BB A', 'BB B', 'BB C', 'RS A', 'RS B', 'RS C',
    'KKJ A', 'KKJ B', 'KKJ C', 'KKS A', 'KKS B'
  ];

  useEffect(() => {
    const fetchTodayData = async () => {
      setLoading(true);
      try {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/payment-histories/today`);
        const todayPayments = response.data.filter(item => {
          const dateStr = new Date(item.paymentDate).toISOString().split('T')[0];
          return dateStr === todayStr;
        });
        setData(todayPayments);
      } catch (error) {
        console.error('Error fetching today\'s data:', error);
      }
      setLoading(false);
    };
    fetchTodayData();
  }, []);

  const uniqueCashiers = ['All', ...new Set(data.map(item => item.cashier))];
 const uniqueLocations = [
  'All',
  ...new Set(
    data
      .map(item => item.location_name?.trim())
      .filter(loc => !!loc)
  )
];


  const filteredData = data.filter(item => {
    const matchesSearch =
      item.student_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.class?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCashier = selectedCashier === 'All' || item.cashier === selectedCashier;
    const matchesClass = selectedClass === 'All' || item.class === selectedClass;
    const matchesLocation = selectedLocation === 'All' || item.location_name === selectedLocation;

    return matchesSearch && matchesCashier && matchesClass && matchesLocation;
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
      "Payment Date": new Date(item.paymentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      Cashier: item.cashier,
      Reference: item.reference,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'TodayReport');
    XLSX.writeFile(workbook, 'TodayReport.xlsx');
  };

  const handlePrint = () => {
    printTableWithHeader({
      title: `Today's Payment Report`,
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
        paymentDate: new Date(item.paymentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        cashier: item.cashier,
        reference: item.reference,
      })),
    });
  };

  return (
    <div className="today-report__page">
      <div className="today-report__container">
        <header className="today-report__header">
          <h1 className="today-report__title"> Transport: Today's Payment Report</h1>
        </header>

        <div className="today-report__buttons">
          <button onClick={() => navigate(-1)} className="today-report__btn today-report__btn--today">Back</button>
          <button onClick={handlePrint} className="today-report__btn today-report__btn--print">Print</button>
          <button onClick={handleExport} className="today-report__btn today-report__btn--export">Export</button>
        </div>

        <div className="today-report__filter">
          <input
            type="text"
            placeholder="Search by ID, Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="today-report__search"
          />
          <select value={selectedCashier} onChange={(e) => setSelectedCashier(e.target.value)} className="today-report__dropdown">
            {uniqueCashiers.map((cashier, idx) => (
              <option key={idx} value={cashier}>{cashier === 'All' ? 'All Cashiers' : cashier}</option>
            ))}
          </select>
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="today-report__dropdown">
            <option value="All">All Classes</option>
            {classList.map((cls, idx) => (
              <option key={idx} value={cls}>{cls}</option>
            ))}
          </select>
          <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} className="today-report__dropdown">
            {uniqueLocations.map((loc, idx) => (
              <option key={idx} value={loc}>{loc === 'All' ? 'All Locations' : loc}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="today-report__loading">Loading...</div>
        ) : (
          <div>
            <div className="today-report__summary">
              <strong>Total Amount Collected: GHS {totalAmount.toFixed(2)}</strong>
            </div>

            <table className="today-report__table">
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
                    <td>{new Date(item.paymentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td>{item.cashier}</td>
                    <td>{item.reference}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="today-report__pagination">
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

export default TodayReportPage;
