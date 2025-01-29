const mongoose = require('mongoose');
const Users = require('./UserModel');
const ConfessionMessageSchema = new mongoose.Schema({
    channelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    content: { type: String, required: true },
    mention: { type: String, required: false },
    createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model('ConfessionMessage', ConfessionMessageSchema);