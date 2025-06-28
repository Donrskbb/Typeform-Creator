import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
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

export default router;