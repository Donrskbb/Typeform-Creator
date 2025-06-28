import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';

dotenv.config();

const router = express.Router();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const COOKIE_SECRET = process.env.COOKIE_SECRET || 'changeme';
const COOKIE_NAME = 'admin_auth';

// Helper to create a signed cookie value
function sign(value) {
  return value + '.' + crypto.createHmac('sha256', COOKIE_SECRET).update(value).digest('hex');
}

function verify(signed) {
  if (!signed) return false;
  const [value, hash] = signed.split('.');
  return sign(value) === signed ? value : false;
}

// Login endpoint
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = sign(username);
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: false, // set to true if using HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    });
    return res.json({ success: true });
  }
  res.status(401).json({ success: false, error: 'Invalid credentials' });
});

// Logout endpoint
router.post('/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME);
  res.json({ success: true });
});

// Auth check endpoint
router.get('/me', (req, res) => {
  const token = req.cookies[COOKIE_NAME];
  if (verify(token) === ADMIN_USERNAME) {
    return res.json({ authenticated: true, username: ADMIN_USERNAME });
  }
  res.status(401).json({ authenticated: false });
});

// Middleware to protect admin routes
export function requireAdmin(req, res, next) {
  const token = req.cookies[COOKIE_NAME];
  if (verify(token) === ADMIN_USERNAME) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
}

export default router;
