import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { printTableWithHeader } from "../../../utils/printUtils";
import "./WeeklyReportPageV2.css";

const WeeklyReportPageV2 = () => {
  const [weeklyData, setWeeklyData] = useState([]);
  const [terms, setTerms] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClassLevel, setSelectedClassLevel] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedDirection, setSelectedDirection] = useState("All Directions");
  const [locations, setLocations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const paymentsPerPage = 20;

  const classOptions = [
    "All Classes", "Year 1A", "Year 1B", "Year 2A", "Year 2B",
    "Year 3A", "Year 3B", "Year 4A", "Year 4B", "Year 5A", "Year 5B",
    "Year 6", "Year 7", "Year 8", "GC 1", "GC 2", "GC 3",
    "TT A", "TT B", "TT C", "TT D", "BB A", "BB B", "BB C",
    "RS A", "RS B", "RS C", "KKJ A", "KKJ B", "KKJ C", "KKS A", "KKS B"
  ];

  const directionOptions = ["All Directions", "in", "out", "in_out"];

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/terms`);
        if (Array.isArray(data)) {
          setTerms(data);
          if (data.length > 0) setSelectedTerm(data[0]);
        }
      } catch (error) {
        console.error("Error fetching terms:", error);
      }
    };

    const fetchLocations = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/locations`);
        setLocations(['All Locations', ...res.data.map(loc => loc.location_name)]);
      } catch (err) {
        console.error("Error fetching locations:", err);
      }
    };

    fetchTerms();
    fetchLocations();
  }, []);

  useEffect(() => {
    if (!selectedTerm) return;

    const fetchWeeklyPayments = async () => {
      setIsLoading(true);
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_BACKEND_API_URL}/payments/all`,
          { params: { termName: selectedTerm.termName } }
        );

        if (Array.isArray(data.payments)) {
          const flattened = data.payments.map((item) => {
            const weeks = item.weeks || {};
            const flatWeeks = {};
            for (let i = 1; i <= (selectedTerm?.numberOfWeeks || 18); i++) {
              flatWeeks[`week${i}`] = weeks[`week${i}`] ?? 0;
            }

            return {
              student_id: item.student_id,
              first_name: item.first_name,
              last_name: item.last_name,
              class: item.class,
              location_name: item.location_name,
              direction: item.direction,
              termName: item.termName,
              weekly_fee: item.weekly_fee ?? 0,
              ...flatWeeks,
            };
          });

          setWeeklyData(flattened);
        } else {
          setWeeklyData([]);
        }

        setCurrentPage(1);
      } catch (error) {
        console.error("Error fetching weekly payments:", error);
        setWeeklyData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeeklyPayments();
  }, [selectedTerm]);

  const filteredData = weeklyData.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      (p.student_id?.toLowerCase().includes(term) ||
        p.first_name?.toLowerCase().includes(term) ||
        p.last_name?.toLowerCase().includes(term) ||
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(term) ||
        p.class?.toLowerCase().includes(term) ||
        p.termName?.toLowerCase().includes(term)) &&
      (selectedClassLevel === "" || selectedClassLevel === "All Classes" || p.class === selectedClassLevel) &&
      (selectedLocation === "All Locations" || p.location_name === selectedLocation) &&
      (selectedDirection === "All Directions" || p.direction === selectedDirection)
    );
  });

  const indexOfLast = currentPage * paymentsPerPage;
  const currentPayments = filteredData.slice(indexOfLast - paymentsPerPage, indexOfLast);
  const totalPages = Math.ceil(filteredData.length / paymentsPerPage);

  const handleExport = () => {
    const exportData = filteredData.map((p, i) => {
      const row = {
        SN: i + 1,
        StudentID: p.student_id,
        FullName: `${p.first_name} ${p.last_name}`,
        Class: p.class,
        Location: p.location_name,
        Direction: p.direction,
        Term: p.termName,
        WeeklyFee: p.weekly_fee,
      };
      for (let j = 1; j <= (selectedTerm?.numberOfWeeks || 18); j++) {
        row[`W${j}`] = p[`week${j}`] ?? 0;
      }
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "WeeklyReport");
    XLSX.writeFile(workbook, `Weekly_Report_${selectedTerm?.termName}.xlsx`);
  };

  const handlePrint = () => {
    const columns = [
      { label: "SN", key: "sn" },
      { label: "Student ID", key: "student_id" },
      { label: "Full Name", key: "fullName" },
      { label: "Class", key: "class" },
      { label: "Location", key: "location_name" },
      { label: "Direction", key: "direction" },
      { label: "Term", key: "termName" },
      { label: "Weekly Fee", key: "weekly_fee" },
      ...Array.from({ length: selectedTerm?.numberOfWeeks || 18 }, (_, i) => ({
        label: `W${i + 1}`,
        key: `week${i + 1}`
      }))
    ];

    const rows = filteredData.map((p, i) => {
      const row = {
        sn: i + 1,
        student_id: p.student_id,
        fullName: `${p.first_name} ${p.last_name}`,
        class: p.class,
        location_name: p.location_name,
        direction: p.direction,
        termName: p.termName,
        weekly_fee: p.weekly_fee,
      };
      for (let j = 1; j <= (selectedTerm?.numberOfWeeks || 18); j++) {
        row[`week${j}`] = p[`week${j}`] ?? 0;
      }
      return row;
    });

    printTableWithHeader({
      title: `Weekly Payment Report - ${selectedTerm?.termName}`,
      columns,
      rows
    });
  };

  const getCellColor = (value, weeklyFee) => {
    if (value === "Omitted") return "wk-brown-cell";
    if (value === "Absent") return "wk-blue-cell";
    const numericValue = Number(value);
    if (!isNaN(numericValue) && numericValue > 0) {
      return numericValue % weeklyFee === 0 ? "wk-green-cell" : "wk-yellow-cell";
    }
    return "wk-red-cell";
  };

  return (
    <div className="wk-print-wrapper">
      <div className="wk-report-container">
        <h1 className="wk-title">Weekly Transport Payment Report</h1>

        <div className="wk-controls no-print">
          <select className="wk-term-dropdown" onChange={(e) => setSelectedTerm(terms.find((t) => t.termName === e.target.value))} value={selectedTerm?.termName || ""}>
            {terms.map((term) => <option key={term._id} value={term.termName}>{term.termName}</option>)}
          </select>

          <select className="wk-class-dropdown" value={selectedClassLevel} onChange={(e) => setSelectedClassLevel(e.target.value)}>
            {classOptions.map((cls) => <option key={cls} value={cls}>{cls}</option>)}
          </select>

          <select className="wk-location-dropdown" value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)}>
            {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
          </select>

          <select className="wk-direction-dropdown" value={selectedDirection} onChange={(e) => setSelectedDirection(e.target.value)}>
            {directionOptions.map(dir => <option key={dir} value={dir}>{dir}</option>)}
          </select>

          <input type="text" className="wk-search" placeholder="Search by ID, name, class or term" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        {isLoading ? (
          <p className="wk-loading">Loading...</p>
        ) : (
          <table className="wk-table">
            <thead>
              <tr>
                <th>SN</th>
                <th>Student ID</th>
                <th>Full Name</th>
                <th>Class</th>
                <th>Location</th>
                <th>Direction</th>
                <th>Term</th>
                <th>Weekly Fee</th>
                {Array.from({ length: selectedTerm?.numberOfWeeks || 18 }, (_, i) => (
                  <th key={i}>W{i + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentPayments.length > 0 ? (
                currentPayments.map((p, i) => (
                  <tr key={p.student_id + i}>
                    <td>{(currentPage - 1) * paymentsPerPage + i + 1}</td>
                    <td>{p.student_id}</td>
                    <td>{`${p.first_name} ${p.last_name}`}</td>
                    <td>{p.class}</td>
                    <td>{p.location_name}</td>
                    <td>{p.direction}</td>
                    <td>{p.termName}</td>
                    <td>{p.weekly_fee}</td>
                    {Array.from({ length: selectedTerm?.numberOfWeeks || 18 }, (_, j) => (
                      <td key={j} className={getCellColor(p[`week${j + 1}`], p.weekly_fee)}>
                        {p[`week${j + 1}`] ?? 0}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="100%">No data found</td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        <div className="wk-footer">
          <div className="wk-pagination">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</button>
            <span>Page {currentPage} of {totalPages}</span>
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</button>
          </div>

          <div className="wk-buttons">
            <button onClick={handlePrint}>Print</button>
            <button onClick={handleExport}>Export</button>
            <button onClick={() => window.history.back()}>Back</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyReportPageV2;
