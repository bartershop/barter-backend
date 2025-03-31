const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// === MIDDLEWARE ===
app.use(cors({
    origin: ['http://localhost:8080', 'https://barter.cx'],
    methods: ['POST'],
    allowedHeaders: ['Content-Type']
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// === ROUTES ===
// This pulls in our Brevo logic from routes/emailRoutes.js
const emailRoutes = require('routes/emailRoutes');
app.use('/api', emailRoutes);

// === SERVER START ===
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});