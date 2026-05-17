const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'invoice-secret-key-change-in-prod';

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'username, email and password are required' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO auth_schema.users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, role',
      [username, email, passwordHash]
    );

    res.status(201).json({ message: 'User registered successfully', user: result.rows[0] });
    sendLog('auth-service', `User registered: ${email}`);

  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Username or email already exists' });
    }
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const result = await pool.query(
      'SELECT * FROM auth_schema.users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
    sendLog('auth-service', `User logged in: ${email}`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /auth/validate - used by other services to validate JWT
router.post('/validate', (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ valid: false, error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, user: decoded });
    sendLog('auth-service', `Token validated for userId: ${decoded.userId}`);
  } catch (err) {
    res.status(401).json({ valid: false, error: 'Invalid or expired token' });
  }
});

// GET /auth/health
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'auth-service' });
});

module.exports = router;
