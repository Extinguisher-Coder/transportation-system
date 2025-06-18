import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './AdminDashboardPage.css';
import Logo1 from '../../Assets/images/bus1.jpg';
import Logo2 from '../../Assets/images/bus2.jpg';
import Logo3 from '../../Assets/images/bus3.jpg';
import Logo4 from '../../Assets/images/bus4.jpg';
import Logo5 from '../../Assets/images/bus5.jpg';


import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboardPage = () => {
  const [serverDate, setServerDate] = useState('');
  const [totalStudents, setTotalStudents] = useState(0);
  const [todaysCollection, setTodaysCollection] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentTerm, setCurrentTerm] = useState('');
  const [numberOfWeeks, setNumberOfWeeks] = useState(0);
  const [expectedCollection, setExpectedCollection] = useState(0);
  const [grandTotalCollection, setGrandTotalCollection] = useState(0);
  const [totalWeeklyFee, setTotalWeeklyFee] = useState(0);


  const [chartData, setChartData] = useState(null);
  const [user, setUser] = useState({ fullName: 'User', role: 'Staff' });
  const [currentImage, setCurrentImage] = useState(0);

  const navigate = useNavigate();
  const imageList = [Logo1, Logo2, Logo3, Logo4, Logo5];

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token) {
      try {
        const decoded = jwtDecode(token);
        let fullName = 'User';
        let role = decoded.role || 'Staff';

        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          fullName = parsedUser.fullName || fullName;
          role = parsedUser.role || role;
        }

        setUser({ fullName, role });
      } catch (error) {
        console.error('Invalid token:', error);
        setUser({ fullName: 'User', role: 'Staff' });
      }
    }

    fetchServerDate();
    fetchCurrentTerm();
    fetchTotalStudents();
    fetchTodaysCollection();
    fetchTotalUsers();
    fetchGrandTotalCollection();
    fetchTotalWeeklyFee();

    
  }, []);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/payment-histories/by-location`);
          const data = res.data;
          const labels = data.map(entry => entry.locationName);
          const values = data.map(entry => entry.totalCollected);

         setChartData({
  labels,
  datasets: [
    {
      label: 'Total Collection by Location (GHS)',
      data: values,
      backgroundColor: 'rgba(255, 216, 0, 0.8)', 
      borderColor: 'rgba(255, 216, 0, 1)',
      borderWidth: 1,
    },
  ],
});

    
      } catch (error) {
        console.error('Error fetching chart data:', error);
      }
    };
    fetchChartData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage(prev => (prev + 1) % imageList.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchServerDate = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/time`);
      const formatted = new Date(res.data.serverDate).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      });
      setServerDate(formatted);
    } catch (error) {
      console.error('Error fetching server date:', error);
    }
  };


  const fetchTotalWeeklyFee = async () => {
  try {
    const res = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/payments/total/weekly-fee`);
    setTotalWeeklyFee(res.data.totalWeeklyFee);
  } catch (error) {
    console.error('Error fetching total weekly fee:', error);
  }
};



  const fetchCurrentTerm = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/terms/current`);
      setCurrentTerm(res.data.termName || 'No Current Term');
      setNumberOfWeeks(res.data.numberOfWeeks || 0);
    } catch (error) {
      console.error('Error fetching current term:', error);
    }
  };

  const fetchTotalStudents = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/students/total/count`);
      setTotalStudents(res.data.totalStudents);
    } catch (error) {
      console.error('Error fetching total students:', error);
    }
  };

  const fetchTodaysCollection = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/payment-histories/today-total`);
      setTodaysCollection(res.data.totalCollection || 0);
    } catch (error) {
      console.error("Error fetching today's collection:", error);
    }
  };

 

  const fetchGrandTotalCollection = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/payments/total/amount-paid`);
      setGrandTotalCollection(res.data.totalAmountPaid);
    } catch (error) {
      console.error('Error fetching grand total collection:', error);
    }
  };

  const fetchTotalUsers = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/users/count`);
      setTotalUsers(res.data.totalUsers || 0);
    } catch (error) {
      console.error('Error fetching total users:', error);
    }
  };

  useEffect(() => {
  if (numberOfWeeks && totalWeeklyFee) {
    setExpectedCollection(numberOfWeeks * totalWeeklyFee);
  }
}, [numberOfWeeks, totalWeeklyFee]);


  return (
    <div className="dash-admin-dashboard">
      <div className="dash-top-bar">
        <div>Welcome: {user.fullName}</div>
        <div>Role: {user.role}</div>
        <div>Date: {serverDate}</div>
      </div>

      <div className="dash-slideshow">
        <img src={imageList[currentImage]} alt="slide" className="dash-slideshow-image" />
      </div>

      <h1 className="dash-dashboard-title">Main Dashboard</h1>

       <div className="dash-report-buttons">
  <button
    className="btn"
    onClick={() => {
      if (user.role === 'Admin') navigate('/admin/today');
      else if (user.role === 'Cashier') navigate('/cashier/today');
      else if (user.role === 'Accountant') navigate('/accountant/today');
    }}
  >
    Daily Payment Report
  </button>

  <button
    className="btn"
    onClick={() => {
      if (user.role === 'Admin') navigate('/admin/weekly');
      else if (user.role === 'Cashier') navigate('/cashier/weekly');
      else if (user.role === 'Accountant') navigate('/accountant/weekly');
    }}
  >
    Weekly Payment Report
  </button>

  <button
    className="btn"
    onClick={() => {
      if (user.role === 'Admin') navigate('/admin/unpaid');
      else if (user.role === 'Cashier') navigate('/cashier/unpaid');
      else if (user.role === 'Accountant') navigate('/accountant/unpaid');
    }}
  >
    Weekly Unpaid Students
  </button>
</div>


      <div className="dash-main-content">
        <div className="dash-left-column">
          <div className="dash-stats-cards">
            <div className="dash-card"><p>Current Term</p><h2>{currentTerm}</h2></div>
            <div className="dash-card"><p>Total Students</p><h2>{totalStudents}</h2></div>
            <div className="dash-card"><p>Expected Amount</p><h2>GHS: {expectedCollection}</h2></div>
            <div className="dash-card"><p>Collected So Far</p><h2>GHS: {grandTotalCollection}</h2></div>
            <div className="dash-card"><p>Today's Total Collection</p><h2>GHS: {todaysCollection}</h2></div>
            <div className="dash-card"><p>Total Users</p><h2>{totalUsers}</h2></div>
          </div>

          <div className="dash-chart-container">
            {chartData ? (
              <Bar
                data={chartData}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            ) : (
              <p className="dash-loading-text">Loading chart...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
