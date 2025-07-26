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
const allowedOrigins = [
  'https://hive-mind-ai.vercel.app', // New Vercel frontend URL
  'https://hive-mind-puce.vercel.app', // Previous Vercel frontend URL
  'https://hivemind-tanmay.vercel.app', // Alternative Vercel URL
  'http://localhost:3000', // Local development
  'http://localhost:8080', // Local development
  'http://127.0.0.1:3000',  // Local development
  'http://127.0.0.1:8080'   // Local development
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or local files)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
};
app.use(cors(corsOptions));
app.use(express.json());

// --- API Routes ---
const authRoutes = require('./routes/auth.routes.js');
const aiRoutes = require('./routes/ai.routes.js');
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);

// --- Static File Serving for Frontend ---
const frontendPath = path.join(__dirname, '..', 'FrontEnd');
app.use(express.static(frontendPath));
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// --- Socket.IO Real-time Logic ---
const io = new Server(server, { cors: { origin: "*" } }); // Keeping this open for simplicity
require('./socket.js')(io);

// --- Database & Server Start ---
const PORT = process.env.PORT || 3000;
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB connected successfully.');
        server.listen(PORT, () => console.log(`🚀 Server is running on http://localhost:${PORT}`));
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });