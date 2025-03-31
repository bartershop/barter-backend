// routes/emailRoutes.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

// === 🔐 CONFIGURATION ===
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_LIST_ID = process.env.BREVO_LIST_ID;
const BREVO_TEMPLATE_ID = process.env.BREVO_TEMPLATE_ID;

const brevoAPI = axios.create({
  baseURL: 'https://api.brevo.com/v3',
  headers: {
    'api-key': BREVO_API_KEY,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

router.post('/subscribe', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required.' });

  try {
    // Step 1: Add to contact list
    await brevoAPI.post('/contacts', {
      email,
      listIds: [Number(BREVO_LIST_ID)],
      updateEnabled: true,
    });

    // Step 2: Send transactional email
    await brevoAPI.post('/smtp/email', {
      to: [{ email }],
      templateId: Number(BREVO_TEMPLATE_ID), // ✅ FIXED: must be a number
    });

    return res.status(200).json({ message: 'Successfully subscribed and email sent!' });
  } catch (err) {
    console.error('Brevo error:', err.response?.data || err.message);
    return res.status(500).json({ error: 'Subscription failed. Please try again.' });
  }
});

module.exports = router;