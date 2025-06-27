import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import "./AdminDashboardLayout.css";
import Logo from "../../Assets/images/logo.png";
import { logout } from "../../../utils/logout";

import DashboardIcon from "../../Assets/icons/dashboard.png";
import PaymentsIcon from "../../Assets/icons/payments.png";
import StudentsIcon from "../../Assets/icons/students.png";
import UsersIcon from "../../Assets/icons/users.png";
import ReportsIcon from "../../Assets/icons/reports.png";
import LogsIcon from "../../Assets/icons/logs.png";
import LogoutIcon from "../../Assets/icons/logout.png";
import SettingsIcon from "../../Assets/icons/settings.png";
import AbsentIcon from "../../Assets/icons/absent.png";
import SummaryIcon from "../../Assets/icons/summary.png";
import BalanceIcon from "../../Assets/icons/balance.png";
import MomoIcon from "../../Assets/icons/momo.png";
import LocationIcon from "../../Assets/icons/location.png";
import FeedIcon from "../../Assets/icons/feed.png";
import CashierIcon from "../../Assets/icons/cashier.png";

import { FaBars, FaTimes } from "react-icons/fa";

const AdminDashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="admin-grid-container">
      {/* Top Navbar */}
      <div className="top-navbar">
        <div className="navbar-toggle">
          {isSidebarOpen ? (
            <FaTimes
              className="menu-toggle"
              onClick={toggleSidebar}
              aria-label="Close menu"
            />
          ) : (
            <FaBars
              className="menu-toggle"
              onClick={toggleSidebar}
              aria-label="Open menu"
            />
          )}
        </div>
        <div className="navbar-title"> Transport Fees Management System</div>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar}></div>
      )}

      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <img src={Logo} alt="Logo" className="sidebar-logo" />
        <nav className="sidebar-nav">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={closeSidebar}
          >
            <img src={DashboardIcon} alt="Dashboard" className="nav-img" />{" "}
            Dashboard
          </NavLink>

                      <a
                      href="https://westsidefeeding.vercel.app"
                      onClick={(e) => {
                        e.preventDefault();       // Stop default navigation
                        logout(false);            // Don't redirect to "/"

                        setTimeout(() => {
                          window.location.href = "https://westsidefeeding.vercel.app"; // Now this will run
                        }, 100);
                      }}
                      className="nav-link"
                    >
                      <img src={FeedIcon} alt="FeedIcon" className="nav-imgfeed" /> Feeding System
                    </a>


          <NavLink
            to="/admin/locations"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={closeSidebar}
          >
            <img src={LocationIcon} alt="LocationIcon" className="nav-img" />{" "}
            Locations
          </NavLink>
          <NavLink
            to="/admin/students"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={closeSidebar}
          >
            <img src={StudentsIcon} alt="Students" className="nav-img" />{" "}
            Students
          </NavLink>
          <NavLink
            to="/admin/payments"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={closeSidebar}
          >
            <img src={PaymentsIcon} alt="Payments" className="nav-img" />{" "}
            Cash Payments
          </NavLink>
          <NavLink
            to="/admin/momo"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={closeSidebar}
          >
            <img src={MomoIcon} alt="MomoIcon" className="nav-img" />{" "}
            Momo Payments
          </NavLink>
          
          <NavLink
            to="/admin/reports"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={closeSidebar}
          >
            <img src={ReportsIcon} alt="Reports" className="nav-img" /> Reports
          </NavLink>
          <NavLink
            to="/admin/balancing"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={closeSidebar}
          >
            <img src={BalanceIcon} alt="BalanceIcon" className="nav-img" /> Cash Balancing
          </NavLink>
          <NavLink
            to="/admin/cashier-weekly"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={closeSidebar}
          >
            <img src={CashierIcon} alt="CashierIcon" className="nav-img" /> Cashier Weekly Balancing
          </NavLink>
          <NavLink
            to="/admin/summary"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={closeSidebar}
          >
            <img src={SummaryIcon} alt="Summary" className="nav-img" /> Weekly Summary
          </NavLink>
          <NavLink
            to="/admin/absenteeism"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={closeSidebar}
          >
            <img src={AbsentIcon} alt="Absentees" className="nav-img" /> Absenteeism
          </NavLink>
          <NavLink
            to="/admin/users"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={closeSidebar}
          >
            <img src={UsersIcon} alt="Users" className="nav-img" /> System Users
          </NavLink>
          <NavLink
            to="/admin/settings"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={closeSidebar}
          >
            <img src={SettingsIcon} alt="Users" className="nav-img" /> Settings
          </NavLink>

          <NavLink
            to="/admin/logs"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={closeSidebar}
          >
            <img src={LogsIcon} alt="Logs" className="nav-img" /> System Logs
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
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminDashboardLayout;
