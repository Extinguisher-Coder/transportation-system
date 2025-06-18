import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";
import logo from "../Assets/images/logo-rmbg.png";

const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URL;

const LoginPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${API_BASE_URL}/users/login`, {
        email,
        password,
      });

      const { token, user } = response.data;

      // Save token & user
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Redirect based on role
      if (user.role === "Admin") navigate("/admin");
      else if (user.role === "Accountant") navigate("/accountant");
      else if (user.role === "Cashier") navigate("/cashier");
       else if (user.role === "Registrar") navigate("/registrar");
      else navigate("/unauthorized");
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className="login-page">
      <div className="overlay"></div>
      <div className="login-box">
        {/* Logo */}
        <div className="logo-container">
          <img src={logo} alt="School Logo" className="logo-image" />
        </div>

        {/* Title */}
        <h1 className="system-title">Transport Fees Management System</h1>

        {/* Subtitle */}
        <h2>Welcome Back</h2>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="Enter your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* Error Message */}
          {errorMsg && <p className="error-msg">{errorMsg}</p>}

          <button type="submit">Login</button>

          <p className="forgot">
  <a
    href="#"
    onClick={(e) => {
      e.preventDefault();
      alert("Please contact the Admin to reset your password.");
    }}
  >
    Forgot password?
  </a>
</p>

        </form>
      </div>
    </div>
  );
};

export default LoginPage;
