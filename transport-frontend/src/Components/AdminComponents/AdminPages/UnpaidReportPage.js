import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import "./UnpaidReportPage.css";
import { printTableWithHeader } from "../../../utils/printUtils";

const classOptions = [
  "All Classes", "Year 1A", "Year 1B", "Year 2A", "Year 2B", "Year 3A", "Year 3B",
  "Year 4A", "Year 4B", "Year 5A", "Year 5B", "Year 6", "Year 7", "Year 8",
  "GC 1", "GC 2", "GC 3", "TT A", "TT B", "TT C", "TT D",
  "BB A", "BB B", "BB C", "RS A", "RS B", "RS C",
  "KKJ A", "KKJ B", "KKJ C", "KKS A", "KKS B"
];

const UnpaidReportPage = () => {
  const [terms, setTerms] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [unpaidData, setUnpaidData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_API_URL}/terms`);
        const data = await response.json();
        setTerms(data);
        if (data.length > 0) setSelectedTerm(data[0]);
      } catch (error) {
        console.error("Error fetching terms:", error);
      }
    };
    fetchTerms();
  }, []);

  useEffect(() => {
    if (!selectedTerm || !selectedWeek) return;
    const fetchUnpaid = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_API_URL}/payments/unpaid-up-to-week?termName=${encodeURIComponent(
            selectedTerm.termName
          )}&selectedWeek=week${selectedWeek}`
        );
        const data = await response.json();
        setUnpaidData(Array.isArray(data.records) ? data.records : []);
      } catch (error) {
        console.error("Error fetching unpaid students:", error);
        setUnpaidData([]);
      }
    };
    fetchUnpaid();
  }, [selectedTerm, selectedWeek]);

  const filteredData = unpaidData.filter((student) => {
    const matchSearch =
      student.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.class.toLowerCase().includes(searchTerm.toLowerCase());
    const matchClass =
      selectedClass && selectedClass !== "All Classes"
        ? student.class === selectedClass
        : true;
    return matchSearch && matchClass;
  });

  const handlePrint = () => {
    const title = `Unpaid Report - ${selectedTerm?.termName || ""}`;
    const summary = `Class: ${selectedClass || "All Classes"} | Week ${selectedWeek}`;
    const columns = [
      { label: "SN", key: "sn" },
      { label: "Student ID", key: "student_id" },
      { label: "Full Name", key: "full_name" },
      { label: "Class", key: "class" },
      { label: "Term", key: "termName" },
      { label: "No: of Weeks", key: "weeksOwed" },
      { label: "Amount Owed (GHS)", key: "amountOwed" },
    ];
    const rows = filteredData.map((student, index) => ({
      sn: index + 1,
      student_id: student.student_id,
      full_name: `${student.first_name} ${student.last_name}`,
      class: student.class,
      termName: student.termName,
      weeksOwed: student.weeksOwed,
      amountOwed: (student.weeksOwed * student.weekly_fee).toFixed(2),
    }));
    printTableWithHeader({ title, summary, columns, rows });
  };

  const handleExportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredData.map((student, index) => ({
        SN: index + 1,
        StudentID: student.student_id,
        FullName: `${student.first_name} ${student.last_name}`,
        Class: student.class,
        Term: student.termName,
        "No: of Weeks": student.weeksOwed,
        "Amount Owed (GHS)": student.weeksOwed * student.weekly_fee,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Unpaid Report");
    XLSX.writeFile(workbook, "Unpaid_Report.xlsx");
  };

  const handleSendReminder = async () => {
    if (filteredData.length === 0) {
      alert("No unpaid students to send reminders to.");
      return;
    }

    const payload = filteredData.map((student) => ({
      student_id: student.student_id,
      full_name: `${student.first_name} ${student.last_name}`,
       class: student.class,
      weeksOwed: student.weeksOwed,
      amountOwed: (student.weeksOwed * student.weekly_fee).toFixed(2),
    }));

    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_BACKEND_API_URL}/reminder/send-bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ students: payload }),
      });
      const result = await response.json();
      alert(result.message || "Reminder messages sent successfully.");
    } catch (error) {
      console.error("Error sending reminders:", error);
      alert("Failed to send reminder messages.");
    } finally {
      setLoading(false);
    }
  };

  const numberOfWeeks = selectedTerm?.numberOfWeeks || 18;

  return (
    <div className="unpaid-wrapper">
      <div className="unpaid-report-container">
        <header className="report-header">
          <h1 className="report-title"> Transport Unpaid Students Per Week</h1>
        </header>

        <div className="report-controls no-print">
          <select
            className="term-dropdown"
            value={selectedTerm?.termName || ""}
            onChange={(e) => {
              const term = terms.find((t) => t.termName === e.target.value);
              setSelectedTerm(term);
              setSelectedWeek(1);
            }}
          >
            {terms.map((term) => (
              <option key={term._id} value={term.termName}>{term.termName}</option>
            ))}
          </select>

          <select
            className="class-dropdown"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            {classOptions.map((className) => (
              <option key={className} value={className}>{className}</option>
            ))}
          </select>

          <select
            className="week-dropdown"
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(Number(e.target.value))}
          >
            {Array.from({ length: numberOfWeeks }, (_, i) => (
              <option key={i} value={i + 1}>Week {i + 1}</option>
            ))}
          </select>

          <button className="btn reminder-btn" onClick={handleSendReminder} disabled={loading}>
            {loading ? (
              <>
                Sending...
                <span className="spinner"></span>
              </>
            ) : (
              "Send Reminder Message"
            )}
          </button>

          <input
            type="text"
            placeholder="Search by ID or Name..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <table className="unpaid-table">
          <thead>
            <tr>
              <th>SN</th>
              <th>Student ID</th>
              <th>Full Name</th>
              <th>Class</th>
              <th>Term</th>
              <th>No: of Weeks</th>
              <th>Amount Owed (GHS)</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((student, index) => (
                <tr key={student._id}>
                  <td>{index + 1}</td>
                  <td>{student.student_id}</td>
                  <td>{`${student.first_name} ${student.last_name}`}</td>
                  <td>{student.class}</td>
                  <td>{student.termName}</td>
                  <td>{student.weeksOwed}</td>
                  <td>{(student.weeksOwed * student.weekly_fee).toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">No unpaid students found</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="button-group">
          <button className="btn print-btn" onClick={handlePrint}>Print Report</button>
          <button className="btn export-btn" onClick={handleExportToExcel}>Export to Excel</button>
          <button className="btn go-back-btn" onClick={() => window.history.back()}>Go Back</button>
        </div>
      </div>
    </div>
  );
};

export default UnpaidReportPage;
