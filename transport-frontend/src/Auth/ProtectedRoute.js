// src/Auth/ProtectedRoute.js
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem("token");

  // If no token, force login
  if (!token) {
    return <Navigate to="/" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const userRole = decoded.role;

    // Check if role is allowed
    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/unauthorized" replace />;
    }

    // All good — show route
    return <Outlet />;
  } catch (err) {
    // If token is invalid, force re-login
    return <Navigate to="/" replace />;
  }
};

export default ProtectedRoute;
