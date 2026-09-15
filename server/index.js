const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Neon PostgreSQL Connection Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'YOUR_NEON_DATABASE_URL_HERE',
  ssl: { rejectUnauthorized: false }
});

pool.connect()
  .then(() => console.log("Neon PostgreSQL Connected_"))
  .catch(err => console.error("Database connection error", err));

// Optional: Initialize Tables if they don't exist
const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS memes (
        id BIGINT PRIMARY KEY,
        caption TEXT,
        image TEXT,
        category VARCHAR(100),
        type VARCHAR(100),
        timestamp VARCHAR(50),
        votes INT DEFAULT 0,
        comments JSONB DEFAULT '[]'::jsonb
      );
    `);
    console.log("Database tables verified_");
  } catch (err) {
    console.error("Table initialization error:", err);
  }
};
initDB();

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2)',
      [username, hashedPassword]
    );
    res.status(201).json({ message: "Registration successful" });
  } catch (err) {
    res.status(400).json({ error: "Username already taken or invalid format" });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username }, 
      'MEMEVERSE_SECRET_KEY', 
      { expiresIn: '7d' }
    );
    res.json({ token, username: user.username });
  } catch (err) {
    res.status(500).json({ error: "Server login error" });
  }
});

// Meme API Endpoints
app.get('/api/memes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM memes ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch memes" });
  }
});

app.post('/api/memes', async (req, res) => {
  try {
    const { id, caption, image, category, type, timestamp, votes, comments } = req.body;
    await pool.query(
      `INSERT INTO memes (id, caption, image, category, type, timestamp, votes, comments) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [id, caption, image, category, type, timestamp, votes || 0, JSON.stringify(comments || [])]
    );
    res.status(201).json(req.body);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create post" });
  }
});

app.post('/api/memes/:id/vote', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'UPDATE memes SET votes = votes + 1 WHERE id = $1 RETURNING votes',
      [id]
    );
    if (result.rows.length > 0) {
      res.json({ success: true, votes: result.rows[0].votes });
    } else {
      res.status(404).json({ error: "Post not found" });
    }
  } catch (err) {
    res.status(500).json({ error: "Vote update error" });
  }
});

app.post('/api/memes/:id/comment', async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const newComment = { id: Date.now(), text, author: "User" };

    // Append comment to JSONB array in PostgreSQL
    const result = await pool.query(
      `UPDATE memes 
       SET comments = comments || $1::jsonb 
       WHERE id = $2 RETURNING *`,
      [JSON.stringify(newComment), id]
    );

    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: "Post not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Comment error" });
  }
});

// AI Generation Mock Endpoint
app.post('/api/ai/generate', (req, res) => {
  const { prompt } = req.body;
  res.json({ imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60" });
});

app.listen(5000, () => console.log("MemeVerse Backend running on port 5000 🚀"));