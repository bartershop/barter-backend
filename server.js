const express = require('express');
const bodyParser = require('body-parser');
const mailchimp = require('@mailchimp/mailchimp_marketing');
const cors = require('cors'); // Enable CORS handling
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Enable CORS for requests from localhost:8080 and allow Content-Type header
app.use(cors({
    origin: ['http://localhost:8080', 'https://barter.cx'],
    methods: ['POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mailchimp.setConfig({
    apiKey: process.env.MAILCHIMP_API_KEY,
    server: process.env.MAILCHIMP_SERVER_PREFIX,
});

app.post('/subscribe', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
    }

    try {
        await mailchimp.lists.addListMember(process.env.MAILCHIMP_AUDIENCE_ID, {
            email_address: email,
            status: 'subscribed'
        });

        res.status(200).json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            error: err.response?.body?.detail || 'Unknown error'
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});