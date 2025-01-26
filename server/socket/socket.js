const express = require('express')
const { Server } = require('socket.io')
const http  = require('http')
const { verifyToken } = require("../middlewares/AuthMiddleware.js");
const getUserDetailsFromToken = require('../helpers/getUserDetailsFromToken')
const UserModel = require('../models/UserModel')
const { DirectMessageModel, ConversationModel } = require("../models/ConversationModel.js");
const getConversation = require('../helpers/getConversation')
const cookie = require('cookie');

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
            profile_pic : userDetails?.profile_pic,
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

        // console.log("hellow",getConversationMessage)
        socket.emit('message',getConversationMessage?.messages || [])
    })


    //new message
    socket.on('new message',async(data)=>{

        //check conversation is available both user
        // console.log("data",data)
        let conversation = await ConversationModel.findOne({
            "$or" : [
                { sender : data?.sender, receiver : data?.receiver },
                { sender : data?.receiver, receiver :  data?.sender}
            ]
        })

        //if conversation is not available
        if(!conversation){
            const createConversation = await ConversationModel({
                sender : data?.sender,
                receiver : data?.receiver
            })
            conversation = await createConversation.save()
        }
        
        const directmessage = new DirectMessageModel({
          text : data.text,
          imageUrl : data.imageUrl,
          videoUrl : data.videoUrl,
          msgByUserId :  data?.msgByUserId,
        })
        const saveMessage = await directmessage.save()

        const updateConversation = await ConversationModel.updateOne({ _id : conversation?._id },{
            "$push" : { messages : saveMessage?._id }
        })

        const getConversationMessage = await ConversationModel.findOne({
            "$or" : [
                { sender : data?.sender, receiver : data?.receiver },
                { sender : data?.receiver, receiver :  data?.sender}
            ]
        }).populate('messages').sort({ updatedAt : -1 })


        io.to(data?.sender).emit('directmessage',getConversationMessage?.messages || [])
        io.to(data?.receiver).emit('directmessage',getConversationMessage?.messages || [])

        //send conversation
        const conversationSender = await getConversation(data?.sender)
        const conversationReceiver = await getConversation(data?.receiver)

        io.to(data?.sender).emit('conversation',conversationSender)
        io.to(data?.receiver).emit('conversation',conversationReceiver)
    })


    //sidebar
    socket.on('sidebar',async(currentUserId)=>{
        console.log("current user",currentUserId)

        const conversation = await getConversation(currentUserId)

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


    // Real-time channel updates
    socket.on('newChannel', (channel) => {
        io.emit('channelCreated', channel);
    });
    //disconnect
    socket.on('disconnect',()=>{
        onlineUser.delete(user?._id?.toString())
        console.log('disconnect user ',socket.id)
    })
})

module.exports = {
    app,
    server
}
