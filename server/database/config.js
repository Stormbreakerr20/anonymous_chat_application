require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const channelRoutes = require('./routes/channelRoutes');

const app = express();

// Middleware
app.use(express.json());

// Database Connection
mongoose.connect(process.env.DATABASE_URL, {})
    .then(() => console.log('Database connected'))
    .catch((err) => console.error('Database connection failed:', err));

// Routes
app.use('/api/channels', channelRoutes);

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});