const express = require('express')
const { Server } = require('socket.io')
const http  = require('http')
const { verifyToken } = require("../middlewares/AuthMiddleware.js");
const getUserDetailsFromToken = require('../helpers/getUserDetailsFromToken')
const UserModel = require('../models/UserModel')
const { DirectMessageModel, ConversationModel } = require("../models/ConversationModel.js");
const getConversation = require('../helpers/getConversation')
const cookie = require('cookie');
const crypto = require('crypto');

// Updated encryption configuration
const algorithm = 'aes-256-cbc';
const key = crypto.scryptSync(process.env.MESSAGE_KEY || 'default-key', 'salt', 32);
const IV_LENGTH = 16;

// Updated encrypt function
function encrypt(text) {
    try {
        if (!text) return '';
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(algorithm, key, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return `${iv.toString('hex')}:${encrypted}`;
    } catch (error) {
        console.error('Encryption error:', error);
        return text;
    }
}

// Updated decrypt function
function decrypt(hash) {
    try {
        if (!hash || !hash.includes(':')) return hash;
        
        const [ivHex, encryptedText] = hash.split(':');
        if (!ivHex || !encryptedText) return hash;

        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error);
        return hash;
    }
}

const app = express()



/***socket connection */
const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization']
    },
});


const onlineUser = new Set()

