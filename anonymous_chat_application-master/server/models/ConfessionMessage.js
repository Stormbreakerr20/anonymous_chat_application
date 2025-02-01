const mongoose = require('mongoose');

const ConfessionMessageSchema = new mongoose.Schema({
    channelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    content: { type: String, required: true },
    to: { type: String, required: true },
    category: { 
        type: String, 
        enum: ['crush', 'secret', 'appreciation', 'regret'],
        default: 'crush'
    },
    backgroundColor: {
        type: String,
        default: 'from-purple-500 to-pink-500'
    },
    anonymous: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ConfessionMessage', ConfessionMessageSchema);