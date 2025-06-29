import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './MomoPaymentPage.css';
import MakeMomoPaymentForm from './MakeMomoPaymentForm';

const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URL;

const MomoPaymentPage = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const studentsPerPage = 20;

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setCurrentUser(JSON.parse(storedUser));
    fetchStudents();
  }, []);

  useEffect(() => {
    const filtered = students.filter((s) =>
      s.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(filtered);
    setCurrentPage(1);
  }, [searchTerm, students]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/students`);
      setStudents(res.data);
    } catch (err) {
      console.error('Failed to fetch students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMakePayment = (student) => {
    setSelectedStudent(student);
    setShowPaymentForm(true);
  };

  const handleCloseForm = () => {
    setShowPaymentForm(false);
    setSelectedStudent(null);
  };

  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  return (
    <div className="momo-payment-container">
      <div className="momo-top-bar">
        <span className="momo-user-name">Cashier: {currentUser?.fullName || 'N/A'}</span>
      </div>

      <h2 className="momo-page-title"> Transport MoMo Payment Page</h2>

      <div className="momo-payment-controls">
        <input
          type="text"
          placeholder="Search by name or student ID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {showPaymentForm && selectedStudent && (
        <div className="momo-payment-form-overlay">
          <div className="momo-payment-form-content">
            <MakeMomoPaymentForm
              student={selectedStudent}
              cashier={currentUser?.fullName || 'Unknown'}
              onClose={handleCloseForm}
            />
          </div>
        </div>
      )}

      {loading ? (
        <div className="momo-loading-bar">Loading students...</div>
      ) : (
        <>
          <div className="momo-table-wrapper">
            <table className="momo-students-table">
              <thead>
                <tr>
                  <th>SN</th>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Class</th>
                  <th>Location</th>
                  <th>Direction</th>
                  <th>Weekly Fee</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentStudents.map((student, index) => (
                  <tr key={student._id}>
                    <td data-label="SN">{indexOfFirstStudent + index + 1}</td>
                    <td data-label="Student ID">{student.student_id}</td>
                    <td data-label="Name">{student.first_name} {student.last_name}</td>
                    <td data-label="Class">{student.class}</td>
                    <td data-label="Location">{student.location_name}</td>
                    <td data-label="Direction">{student.direction}</td>
                    <td data-label="Weekly Fee">GHS: {student.weekly_fee?.toFixed(2)}</td>
                    <td data-label="Action">
                      <button className="momo-pay-btn" onClick={() => handleMakePayment(student)}>
                        Make MoMo Payment
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="momo-pagination">
            <button
              className="momo-page-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              Previous
            </button>
            <span className="momo-page-info">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="momo-page-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MomoPaymentPage;
