const express = require('express');
const mongoose = require('mongoose');

const locationRoutes = require("./routes/locationRoutes");
const studentRoutes = require("./routes/studentRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const termRoutes = require('./routes/termRoutes');
const paymentHistoryRoutes = require('./routes/paymentHistoryRoutes');
const userRoutes = require('./routes/userRoutes');
const reminderRoutes = require("./routes/reminderRoutes");
const absenteeismRoutes = require('./routes/absenteeismRoutes');
const timeRoutes = require('./routes/timeRoutes');
const settingRoutes = require('./routes/settingRoutes');
const transportReconciliationRoutes = require('./routes/transportReconciliationRoutes');
const transportBalanceHistoryRoutes = require('./routes/transportBalanceHistoryRoutes');
const cashierTransportSummaryRoutes = require('./routes/cashierTransportSummaryRoutes');
const transportSummaryRoutes = require('./routes/transportSummaryRoutes');








const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use("/api/locations", locationRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/payments", paymentRoutes);
app.use('/api/terms', termRoutes);
app.use('/api/payment-histories', paymentHistoryRoutes);
app.use('/api/users', userRoutes);
app.use("/api/reminder", reminderRoutes);
app.use('/api/absenteeism', absenteeismRoutes);
app.use('/api/time', timeRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/transport-reconciliation', transportReconciliationRoutes);
app.use('/api/transport-balance-history', transportBalanceHistoryRoutes);
app.use('/api/cashier-transport-summary', cashierTransportSummaryRoutes);
app.use('/api/transport', transportSummaryRoutes);



app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
