const express = require('express');
const router = express.Router();
const channelController = require('../controllers/channelController');

// Routes for channels
router.get('/', channelController.getAllChannels); // Fetch all channels
router.get('/:channelId/messages', channelController.getChannelMessages); // Get messages of a specific channel
router.post('/', channelController.createChannel); // Create a new channel
router.post('/:channelId/messages', channelController.postMessage); // Post a new message in a channel
router.delete('/:channelId/messages/:messageId', channelController.deleteMessage); // Delete a specific message

module.exports = router;