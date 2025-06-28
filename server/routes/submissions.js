import express from 'express';
import { submitToDiscord } from '../services/discord.js';
import { submitToMongoDB } from '../services/mongodb.js';
import { submitToEmail } from '../services/email.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const formData = req.body;
    const enabledDestinations = (process.env.ENABLED_DESTINATIONS || '').split(',').map(d => d.trim());
    
    const results = {
      success: true,
      destinations: {},
      timestamp: new Date().toISOString(),
      formData
    };

    // Submit to enabled destinations
    const promises = [];

    if (enabledDestinations.includes('discord')) {
      promises.push(
        submitToDiscord(formData)
          .then(() => { results.destinations.discord = { success: true }; })
          .catch(error => { results.destinations.discord = { success: false, error: error.message }; })
      );
    }

    if (enabledDestinations.includes('mongodb')) {
      promises.push(
        submitToMongoDB(formData)
          .then((result) => { results.destinations.mongodb = { success: true, id: result.insertedId }; })
          .catch(error => { results.destinations.mongodb = { success: false, error: error.message }; })
      );
    }

    if (enabledDestinations.includes('email')) {
      promises.push(
        submitToEmail(formData)
          .then(() => { results.destinations.email = { success: true }; })
          .catch(error => { results.destinations.email = { success: false, error: error.message }; })
      );
    }

    await Promise.all(promises);

    // Check if any destination failed
    const hasFailures = Object.values(results.destinations).some(dest => !dest.success);
    if (hasFailures) {
      results.success = false;
    }

    res.json(results);
  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get all submissions (from MongoDB if enabled)
router.get('/', async (req, res) => {
  try {
    const enabledDestinations = (process.env.ENABLED_DESTINATIONS || '').split(',').map(d => d.trim());
    
    if (!enabledDestinations.includes('mongodb')) {
      return res.status(400).json({
        success: false,
        error: 'MongoDB is not enabled. Cannot retrieve submissions.'
      });
    }

    const { getSubmissions } = await import('../services/mongodb.js');
    const submissions = await getSubmissions();
    
    res.json({
      success: true,
      submissions,
      count: submissions.length
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;