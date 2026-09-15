const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

app.use(cors());
app.use(express.json());

// PostgreSQL connection pool using Neon DB connection string
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Test database route
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ success: true, time: result.rows[0].now });
  } catch (err) {
    console.error('Database connection error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Signup Route
app.post('/api/signup', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const newUser = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email, password]
    );
    res.status(201).json({ success: true, user: newUser.rows[0] });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Login Route
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1 AND password_hash = $2',
      [username, password]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid username or password' });
    }
    const user = result.rows[0];
    res.json({ success: true, user: { id: user.id, username: user.username, email: user.email } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get Memes Route
app.get('/api/memes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM memes ORDER BY id DESC');
    res.json({ success: true, memes: result.rows });
  } catch (err) {
    console.error('Fetch memes error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Post Meme Route
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

// AI Meme Generator Route (Supports captions, static images, and GIFs)
app.post('/api/ai/generate', async (req, res) => {
  const { prompt } = req.body;
  try {
    const memeAssets = [
      "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=500&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60",
      "https://media.giphy.com/media/3o7TKSjRrfIPjeiOkM/giphy.gif",
      "https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif",
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&auto=format&fit=crop&q=60"
    ];
    
    const randomAsset = memeAssets[Math.floor(Math.random() * memeAssets.length)];
    const generatedCaption = `POV: When you prompt "${prompt || 'coding'}" and the server instantly ratio'd your entire life.`;

    res.json({
      success: true,
      caption: generatedCaption,
      imageUrl: randomAsset
    });
  } catch (err) {
    console.error('AI generation error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Export app for Vercel serverless deployment or listen locally
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running locally on port ${PORT}`);
  });
}

module.exports = app;