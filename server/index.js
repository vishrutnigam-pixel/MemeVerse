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

// Smart AI Meme & GIF Generator Route with Diverse Pool & Taglines
app.post('/api/ai/generate', async (req, res) => {
  const { prompt } = req.body;
  try {
    const lowerPrompt = (prompt || '').toLowerCase();
    
    // Expanded reliable meme & reaction GIF pool categorized by themes
    const memePools = {
      coding: [
        "https://media.giphy.com/media/13HgwGsXF0aiGY/giphy.gif",
        "https://media.giphy.com/media/XbydQW20p3zTW/giphy.gif",
        "https://media.giphy.com/media/9JkNBO94vj507vFwL1/giphy.gif"
      ],
      cats: [
        "https://media.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif",
        "https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif",
        "https://media.giphy.com/media/5VKbvrjxpUJCM/giphy.gif"
      ],
      hacking: [
        "https://media.giphy.com/media/10JhviFuU2gWI6/giphy.gif",
        "https://media.giphy.com/media/ZOwV9pYt0n39f7nE2i/giphy.gif"
      ],
      chaos: [
        "https://media.giphy.com/media/9J7tdYltWyXII/giphy.gif",
        "https://media.giphy.com/media/5nsiFvjui0HZe/giphy.gif",
        "https://media.giphy.com/media/7rj2Zgtt3gomY/giphy.gif",
        "https://media.giphy.com/media/QMHoU66sBXqqLqYvGO/giphy.gif"
      ]
    };

    let selectedImage = "";
    let topText = "";
    let bottomText = "";

    if (lowerPrompt.includes('cat') || lowerPrompt.includes('dance') || lowerPrompt.includes('kitten') || lowerPrompt.includes('pet')) {
      const pool = memePools.cats;
      selectedImage = pool[Math.floor(Math.random() * pool.length)];
      topText = `WHEN YOU CODE ALL NIGHT`;
      bottomText = `AND THE CAT WALKS ON THE KEYBOARD`;
    } else if (lowerPrompt.includes('code') || lowerPrompt.includes('bug') || lowerPrompt.includes('error') || lowerPrompt.includes('exam') || lowerPrompt.includes('fail')) {
      const pool = memePools.coding;
      selectedImage = pool[Math.floor(Math.random() * pool.length)];
      topText = `FIXING ONE BUG`;
      bottomText = `CREATING 47 NEW ONES`;
    } else if (lowerPrompt.includes('hack') || lowerPrompt.includes('matrix') || lowerPrompt.includes('cyber') || lowerPrompt.includes('terminal')) {
      const pool = memePools.hacking;
      selectedImage = pool[Math.floor(Math.random() * pool.length)];
      topText = `INSPECTION ELEMENT`;
      bottomText = `HACKERMAN`;
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