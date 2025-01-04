require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http'); // Needed for integrating Socket.IO
const { Server } = require('socket.io');
const channelRoutes = require('./routes/channelRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Adjust this to restrict to your frontend URL
    },
});

// Middleware
app.use(express.json());

// Database Connection
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Database connected'))
    .catch((err) => console.error('Database connection failed:', err));

// Routes
app.use('/api/channels', channelRoutes);

// Socket.IO for Real-Time Updates
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Joining a specific channel
    socket.on('joinChannel', (channelId) => {
        socket.join(channelId);
        console.log(`User joined channel: ${channelId}`);
    });

    // Listening for new messages
    socket.on('sendMessage', (data) => {
        const { channelId, userId, content } = data;

        // Save message to database
        const Message = require('./models/Message');
        Message.create({ channelId, userId, content })
            .then((newMessage) => {
                // Emit the message to everyone in the channel
                io.to(channelId).emit('receiveMessage', newMessage);
            })
            .catch((err) => {
                console.error('Error saving message:', err);
            });
    });

    // Disconnect event
    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });
});

// Start the Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});