import express from 'express';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { requireAdmin } from './auth.js';

const router = express.Router();

router.get('/', requireAdmin, (req, res) => {
  const config = {
    destinations: {
      discord: {
        enabled: (process.env.ENABLED_DESTINATIONS || '').includes('discord'),
        configured: !!process.env.DISCORD_WEBHOOK_URL
      },
      mongodb: {
        enabled: (process.env.ENABLED_DESTINATIONS || '').includes('mongodb'),
        configured: !!process.env.MONGODB_URI
      },
      email: {
        enabled: (process.env.ENABLED_DESTINATIONS || '').includes('email'),
        configured: !!(process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS)
      }
    },
    server: {
      port: process.env.PORT || 3001,
      environment: process.env.NODE_ENV || 'development'
    }
  };

  res.json(config);
});

// New: Get .env file content
router.get('/env', requireAdmin, (req, res) => {
  const envPath = path.join(process.cwd(), '.env');
  fs.readFile(envPath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read .env file' });
    res.json({ content: data });
  });
});

// New: Update .env file content
router.post('/env', requireAdmin, (req, res) => {
  const envPath = path.join(process.cwd(), '.env');
  const { content } = req.body;
  if (typeof content !== 'string') {
    return res.status(400).json({ error: 'Invalid content' });
  }
  fs.writeFile(envPath, content, 'utf8', (err) => {
    if (err) return res.status(500).json({ error: 'Failed to write .env file' });
    dotenv.config({ path: envPath });
    res.json({ success: true });
  });
});

export default router;