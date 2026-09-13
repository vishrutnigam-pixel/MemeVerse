const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(cors());

const MONGO_URI = 'mongodb://127.0.0.1:27017/memeverse_db';
const JWT_SECRET = 'MEMEVERSE_BRUTAL_SECRET_KEY';

mongoose.connect(MONGO_URI)
  .then(() => console.log('\n::: MONGO_DB CONNECTED SUCCESSFULLY :::\n'))
  .catch(err => console.error('Database connection breakdown:', err));

// User Schema
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const User = mongoose.model('User', UserSchema);

// Authentication Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Missing credentials _' });

    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ error: 'Username already claimed _' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User spawned successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Internal system crash during registration' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: 'User does not exist _' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid authentication vector _' });

    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, username: user.username });
  } catch (err) {
    res.status(500).json({ error: 'Internal server breakdown' });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`\n::: MEMEVERSE SERVER EXECUTING ON PORT ${PORT} :::`));