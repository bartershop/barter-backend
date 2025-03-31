// routes/emailRoutes.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

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
    let alreadyExists = false;

    // STEP 1: Check if contact exists
    try {
      await brevoAPI.get(`/contacts/${encodeURIComponent(email)}`);
      alreadyExists = true;
    } catch (err) {
      if (err.response?.status !== 404) {
        throw err; // other Brevo error
      }
    }

    // STEP 2: Add/update contact
    await brevoAPI.post('/contacts', {
      email,
      listIds: [Number(BREVO_LIST_ID)],
      updateEnabled: true,
    });

    // STEP 3: Only send email if it’s a new contact
    if (!alreadyExists) {
      await brevoAPI.post('/smtp/email', {
        to: [{ email }],
        templateId: Number(BREVO_TEMPLATE_ID),
      });
    }

    return res.status(200).json({
      message: alreadyExists
        ? 'Contact already exists. No duplicate email sent.'
        : 'New contact subscribed and email sent!',
    });
  } catch (err) {
    console.error('Brevo error:', err.response?.data || err.message);
    return res.status(500).json({ error: 'Subscription failed. Please try again.' });
  }
});

module.exports = router;