// This MUST be at the top
const dotenv = require('dotenv');
dotenv.config();

// Core Dependencies
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const path = require('path');
const { Server } = require("socket.io");

// --- App & Server Setup ---
const app = express();
const server = http.createServer(app);

// --- Middleware ---
// Use CORS to allow requests from your frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://hive-mind-puce.vercel.app', // Default to localhost if not set
  credentials: true
}));
app.options('*', cors());
app.use(express.json());

// --- API Routes ---
const authRoutes = require('./routes/auth.routes.js');
const aiRoutes = require('./routes/ai.routes.js');
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);

// --- API Health Check ---
app.get('/', (req, res) => {
    res.json({ 
        message: 'HiveMind API is running',
        status: 'OK',
        timestamp: new Date().toISOString()
    });
});

// --- 404 Handler for API Routes ---
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: 'API endpoint not found',
        message: 'This is the HiveMind backend API. Please use the frontend at https://hive-mind-puce.vercel.app'
    });
});

// --- Socket.IO Real-time Logic ---
const io = new Server(server, { cors: { origin: "*" } });
require('./socket.js')(io); // Pass the 'io' instance to the socket handler

// --- Database & Server Start ---
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB connected successfully.');
        server.listen(PORT, () => console.log(`🚀 Server is running on http://localhost:${PORT}`));
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });
