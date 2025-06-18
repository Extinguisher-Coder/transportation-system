import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import "./RegistrarDashboardLayout.css";
import Logo from "../../Assets/images/logo.png";
import { logout } from "../../../utils/logout";

import DashboardIcon from "../../Assets/icons/dashboard.png";
import LogoutIcon from "../../Assets/icons/logout.png";
import StudentIcon from "../../Assets/icons/students.png";
import ChangePassword from '../../Assets/icons/change-password.png';

import { FaBars, FaTimes } from "react-icons/fa";

const RegistrarDashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="registrar-grid-container">
      {/* Top Navbar */}
      <div className="registrar-top-navbar">
        <div className="registrar-navbar-toggle">
          {isSidebarOpen ? (
            <FaTimes
              className="registrar-menu-toggle"
              onClick={toggleSidebar}
              aria-label="Close menu"
            />
          ) : (
            <FaBars
              className="registrar-menu-toggle"
              onClick={toggleSidebar}
              aria-label="Open menu"
            />
          )}
        </div>
        <div className="registrar-navbar-title">Transport Fees Management System</div>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div className="registrar-sidebar-overlay" onClick={closeSidebar}></div>
      )}

      {/* Sidebar */}
      <div className={`registrar-sidebar ${isSidebarOpen ? "open" : ""}`}>
        <img src={Logo} alt="Logo" className="registrar-sidebar-logo" />
        <nav className="registrar-sidebar-nav">

          <NavLink to="/registrar/dashboard" className={({ isActive }) => (isActive ? "active" : "")} onClick={closeSidebar}>
            <img src={DashboardIcon} alt="Dashboard" className="nav-img" /> Dashboard
          </NavLink>

          <NavLink to="/registrar/students" className={({ isActive }) => (isActive ? "active" : "")} onClick={closeSidebar}>
            <img src={StudentIcon} alt="StudentIcon" className="nav-img" /> Students
          </NavLink>

            <NavLink
                        to="/registrar/change-password"
                        className={({ isActive }) => (isActive ? 'active' : '')}
                        onClick={closeSidebar}
                      >
                        <img src={ChangePassword} alt="Reports" className="nav-img" /> Change Password
                      </NavLink>

          <NavLink
                      to="/"
                      className={({ isActive }) => (isActive ? "active" : "")}
                      onClick={() => {
                        closeSidebar();
                        logout(); 
                      }}
                    >
                      <img src={LogoutIcon} alt="Logout" className="nav-img" /> Logout
                    </NavLink>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="registrar-main-content">
        <Outlet />
      </div>
    </div>
  );
};

export default RegistrarDashboardLayout;
