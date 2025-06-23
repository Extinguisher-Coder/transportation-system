import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AbsenteeismPage.css';
import AbsenteeismForm from './AbsenteeismForm';
import MarkAllStudentsForm from './MarkAllStudentsForm';

const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URL;

const AbsenteeismPage = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 20;

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showAbsenteeForm, setShowAbsenteeForm] = useState(false);
  const [markAllMode, setMarkAllMode] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
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
      const response = await axios.get(`${API_BASE_URL}/students`);
      setStudents(response.data);
    } catch (err) {
      console.error('Failed to fetch students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAbsent = (student) => {
    setSelectedStudent(student);
    setMarkAllMode(false);
    setShowAbsenteeForm(true);
  };

  const handleMarkAllAbsent = () => {
    setSelectedStudent(null);
    setMarkAllMode(true);
    setShowAbsenteeForm(true);
  };

  const handleCloseForm = () => {
    setShowAbsenteeForm(false);
    setSelectedStudent(null);
    setMarkAllMode(false);
  };

  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  return (
    <div className="absentee-container">
      <div className="absentee-top-bar">
        <span className="absentee-user-name">Cashier: {currentUser?.fullName || 'N/A'}</span>

        <button
          className="absentee-btn"
          onClick={handleMarkAllAbsent}
          style={{ marginLeft: 'auto', marginRight: '10px' }}
        >
          Mark All Students
        </button>

        <button
          className="absentee-btn"
          onClick={() => window.location.href = '/admin/absentees'}
        >
          Absent List
        </button>
      </div>

      <h2 className="absentee-page-title"> Transport Absenteeism Page</h2>

      <div className="absentee-controls">
        <input
          type="text"
          placeholder="Search by name or student ID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {showAbsenteeForm && (
        <div className="absentee-form-wrapper">
          {markAllMode ? (
            <MarkAllStudentsForm
              cashier={currentUser?.fullName || 'Unknown'}
              onClose={handleCloseForm}
            />
          ) : (
            <AbsenteeismForm
              student={selectedStudent}
              allStudents={false}
              cashier={currentUser?.fullName || 'Unknown'}
              onClose={handleCloseForm}
            />
          )}
        </div>
      )}

      {loading ? (
        <div className="absentee-loading-bar">Loading students...</div>
      ) : (
        <>
          <table className="absentee-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Full Name</th>
                <th>Class</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentStudents.map((student) => (
                <tr key={student._id}>
                  <td data-label="Student ID">{student.student_id}</td>
                  <td data-label="Full Name">{student.first_name} {student.last_name}</td>
                  <td data-label="Class">{student.class}</td>
                  <td data-label="Actions">
                    <button className="absentee-btn" onClick={() => handleMarkAbsent(student)}>
                      Mark Absent
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="absentee-pagination">
            <button
              className="absentee-page-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            >
              Previous
            </button>

            <span className="absentee-page-info">
              Page {currentPage} of {totalPages}
            </span>

            <button
              className="absentee-page-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AbsenteeismPage;
