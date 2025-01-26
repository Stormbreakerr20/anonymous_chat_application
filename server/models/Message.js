const mongoose = require('mongoose');
const Users = require('./UserModel');
const MessageSchema = new mongoose.Schema({
    channelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    content: { type: String, required: false },
    createdAt: { type: Date, default: Date.now },
    imageUrl: { type: String, required: false },
});

module.exports = mongoose.model('Message', MessageSchema);
