const Channel = require('../models/Channel');
const Message = require('../models/Message');
const Users = require('../models/UserModel');
const cloudinary = require('../config/cloudinaryConfig');
const axios = require('axios'); // Import Axios for making HTTP requests
const ConfessionMessage = require('../models/ConfessionMessage'); 

const mongoose = require('mongoose');
// Fetch all channels
exports.getAllChannels = async (req, res) => {
    try {
        const channels = await Channel.find();
        res.status(200).json({ success: true, channels});
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get messages of a specific channel
exports.getChannelMessages = async (req, res) => {
    const { channelId } = req.params;
    
    try {
        // Validate and convert channelId to ObjectId
        if (!mongoose.Types.ObjectId.isValid(channelId)) {
            return res.status(400).json({ success: false, message: "Invalid Channel ID" });
        }
         // Find the channel by ID
        const channel = await Channel.findById(channelId);
        if (!channel) {
            return res.status(404).json({ success: false, message: "Channel not found" });
        }
        // Checking if we have to render the mention option in the ui or not
        const isConfession = channel.name === 'Confessions';
        if (isConfession) {
            messages = await ConfessionMessage.find({ channelId: new mongoose.Types.ObjectId(channelId) })
                .populate('userId', 'name');
        } else {
            messages = await Message.find({ channelId: new mongoose.Types.ObjectId(channelId) })
                .populate('userId', 'firstName lastName');
        }
        // console.log(messages);
        // const messages = await Message.find({ channelId: new mongoose.Types.ObjectId(channelId) })
        //     .populate('userId', 'name');
        // console.log(messages);
        res.status(200).json({ success: true, isConfession, messages });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// Create a new channel
exports.createChannel = async (req, res) => {
    const { name, description } = req.body;
    try {
        const newChannel = await Channel.create({ name, description });
        res.status(201).json({ success: true, channel: newChannel });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Post a new message in a channel
exports.postMessage = async (req, res) => {
    const { channelId } = req.params;
    const { userId,content,imageUrl } = req.body; // Assume userId is passed via the frontend

    try {
        // const newMessage = await Message.create({ channelId,userId, content,imageUrl });
        // res.status(201).json({ success: true, message: newMessage });
         const channel = await Channel.findById(channelId);
        if (!channel) {
            return res.status(404).json({ success: false, message: "Channel not found" });
        }
        if (channel.name === 'Confessions') {
            // Using the Confession Message schema to save the message
            // console.log("hello ")
            const newGeneralMessage = await ConfessionMessage.create({ channelId, userId, content });
            // Make a POST request to the external URL with the message data
            await axios.post(`${process.env.URL}/api/dm`, {
                channelId: newGeneralMessage.channelId,
                userId: newGeneralMessage.isMention,
                content: newGeneralMessage.content,
                createdAt: Date.now
            });
            res.status(201).json({ success: true, message: newGeneralMessage });
        }
        // For other channels, use the regular Message schema
        const newMessage = await Message.create({ channelId, userId, content,imageUrl });
        // console.log(newMessage.userId._id);
        res.status(201).json({ success: true, message: newMessage });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


exports.get_signature = async (req, res) => {
    try {
        const timestamp = Math.round(new Date().getTime() / 1000);

    const signature = cloudinary.utils.api_sign_request(
        { timestamp },
        process.env.CLOUDINARY_API_SECRET
    );

    res.status(200).json({
        signature,
        timestamp,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,

    });
    } catch (error) {
        console.log({error});
        return res.status(500).send("Internal server error");
    }
};
