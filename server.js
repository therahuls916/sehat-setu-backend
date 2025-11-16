// backend/server.js

const express = require('express');
const dotenv = require('dotenv');
const admin = require('firebase-admin');
const connectDB = require('./config/db');
const cors = require('cors');

// --- Route Imports ---
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const pharmacyRoutes = require('./routes/pharmacyRoutes');
const userRoutes = require('./routes/userRoutes');

// --- Error Handler Import ---
const { errorHandler } = require('./middleware/errorHandler'); // <-- 1. IMPORT THE ERROR HANDLER

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

// --- CORS MIDDLEWARE CONFIGURATION ---
const corsOptions = {
  origin: 'http://localhost:3000',
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));

// Middleware to accept JSON
app.use(express.json());

// --- ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/pharmacy', pharmacyRoutes);
app.use('/api/users', userRoutes);

// A simple test route
app.get('/', (req, res) => {
  res.send('Welcome to the SehatSetu API!');
});

// --- GLOBAL ERROR HANDLER ---
// This MUST be the last piece of middleware that app.use() calls.
app.use(errorHandler); // <-- 2. APPLY THE ERROR HANDLER

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running at: http://localhost:${PORT}`);
});