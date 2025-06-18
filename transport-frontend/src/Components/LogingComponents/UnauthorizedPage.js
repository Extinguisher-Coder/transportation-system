// src/Pages/UnauthorizedPage.js
import React from "react";
import { useNavigate } from "react-router-dom";
import "./UnauthorizedPage.css";

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="unauthorized-page">
      <h1>🚫 Unauthorized Access</h1>
      <p>You do not have permission to view this page.</p>
      <button onClick={() => navigate("/")}>Go Back to Login</button>
    </div>
  );
};

export default UnauthorizedPage;
