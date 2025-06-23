import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import './AbsentListPage.css';

const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URL;

const classOptions = [
  "Year 1A", "Year 1B", "Year 2A", "Year 2B",
  "Year 3A", "Year 3B", "Year 4A", "Year 4B",
  "Year 5A", "Year 5B", "Year 6A", "Year 6B",
  "JHS 1A", "JHS 1B", "JHS 2A", "JHS 2B",
  "JHS 3A", "JHS 3B"
];

const weekOptions = Array.from({ length: 20 }, (_, i) => `week${i + 1}`);

const AbsentListPage = () => {
  const [absentLogs, setAbsentLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [classFilter, setClassFilter] = useState('');
  const [weekFilter, setWeekFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  useEffect(() => {
    fetchAbsentData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [absentLogs, classFilter, weekFilter, searchTerm]);

  const fetchAbsentData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/absenteeism/absentees`);

      const formattedLogs = res.data.map(entry => ({
        studentId: entry.studentId,
        firstName: entry.firstName,
        lastName: entry.lastName,
        classLevel: entry.classLevel,
        location: entry.location,
        direction: entry.direction,
        week: entry.week,
        cashier: entry.cashier,
        markedDate: entry.markedDate
          ? new Date(entry.markedDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })
          : 'N/A',
      }));

      setAbsentLogs(formattedLogs);
    } catch (err) {
      console.error('Failed to fetch absentee logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let list = [...absentLogs];

    if (classFilter) {
      list = list.filter(item => item.classLevel === classFilter);
    }

    if (weekFilter) {
      list = list.filter(item => item.week === weekFilter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(item =>
        item.studentId?.toLowerCase().includes(term) ||
        item.firstName?.toLowerCase().includes(term) ||
        item.lastName?.toLowerCase().includes(term)
      );
    }

    setFilteredLogs(list);
    setCurrentPage(1);
  };

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filteredLogs.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredLogs.map((item, i) => ({
      SN: i + 1,
      StudentID: item.studentId,
      FirstName: item.firstName,
      LastName: item.lastName,
      Class: item.classLevel,
      Week: item.week,
      Cashier: item.cashier,
      MarkedDate: item.markedDate,
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'AbsentList');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const dataBlob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(dataBlob, 'AbsentList.xlsx');
  };

  return (
    <div className="absentee-container">
      <h2 className="absentee-page-title"> Transport Absent Students List</h2>

      {loading ? (
        <div className="absentee-loading-bar">Loading...</div>
      ) : (
        <>
          <div className="absentee-controls">
            <div className="absentee-filters">
              <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className="absentee-select">
                <option value="">All Classes</option>
                {classOptions.map(cls => <option key={cls} value={cls}>{cls}</option>)}
              </select>

              <select value={weekFilter} onChange={(e) => setWeekFilter(e.target.value)} className="absentee-select">
                <option value="">All Weeks</option>
                {weekOptions.map(week => <option key={week} value={week}>{week}</option>)}
              </select>

              <input
                type="text"
                placeholder="Search by ID or name"
                className="absentee-search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="absentee-buttons">
              <button className="absentee-btn" onClick={exportToExcel}>Export to Excel</button>
            </div>
          </div>

          <table className="absentee-table">
            <thead>
              <tr>
                <th>SN</th>
                <th>Student ID</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Class</th>
                <th>Week</th>
                <th>Cashier</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr><td colSpan="8" style={{ textAlign: 'center' }}>No absent records found.</td></tr>
              ) : (
                currentItems.map((entry, index) => (
                  <tr key={`${entry.studentId}-${entry.week}-${entry.markedDate}`}>
                    <td>{indexOfFirst + index + 1}</td>
                    <td>{entry.studentId}</td>
                    <td>{entry.firstName}</td>
                    <td>{entry.lastName}</td>
                    <td>{entry.classLevel}</td>
                    <td>{entry.week}</td>
                    <td>{entry.cashier}</td>
                    <td>{entry.markedDate}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="absentee-pagination">
              <button
                className="absentee-page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              >
                Previous
              </button>
              <span className="absentee-page-info">Page {currentPage} of {totalPages}</span>
              <button
                className="absentee-page-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AbsentListPage;
