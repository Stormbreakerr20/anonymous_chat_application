require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http'); // Needed for integrating Socket.IO
const { Server } = require('socket.io');
const channelRoutes = require('./routes/channelRoutes');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/AuthRoutes.js');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization']
    },
});

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials:true,
}));

// Database Connection
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Database connected'))
    .catch((err) => console.error('Database connection failed:', err));

// Routes
app.use('/api/channels', channelRoutes);
app.use('/api/auth', authRoutes);

// Socket.IO for Real-Time Updates
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Real-time message broadcast
    socket.on('newMessage', (message) => {
        io.to(message.channelId).emit('receiveMessage', message);
    });

    // Real-time channel updates
    socket.on('newChannel', (channel) => {
        io.emit('channelCreated', channel);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Start the Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});