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

// Post Meme Route (Supports top text and bottom text)
app.post('/api/memes', async (req, res) => {
  const { title, image_url, top_text, bottom_text, creator_email } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO memes (title, image_url, top_text, bottom_text, creator_email) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, image_url, top_text || '', bottom_text || '', creator_email]
    );
    res.status(201).json({ success: true, meme: result.rows[0] });
  } catch (err) {
    console.error('Create meme error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Smart AI Meme & GIF Generator Route with Bulletproof Image URLs
app.post('/api/ai/generate', async (req, res) => {
  const { prompt } = req.body;
  try {
    const lowerPrompt = (prompt || '').toLowerCase();
    
    // Stable, reliable meme image pool preventing broken link placeholders
    const memePools = {
      coding: [
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80"
      ],
      cats: [
        "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=600&auto=format&fit=crop&q=80"
      ],
      hacking: [
        "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80"
      ],
      chaos: [
        "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80"
      ]
    };

    let selectedImage = "";
    let topText = "";
    let bottomText = "";

    if (lowerPrompt.includes('cat') || lowerPrompt.includes('dance') || lowerPrompt.includes('kitten') || lowerPrompt.includes('pet')) {
      const pool = memePools.cats;
      selectedImage = pool[Math.floor(Math.random() * pool.length)];
      topText = `ME: I WILL JUST PET THE CAT`;
      bottomText = `3 HOURS LATER: STILL SITTING HERE`;
    } else if (lowerPrompt.includes('code') || lowerPrompt.includes('bug') || lowerPrompt.includes('error') || lowerPrompt.includes('exam') || lowerPrompt.includes('fail')) {
      const pool = memePools.coding;
      selectedImage = pool[Math.floor(Math.random() * pool.length)];
      topText = `IT WORKS ON MY MACHINE`;
      bottomText = `PRODUCTION ENVIRONMENT ON FIRE`;
    } else if (lowerPrompt.includes('hack') || lowerPrompt.includes('matrix') || lowerPrompt.includes('cyber') || lowerPrompt.includes('terminal')) {
      const pool = memePools.hacking;
      selectedImage = pool[Math.floor(Math.random() * pool.length)];
      topText = `TYPING FAST`;
      bottomText = `TO LOOK PRODUCTIVE`;
    } else {
      const allPools = [...memePools.chaos, ...memePools.coding, ...memePools.cats];
      selectedImage = allPools[Math.floor(Math.random() * allPools.length)];
      topText = `POV: ${prompt.toUpperCase()}`;
      bottomText = "ABSOLUTE CHAOS";
    }

    res.json({
      success: true,
      top_text: topText,
      bottom_text: bottomText,
      imageUrl: selectedImage,
      caption: `${topText} — ${bottomText}`
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