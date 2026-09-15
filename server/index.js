const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

// 1. Enable CORS so your Vercel frontend can talk to this backend
app.use(cors({
  origin: '*', // Allows requests from any frontend origin (or specify your specific client Vercel URL)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// 2. Parse incoming JSON requests
app.use(express.json());

// 3. Connect to Neon PostgreSQL using your DATABASE_URL environment variable
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for secure connections to Neon
  }
});

// Test Database Connection Route
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ success: true, time: result.rows[0].now });
  } catch (err) {
    console.error('Database connection error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Root / Health Check Route
app.get('/', (req, res) => {
  res.json({ status: 'MemeVerse Server is live and running!' });
});

// TODO: Add your existing auth / meme routes here (e.g., app.post('/api/signup', ...))

// 4. Export the app for Vercel serverless deployment (or listen locally if running locally)
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running locally on port ${PORT}`);
  });
}

module.exports = app;