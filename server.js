// server.js

const express = require('express');
const dotenv = require('dotenv');
const admin = require('firebase-admin');
const connectDB = require('./config/db');
const cors = require('cors'); // <-- 1. IMPORT CORS HERE

// --- Route Imports ---
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const pharmacyRoutes = require('./routes/pharmacyRoutes');

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

// --- 2. ADD CORS MIDDLEWARE CONFIGURATION HERE ---
// This must come BEFORE your routes
const corsOptions = {
  origin: 'http://localhost:3000', // Your frontend's origin
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

// A simple test route
app.get('/', (req, res) => {
  res.send('Welcome to the SehatSetu API!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running at: http://localhost:${PORT}`);
});