io.on('connection',async(socket)=>{
    // console.log("connect User ", socket.id)
    // console.log(socket.handshake)
    const cookies = cookie.parse(socket.handshake.headers.cookie || ''); // Parse the cookies from the headers
// console.log('Cookies:', socket.handshake.headers.cookie);

    const token = cookies.jwt;
    // const token = req.cookies.jwt;
    // console.log(socket.handshake)
    // console.log(token);
    // if (!token) {
    //     console.log("Token notprovided");
    //     socket.disconnect();  // Disconnect the client if no token is present
    //     return;
    // }
    //current user details 
    const user = await getUserDetailsFromToken(token)

    //create a room
    // console.log("User is ")
    // console.log(user.firstName);
    if (user?._id) {
        socket.join(user._id.toString());
    } else {
        console.error("User or User ID is undefined");
    }
    
    
    onlineUser.add(user?._id?.toString())
    io.emit('onlineUser',Array.from(onlineUser))

    socket.on('message-page',async(userId)=>{
        console.log('userId',userId)
        const userDetails = await UserModel.findById(userId).select("-password")
        // console.log(userDetails)
        const payload = {
            _id : userDetails?._id,
            name : userDetails?.firstName,
            email : userDetails?.email,
            image : userDetails?.image,
            online : onlineUser.has(userId)
        }
        socket.emit('message-user',payload)


         //get previous message
         const getConversationMessage = await ConversationModel.findOne({
            "$or" : [
                { sender : user?._id, receiver : userId },
                { sender : userId, receiver :  user?._id}
            ]
        }).populate('messages').sort({ updatedAt : -1 })
        // console.log("Sender:", user?._id);
        //  console.log("Receiver:", userId);

        // Decrypt messages before sending
        const decryptedMessages = getConversationMessage?.messages.map(msg => {
            try {
                return {
                    ...msg.toObject(),
                    text: msg.text ? decrypt(msg.text) : ''
                };
            } catch (error) {
                console.error('Message decryption error:', error);
                return msg;
            }
        }) || [];

        socket.emit('message', decryptedMessages);
    })


    //new message
    socket.on('new message', async(data) => {
        try {
            // Find or create conversation
            let conversation = await ConversationModel.findOne({
                "$or": [
                    { sender: data.sender, receiver: data.receiver },
                    { sender: data.receiver, receiver: data.sender }
                ]
            });

            if (!conversation) {
                conversation = await ConversationModel.create({
                    sender: data.sender,
                    receiver: data.receiver,
                    messages: []
                });
            }

            // Encrypt message before saving
            const encryptedText = data.text ? encrypt(data.text) : '';

            // Create new message with conversation reference
            const directMessage = await DirectMessageModel.create({
                text: encryptedText,
                imageUrl: data.imageUrl,
                videoUrl: data.videoUrl,
                msgByUserId: data.msgByUserId,
                conversationId: conversation._id
            });

            // Add message to conversation
            conversation.messages.push(directMessage._id);
            await conversation.save();

            // Fetch updated conversation with populated messages
            const updatedConversation = await ConversationModel.findById(conversation._id)
                .populate('messages');

            // Decrypt messages before emitting
            const decryptedMessages = updatedConversation.messages.map(msg => {
                try {
                    return {
                        ...msg.toObject(),
                        text: msg.text ? decrypt(msg.text) : ''
                    };
                } catch (error) {
                    console.error('Message decryption error:', error);
                    return msg;
                }
            });

            // Emit to both users
            io.to(data.sender).emit('directMessage', decryptedMessages);
            io.to(data.receiver).emit('directMessage', decryptedMessages);

            // Update conversation list for both users
            const conversationSender = await getConversation(data.sender);
            const conversationReceiver = await getConversation(data.receiver);

            io.to(data.sender).emit('conversation', conversationSender);
            io.to(data.receiver).emit('conversation', conversationReceiver);

        } catch (error) {
            console.error('Error sending message:', error);
            socket.emit('messageError', { error: 'Failed to send message' });
        }
    });


    //sidebar
    socket.on('sidebar',async(currentUserId)=>{
        console.log("current user",currentUserId)

        const conversation = await getConversation(currentUserId.userId)
        
        //console.log(conversation)
        socket.emit('conversation',conversation)
        
    })

    socket.on('seen',async(msgByUserId)=>{
        
        let conversation = await ConversationModel.findOne({
            "$or" : [
                { sender : user?._id, receiver : msgByUserId },
                { sender : msgByUserId, receiver :  user?._id}
            ]
        })

        const conversationMessageId = conversation?.messages || []

        const updateMessages  = await DirectMessageModel.updateMany(
            { _id : { "$in" : conversationMessageId }, msgByUserId : msgByUserId },
            { "$set" : { seen : true }}
        )

        //send conversation
        const conversationSender = await getConversation(user?._id?.toString())
        const conversationReceiver = await getConversation(msgByUserId)

        io.to(user?._id?.toString()).emit('conversation',conversationSender)
        io.to(msgByUserId).emit('conversation',conversationReceiver)
    })
    socket.on('newMessage', (message) => {
        console.log('Broadcasting new message to channel:', message.channelId);
        
        io.emit('receiveMessage', message);
});

    socket.on('channelToDM',(myId,userId)=>{
        io.to(myId).emit('channelToDM',userId);
    })
    socket.on('deletion',async(msgId, channelId)=>{
        try {
            console.log('Message deletion request:', msgId, channelId);
            // Broadcast deletion to all clients in the channel
            io.emit('deleteMessage', { msgId, channelId });
        } catch (error) {
            console.error('Error in deletion socket event:', error);
            socket.emit('deletionError', { error: 'Failed to delete message' });
        }
    })

    // Real-time channel updates
    socket.on('newChannel', (channel) => {
        io.emit('channelCreated', channel);
    });

    socket.on('deleteDirectMessage', async ({ messageId, sender, receiver }) => {
        try {
            // Find the conversation first
            const conversation = await ConversationModel.findOne({
                "$or": [
                    { sender: sender, receiver: receiver },
                    { sender: receiver, sender: sender }
                ]
            });

            if (!conversation) {
                throw new Error('Conversation not found');
            }

            // Delete message from DirectMessage collection
            await DirectMessageModel.findByIdAndDelete(messageId);
            
            // Remove message reference from conversation
            await ConversationModel.findByIdAndUpdate(
                conversation._id,
                { $pull: { messages: messageId } }
            );

            // Get updated messages
            const updatedConversation = await ConversationModel.findById(conversation._id)
                .populate('messages');

            // Decrypt messages before emitting
            const decryptedMessages = updatedConversation.messages.map(msg => ({
                ...msg.toObject(),
                text: msg.text ? decrypt(msg.text) : ''
            }));

            // Emit to both users
            io.to(sender).emit('messageDeleted', { 
                messageId,
                messages: decryptedMessages 
            });
            io.to(receiver).emit('messageDeleted', { 
                messageId,
                messages: decryptedMessages 
            });

        } catch (error) {
            console.error('Error deleting message:', error);
            socket.emit('deletionError', { error: 'Failed to delete message' });
        }
    });

    //disconnect
    socket.on('disconnect',()=>{
        onlineUser.delete(user?._id?.toString())
        io.emit('onlineUser',Array.from(onlineUser))
        console.log(onlineUser);
        console.log('disconnect user ',socket.id)
    })
})

module.exports = {
    app,
    server
}
