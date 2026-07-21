const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Connect Database
connectDB();

const app = express();

// Body parser & CORS Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    app: 'MediCare Plus Backend API',
    timestamp: new Date(),
  });
});

// Mount Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/doctors', require('./src/routes/doctorRoutes'));
app.use('/api/services', require('./src/routes/serviceRoutes'));
app.use('/api/appointments', require('./src/routes/appointmentRoutes'));
app.use('/api/reports', require('./src/routes/reportRoutes'));
app.use('/api/feedback', require('./src/routes/feedbackRoutes'));
app.use('/api/messages', require('./src/routes/messageRoutes'));

// Error Middlewares
const { notFound, errorHandler } = require('./src/middleware/errorMiddleware');
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🏥 MediCare Plus Backend API Server Running!`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`====================================================`);
});
