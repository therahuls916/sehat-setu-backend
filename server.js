const express = require('express');
const dotenv = require('dotenv');
const admin = require('firebase-admin');
const connectDB = require('./config/db');

// --- Route Imports ---
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const pharmacyRoutes = require('./routes/pharmacyRoutes'); // <-- IMPORT PHARMACY ROUTES

// Load environment variables
dotenv.config();

// Initialize Firebase
const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Connect to MongoDB
connectDB();

const app = express();

// Middleware to accept JSON
app.use(express.json());

// --- ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/pharmacy', pharmacyRoutes); // <-- USE PHARMACY ROUTES

// A simple test route
app.get('/', (req, res) => {
  res.send('Welcome to the SehatSetu API!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running at: http://localhost:${PORT}`);
});