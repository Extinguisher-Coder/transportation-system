import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import "./AccountantDashboardLayout.css";
import Logo from "../../Assets/images/logo.png";
import { logout } from "../../../utils/logout";

import DashboardIcon from "../../Assets/icons/dashboard.png";
import PaymentsIcon from "../../Assets/icons/payments.png";
import ReportsIcon from "../../Assets/icons/reports.png";
import LogoutIcon from "../../Assets/icons/logout.png";
import SummaryIcon from "../../Assets/icons/summary.png";
import BalanceIcon from "../../Assets/icons/balance.png";
import MomoIcon from "../../Assets/icons/momo.png";
import ChangePassword from '../../Assets/icons/change-password.png';

import { FaBars, FaTimes } from "react-icons/fa";

const AccountantDashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="accountant-grid-container">
      {/* Top Navbar */}
      <div className="accountant-top-navbar">
        <div className="accountant-navbar-toggle">
          {isSidebarOpen ? (
            <FaTimes
              className="accountant-menu-toggle"
              onClick={toggleSidebar}
              aria-label="Close menu"
            />
          ) : (
            <FaBars
              className="accountant-menu-toggle"
              onClick={toggleSidebar}
              aria-label="Open menu"
            />
          )}
        </div>
        <div className="accountant-navbar-title"> Transport Fees Management System</div>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div className="accountant-sidebar-overlay" onClick={closeSidebar}></div>
      )}

      {/* Sidebar */}
      <div className={`accountant-sidebar ${isSidebarOpen ? "open" : ""}`}>
        <img src={Logo} alt="Logo" className="accountant-sidebar-logo" />
        <nav className="accountant-sidebar-nav">

          <NavLink to="/accountant/dashboard" className={({ isActive }) => (isActive ? "active" : "")} onClick={closeSidebar}>
            <img src={DashboardIcon} alt="Dashboard" className="nav-img" /> Dashboard
          </NavLink>

          <NavLink to="/accountant/payments" className={({ isActive }) => (isActive ? "active" : "")} onClick={closeSidebar}>
            <img src={PaymentsIcon} alt="Payments" className="nav-img" /> Cash Payments
          </NavLink>

          <NavLink to="/accountant/momo" className={({ isActive }) => (isActive ? "active" : "")} onClick={closeSidebar}>
            <img src={MomoIcon} alt="MomoIcon" className="nav-img" /> Momo Payments
          </NavLink>

          <NavLink to="/accountant/reports" className={({ isActive }) => (isActive ? "active" : "")} onClick={closeSidebar}>
            <img src={ReportsIcon} alt="Reports" className="nav-img" /> Reports
          </NavLink>

          <NavLink to="/accountant/balancing" className={({ isActive }) => (isActive ? "active" : "")} onClick={closeSidebar}>
            <img src={BalanceIcon} alt="BalanceIcon" className="nav-img" /> Cash Balancing
          </NavLink>

          <NavLink to="/accountant/summary" className={({ isActive }) => (isActive ? "active" : "")} onClick={closeSidebar}>
            <img src={SummaryIcon} alt="Summary" className="nav-img" /> Weekly Summary
          </NavLink>


            <NavLink
                        to="/accountant/change-password"
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
      <div className="accountant-main-content">
        <Outlet />
      </div>
    </div>
  );
};

export default AccountantDashboardLayout;
