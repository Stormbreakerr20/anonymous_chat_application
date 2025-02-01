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
                .populate('userId', 'firstName lastName'); // Changed from 'name' to 'firstName lastName'
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
    const { userId, content, imageUrl, to, category, anonymous, backgroundColor } = req.body;

    try {
        const channel = await Channel.findById(channelId);
        if (!channel) {
            return res.status(404).json({ success: false, message: "Channel not found" });
        }

        if (channel.name === 'Confessions') {
            const newConfession = await ConfessionMessage.create({ 
                channelId, 
                userId, 
                content,
                to,
                category,
                anonymous,
                backgroundColor // Make sure this is saved
            });
            
            // Populate the user details before sending response
            await newConfession.populate('userId', 'firstName lastName');
            
            res.status(201).json({ success: true, message: newConfession });
        } else {
            const newMessage = await Message.create({ channelId, userId, content, imageUrl });
            res.status(201).json({ success: true, message: newMessage });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteMessage = async (req, res) => {
    const { channelId, messageId } = req.params;
    const { userId } = req.body;

    try {
        // Check if channel exists
        const channel = await Channel.findById(channelId);
        if (!channel) {
            return res.status(404).json({ success: false, message: "Channel not found" });
        }

        // Determine message model based on channel
        const MessageModel = channel.name === 'Confessions' ? ConfessionMessage : Message;

        // Find the message
        const message = await MessageModel.findById(messageId);
        if (!message) {
            return res.status(404).json({ success: false, message: "Message not found" });
        }

        // Verify user owns the message
        if (message.userId.toString() !== userId) {
            return res.status(403).json({ success: false, message: "Unauthorized to delete this message" });
        }

        // Delete the message
        await MessageModel.findByIdAndDelete(messageId);

        res.status(200).json({ success: true, message: "Message deleted successfully" });
    } catch (error) {
        console.error("Error deleting message:", error);
        res.status(500).json({ success: false, message: "Error deleting message" });
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
