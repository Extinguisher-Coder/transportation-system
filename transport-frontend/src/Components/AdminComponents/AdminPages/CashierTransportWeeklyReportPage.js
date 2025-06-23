import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import "./CashierTransportWeeklyReportPage.css";

const CashierTransportWeeklyReportPage = () => {
  const [terms, setTerms] = useState([]);
  const [termName, setTermName] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const reportRef = useRef();

  useEffect(() => {
    fetchTerms();
  }, []);

  useEffect(() => {
    if (termName) fetchSummary();
  }, [termName]);

  const fetchTerms = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_API_URL}/terms`);
      const termsData = await response.json();
      setTerms(termsData);
      if (termsData.length > 0) setTermName(termsData[0].termName);
    } catch (error) {
      console.error("Error fetching terms:", error);
    }
  };

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.REACT_APP_BACKEND_API_URL}/cashier-transport-summary/weekly?termName=${termName}`
      );
      setData(res.data.summary);
    } catch (err) {
      console.error("Error fetching summary:", err);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const rows = [];

    data.forEach((cashierData) => {
      const { cashier, weeks } = cashierData;
      Object.entries(weeks).forEach(([weekLabel, weekData]) => {
        rows.push({
          Cashier: cashier,
          Week: weekLabel,
          "Date Range": weekData.dateRange || "",
          Recorded: weekData.recorded,
          Accounted: weekData.accounted,
          Difference: weekData.difference,
          Status: weekData.status,
        });
      });
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transport Cashier Weekly");
    XLSX.writeFile(wb, `TransportCashierWeeklySummary_${termName}.xlsx`);
  };

  const printReport = () => {
    const printContent = reportRef.current.innerHTML;
    const logoUrl = `${process.env.PUBLIC_URL}/logo-rmbg.png`;

    const printWindow = window.open("", "", "width=900,height=650");
    printWindow.document.write(`
      <html>
        <head>
          <title>Transport Cashier Weekly Summary</title>
          <style>
            body { font-family: Poppins, sans-serif; padding: 20px; }
            h1, h2, h3 { margin: 5px 0; text-align: center; }
            .logo-header { text-align: center; margin-bottom: 20px; }
            .logo-header img { height: 60px; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
            th { background-color: #f4f4f4; }
          </style>
        </head>
        <body>
          <div class="logo-header">
            <img src="${logoUrl}" alt="School Logo" />
            <h1>Westside Educational Complex</h1>
            <h2>Transport Fees Management System</h2>
            <h3>Cashier Weekly Summary Report (${termName})</h3>
          </div>
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const calculateStats = (weeks) => {
    let totalRecorded = 0;
    let totalAccounted = 0;

    Object.values(weeks).forEach((week) => {
      totalRecorded += week.recorded || 0;
      totalAccounted += week.accounted || 0;
    });

    const difference = totalAccounted - totalRecorded;
    let status = "Balanced";
    if (difference < 0) status = "Unbalanced";
    else if (difference > 0) status = "Over Balanced";

    return { totalRecorded, totalAccounted, difference, status };
  };

  return (
    <div className="cashier-transport-weekly-report">
      <h2>Transport Cashier Weekly Summary</h2>

      <div className="top-bar">
        <select value={termName} onChange={(e) => setTermName(e.target.value)}>
          {terms.map((term, i) => (
            <option key={i} value={term.termName}>
              {term.termName}
            </option>
          ))}
        </select>

        <button onClick={exportToExcel}>Export to Excel</button>
        <button onClick={printReport}>Print</button>
      </div>

      <div ref={reportRef}>
        {loading ? (
          <div className="loader-container">
            <div className="spinner"></div>
            <p>Loading report...</p>
          </div>
        ) : (
          data.map((cashierData, idx) => {
            const { totalRecorded, totalAccounted, difference, status } = calculateStats(
              cashierData.weeks
            );

            return (
              <div key={idx} className="cashier-card">
                <h3>
                  Cashier:&nbsp;{cashierData.cashier}&nbsp;&nbsp;&nbsp;&nbsp;
                  Overall Status:&nbsp;
                  <span className={`status-badge ${status.toLowerCase().replace(" ", "-")}`}>
                    {status}
                  </span>&nbsp;&nbsp;&nbsp;&nbsp;
                  Difference GHS:&nbsp;
                  <span style={{ fontWeight: "bold" }}>{difference}</span>
                </h3>

                <table>
                  <thead>
                    <tr>
                      <th>Week</th>
                      <th>Date Range</th>
                      <th>Recorded (GHS)</th>
                      <th>Accounted (GHS)</th>
                      <th>Difference</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(cashierData.weeks).map(([weekLabel, stats], index) => (
                      <tr key={index}>
                        <td>{weekLabel}</td>
                        <td>{stats.dateRange || "-"}</td>
                        <td>{stats.recorded}</td>
                        <td>{stats.accounted}</td>
                        <td>{stats.difference}</td>
                        <td>
                          <span
                            className={`status-badge ${stats.status.toLowerCase().replace(" ", "-")}`}
                          >
                            {stats.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    <tr style={{ fontWeight: "bold", backgroundColor: "#f9f9f9" }}>
                      <td colSpan={2}>Total</td>
                      <td>{totalRecorded}</td>
                      <td>{totalAccounted}</td>
                      <td>{difference}</td>
                      <td>{status}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CashierTransportWeeklyReportPage;
