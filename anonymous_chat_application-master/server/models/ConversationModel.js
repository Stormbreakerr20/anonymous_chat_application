const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
    text : {
        type : String,
        default : ""
    },
    imageUrl : {
        type : String,
        default : ""
    },
    videoUrl : {
        type : String,
        default : ""
    },
    seen : {
        type : Boolean,
        default : false
    },
    msgByUserId : {
        type : mongoose.Schema.ObjectId,
        required : true,
        ref : 'Users'
    },
    conversationId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Conversation'
    }
},{
    timestamps : true
})

const conversationSchema = new mongoose.Schema({
    sender : {
        type : mongoose.Schema.ObjectId,
        required : true,
        ref : 'Users'
    },
    receiver : {
        type : mongoose.Schema.ObjectId,
        required : true,
        ref : 'Users'
    },
    messages : [
        {
            type : mongoose.Schema.ObjectId,
            ref : 'DirectMessage'
        }
    ]
},{
    timestamps : true
})

const DirectMessageModel = mongoose.model('DirectMessage',messageSchema)
const ConversationModel = mongoose.model('Conversation',conversationSchema)

module.exports = {
    DirectMessageModel,
    ConversationModel
}
