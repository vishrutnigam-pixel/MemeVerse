const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

// 1. Enable CORS so your Vercel frontend can talk to this backend
app.use(cors({
  origin: '*', // Allows requests from any frontend origin
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

// --- AUTHENTICATION ROUTES ---

// User Signup Route
app.post('/api/signup', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email, password]
    );
    res.status(201).json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(400).json({ success: false, error: err.message });
  }
});

// User Login Route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND password_hash = $2',
      [email, password]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }
    res.json({ success: true, user: { id: result.rows[0].id, username: result.rows[0].username, email: result.rows[0].email } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- MEME ROUTES ---

// Get All Saved Memes
app.get('/api/memes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM memes ORDER BY created_at DESC');
    res.json({ success: true, memes: result.rows });
  } catch (err) {
    console.error('Fetch memes error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create / Save a New Meme
app.post('/api/memes', async (req, res) => {
  const { title, image_url, top_text, bottom_text, creator_email } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO memes (title, image_url, top_text, bottom_text, creator_email) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, image_url, top_text, bottom_text, creator_email]
    );
    res.status(201).json({ success: true, meme: result.rows[0] });
  } catch (err) {
    console.error('Create meme error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Export the app for Vercel serverless deployment (or listen locally if running locally)
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running locally on port ${PORT}`);
  });
}

module.exports = app;