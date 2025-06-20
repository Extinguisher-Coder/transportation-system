import React, { useState, useEffect } from 'react';
import './AdminStudentsPage.css';
import axios from 'axios';
import AddStudentForm from './AddStudentForm';
import StudentDetailView from './StudentDetailView';
import * as XLSX from 'xlsx';
import { printTableWithHeader } from '../../../utils/printUtils';

const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URL;

const classOptions = [
  'All Classes', 'Year 1A', 'Year 1B', 'Year 2A', 'Year 2B', 'Year 3A', 'Year 3B',
  'Year 4A', 'Year 4B', 'Year 5A', 'Year 5B', 'Year 6', 'Year 7', 'Year 8', 'GC 1', 'GC 2', 'GC 3',
  'TT A', 'TT B', 'TT C', 'TT D', 'BB A', 'BB B', 'BB C', 'RS A', 'RS B', 'RS C',
  'KKJ A', 'KKJ B', 'KKJ C', 'KKS A', 'KKS B'
];

const AdminStudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('All Classes');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [selectedDirection, setSelectedDirection] = useState('All Directions');
  const [locations, setLocations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [viewStudent, setViewStudent] = useState(null);

  const studentsPerPage = 10;

  useEffect(() => {
    fetchStudents();
    fetchLocations();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/students`);
      setStudents(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch students:', err);
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/locations`);
      setLocations(['All Locations', ...res.data.map(loc => loc.location_name)]);
    } catch (err) {
      console.error('Failed to fetch locations:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await axios.delete(`${API_BASE_URL}/students/${id}`);
        fetchStudents();
        alert('Student deleted successfully.');
      } catch (err) {
        console.error('Failed to delete student:', err);
      }
    }
  };

  const handleEdit = (student) => {
    setEditStudent(student);
    setShowAddForm(true);
  };

  const handleView = (student) => {
    setViewStudent(student);
  };

  const handleStudentAddedOrEdited = () => {
    fetchStudents();
    setShowAddForm(false);
    setEditStudent(null);
  };

        const filteredStudents = students.filter(student => {
  const nameMatch = `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
  const classMatch = selectedClass === 'All Classes' || student.class === selectedClass;
  const locationMatch = selectedLocation === 'All Locations' || student.location_name === selectedLocation;
  const directionMatch = selectedDirection === 'All Directions' || student.direction === selectedDirection;
  return nameMatch && classMatch && locationMatch && directionMatch;
});


  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

 const handlePrint = () => {
  printTableWithHeader({
    title: "Student List",
    columns: [
      { key: "sn", label: "SN" },
      { key: "student_id", label: "Student ID" },
      { key: "name", label: "Name" },
      { key: "class", label: "Class" },
      { key: "location_name", label: "Location" },
      { key: "direction", label: "Direction" },
      { key: "weekly_fee", label: "Weekly Fee" },
    ],
    rows: filteredStudents.map((student, index) => ({
      sn: index + 1,
      student_id: student.student_id,
      name: `${student.first_name} ${student.last_name}`,
      class: student.class,
      location_name: student.location_name,
      direction: student.direction,
      weekly_fee: student.weekly_fee ?? 'N/A',
    })),
  });
};


  const handleExportExcel = () => {
    const dataForExcel = filteredStudents.map((student, index) => ({
      SN: index + 1,
      "Student ID": student.student_id,
      Name: `${student.first_name} ${student.last_name}`,
      Class: student.class,
      Location: student.location_name,
      Direction: student.direction,
      "Weekly Fee": student.weekly_fee ?? '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    XLSX.writeFile(workbook, "students_export.xlsx");
  };

  return (
    <div className="admin-students">
      <h1 className="title">Admin - Student Management</h1>

      <div className="controls">
        <button className="btn primary" onClick={() => { setShowAddForm(true); setEditStudent(null); }}>
          Add Student
        </button>
        <button className="btn secondary" onClick={handlePrint}>🖨️ Print Student List</button>
        <button className="btn secondary" onClick={handleExportExcel}>📤 Export to Excel</button>
      </div>

      <div className="filters">
        <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
          {classOptions.map(cls => (
            <option key={cls} value={cls}>{cls}</option>
          ))}
        </select>

        <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)}>
          {locations.map(loc => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
             <select value={selectedDirection} onChange={(e) => setSelectedDirection(e.target.value)}>
                <option value="All Directions">All Directions</option>
                <option value="in">In</option>
                <option value="out">Out</option>
                <option value="in_out">In & Out</option>
              </select>

        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="loading">Loading students...</p>
      ) : (
        <table className="students-table">
          <thead>
            <tr>
              <th>SN</th>
              <th>Student ID</th>
              <th>Name</th>
              <th>Class</th>
              <th>Location</th>
              <th>Direction</th>
              <th>Weekly Fee</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentStudents.map((student, index) => (
              <tr key={student._id}>
                <td>{indexOfFirstStudent + index + 1}</td>
                <td>{student.student_id}</td>
                <td>{student.first_name} {student.last_name}</td>
                <td>{student.class}</td>
                <td>{student.location_name}</td>
                <td>{student.direction}</td>
                <td>{student.weekly_fee ?? 'N/A'}</td>
                <td className="actions">
                  <button className="btn small" onClick={() => handleView(student)}>View</button>
                  <button className="btn small" onClick={() => handleEdit(student)}>Edit</button>
                  <button className="btn small danger" onClick={() => handleDelete(student._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="pagination">
        <button className="btn small" onClick={handlePrevPage} disabled={currentPage === 1}>Previous</button>
        <span>Page {currentPage} of {totalPages}</span>
        <button className="btn small" onClick={handleNextPage} disabled={currentPage === totalPages}>Next</button>
      </div>

      {showAddForm && (
        <AddStudentForm
          onClose={() => { setShowAddForm(false); setEditStudent(null); }}
          onStudentAdded={handleStudentAddedOrEdited}
          initialData={editStudent}
        />
      )}

      {viewStudent && (
        <StudentDetailView
          student={viewStudent}
          onClose={() => setViewStudent(null)}
        />
      )}
    </div>
  );
};

export default AdminStudentsPage;
