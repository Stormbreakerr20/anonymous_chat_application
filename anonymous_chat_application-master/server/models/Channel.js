const mongoose = require('mongoose');

const ChannelSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    image:{type:String, required:false, default:""},
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Channel', ChannelSchema);
