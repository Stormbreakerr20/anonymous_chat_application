require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http'); // Needed for integrating Socket.IO
const channelRoutes = require('./routes/channelRoutes');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/AuthRoutes.js');
const { app, server } = require('./socket/socket.js')
const { existsSync, mkdirSync } =require('fs');
const contactRoutes = require("./routes/ContactRoutes.js");
const cloudinaryRoutes = require('./routes/cloudinaryRoutes');



app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
    })
);

if (!existsSync('uploads/profiles')) {
    mkdirSync('uploads/profiles', { recursive: true });
}
// Static file handling
app.use('/uploads/profiles', express.static('uploads/profiles'));

// Routes
app.use('/api/channels', channelRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/cloudinary', cloudinaryRoutes);

// Database Connection
mongoose
    .connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Database connected'))
    .catch((err) => console.error('Database connection failed:', err));

// Start the Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)});
