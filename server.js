const express = require('express');
const connectDB = require('./config/db');
const authRouters = require('./routers/authRouters');
const contactRoutes = require('./routers/contactRoutes');
const appointmentRouters = require('./routers/appointmentRouters');
const pharmacyRoutes = require('./routers/pharmacyRoutes');
const departmentRouter = require('./routers/departmentRouter');
const inventoryRoutes = require('./routers/inventoryRoutes');
const prescriptionRoutes = require('./routers/prescriptionRoutes');
const diagnosisRoutes = require('./routers/diagnosisRoutes');
const invoiceRoutes = require('./routers/invoiceRoutes');
const paymentRouter = require('./routers/paymentRouter');
const vitalsRoutes = require('./routers/vitalsRoutes');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const ErrorMiddleware = require('./middleware/error');

dotenv.config(); // Load environment variables

const app = express();

// Connect to database
connectDB();

// Middleware to parse JSON and URL-encoded data
app.use(express.json({ limit: '50mb' })); // Include a size limit
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// CORS configuration
app.use(
  cors({
    origin: ["http://localhost:5173", "https://ojhospital.vercel.app"], // Frontend URLs
    allowedHeaders: ["Content-Type", "Authorization", "Cache-Control"], // Ensure correct headers
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], // Allowed methods
    credentials: true, // Allow credentials (cookies)
  })
);

// Routes
app.use('/user', authRouters);
app.use('/contact', contactRoutes);
app.use('/appointment', appointmentRouters);
app.use('/pharmacy', pharmacyRoutes);
app.use('/department', departmentRouter);
app.use('/inventory', inventoryRoutes);
app.use('/prescription', prescriptionRoutes);
app.use('/diagnosis', diagnosisRoutes);
app.use('/invoice', invoiceRoutes);
app.use('/payment', paymentRouter);
app.use('/vitals', vitalsRoutes);

// Debugging middleware to log incoming requests
app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.originalUrl}`);
  console.log('Cookies:', req.cookies);
  next();
});

// Error handling middleware
app.use(ErrorMiddleware);

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
