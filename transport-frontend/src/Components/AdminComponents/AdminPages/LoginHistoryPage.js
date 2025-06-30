import React, { useEffect, useState } from "react";
import "./LoginHistoryPage.css";

const API_URL = `${process.env.REACT_APP_BACKEND_API_URL}/login-records`;

const LoginHistoryPage = () => {
  const [records, setRecords] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLoginRecords = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch login records");
        }

        const data = await response.json();
        setRecords(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchLoginRecords();
  }, []);

  return (
    <div className="login-history-container">
      <h1>Login History</h1>
      {error ? (
        <p className="error-message">{error}</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Login Time</th>
              <th>IP Address</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, index) => (
              <tr key={record._id}>
                <td>{index + 1}</td>
                <td>{record.userId?.fullName || "N/A"}</td>
                <td>{record.email}</td>
                <td>{record.role}</td>
                  <td>
                        {new Date(record.loginTime).toLocaleString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "numeric",
                            hour12: true,
                        })}
                        </td>

                <td>{record.ipAddress}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LoginHistoryPage;
