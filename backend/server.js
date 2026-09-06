require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const connectDB  = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');

const app  = express();
const PORT = process.env.PORT || 5002;

// ─── Connect to MongoDB Atlas ─────────────────────────────────────────────────
connectDB();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
// Parse JSON bodies (for text-only posts and auth)
app.use(express.json());
// Parse URL-encoded bodies (for multipart form data text fields)
app.use(express.urlencoded({ extended: true }));

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth',  authRoutes);
app.use('/api/posts', postRoutes);

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.json({ message: 'FeedConnect API is running.' }));

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ message: err.message || 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`🚀 FeedConnect API running on http://localhost:${PORT}`);
});
