// import React, { useState, useEffect } from 'react';
// import socket from '../../socket';

// const Chat = () => {
//     const [channels, setChannels] = useState([]);
//     const [newChannelName, setNewChannelName] = useState('');
//     const [newChannelDescription, setNewChannelDescription] = useState('');
//     const [selectedChannel, setSelectedChannel] = useState(null);
//     const [messages, setMessages] = useState([]);
//     const [newMessage, setNewMessage] = useState('');
//     const [loadingMessages, setLoadingMessages] = useState(false);

//     // Fetch channels on load
//     useEffect(() => {
//         fetch('http://localhost:3000/api/channels/')
//             .then((res) => res.json())
//             .then((data) => setChannels(data.channels || []))
//             .catch((err) => console.error('Error fetching channels:', err));
//     }, []);

//     // Real-time updates with Socket.IO
//     useEffect(() => {
//         const handleChannelCreated = (channel) => {
//             setChannels((prev) => [...prev, channel]);
//         };

//         const handleReceiveMessage = (message) => {
//             if (message.channelId === selectedChannel?._id) {
//                 setMessages((prev) => [...prev, message]);
//             }
//         };

//         socket.on('channelCreated', handleChannelCreated);
//         socket.on('receiveMessage', handleReceiveMessage);
        
//         return () => {
//             socket.off('channelCreated', handleChannelCreated);
//             socket.off('receiveMessage', handleReceiveMessage);
//         };
//     }, [selectedChannel]);

//     // Create a new channel
//     const handleCreateChannel = () => {
//         if (!newChannelName || !newChannelDescription) {
//             alert('Please fill in all fields');
//             return;
//         }

//         fetch('http://localhost:3000/api/channels/', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ name: newChannelName, description: newChannelDescription }),
//         })
//             .then((res) => res.json())
//             .then((data) => {
//                 socket.emit('newChannel', data.channel);
//                 setNewChannelName('');
//                 setNewChannelDescription('');
//             })
//             .catch((err) => console.error('Error creating channel:', err));
//     };

//     // Select a channel and fetch its messages
//     const handleSelectChannel = (channel) => {
//         if (selectedChannel?._id === channel._id) return;
//         setSelectedChannel(channel);
//         setLoadingMessages(true);

//         fetch(`http://localhost:3000/api/channels/${channel._id}/messages`)
//             .then((res) => res.json())
//             .then((data) => {
//                 setMessages(data.messages || []);
//                 setLoadingMessages(false);
//             })
//             .catch((err) => {
//                 console.error('Error fetching messages:', err);
//                 setMessages([]);
//                 setLoadingMessages(false);
//             });
//     };

//     // Send a new message
//     const handleSendMessage = () => {
//         if (!newMessage.trim()) return;

//         fetch(`http://localhost:3000/api/channels/${selectedChannel._id}/messages`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//                 userId: '677ae2c7f845ed72198c6898', // Replace with actual userId
//                 content: newMessage,
//             }),
//         })
//             .then((res) => res.json())
//             .then((data) => {
//                 socket.emit('newMessage', data.message); // Emit message to other clients
//                 // setMessages((prev) => [...prev, data.message]); // Optimistically update UI
//                 setNewMessage('');
//             })
//             .catch((err) => console.error('Error sending message:', err));
//     };

    
//     return (
//         <div className="min-h-screen bg-gray-100 p-6">
//             <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-4">
//                 <h1 className="text-2xl font-bold text-center mb-4">Chat Channels</h1>

//                 {/* Create Channel Section */}
//                 <div className="mb-6">
//                     <h2 className="text-lg font-bold mb-2">Create a New Channel</h2>
//                     <input
//                         className="w-full p-2 mb-2 border rounded"
//                         placeholder="Channel Name"
//                         value={newChannelName}
//                         onChange={(e) => setNewChannelName(e.target.value)}
//                     />
//                     <input
//                         className="w-full p-2 mb-2 border rounded"
//                         placeholder="Channel Description"
//                         value={newChannelDescription}
//                         onChange={(e) => setNewChannelDescription(e.target.value)}
//                     />
//                     <button
//                         className="w-full bg-blue-500 text-white p-2 rounded"
//                         onClick={handleCreateChannel}
//                     >
//                         Create Channel
//                     </button>
//                 </div>

//                 {/* Channel List */}
//                 <div className="mb-6">
//                     <h2 className="text-lg font-bold mb-2">Available Channels</h2>
//                     <ul className="space-y-2">
//                         {channels.map((channel) => (
//                             <li
//                                 key={channel._id}
//                                 className={`p-2 border rounded cursor-pointer ${
//                                     selectedChannel?._id === channel._id ? 'bg-blue-100' : ''
//                                 }`}
//                                 onClick={() => handleSelectChannel(channel)}
//                             >
//                                 <div className="font-bold">{channel.name}</div>
//                                 <div className="text-sm text-gray-600">{channel.description}</div>
//                             </li>
//                         ))}
//                     </ul>
//                 </div>

//                 {/* Messages Section */}
//                 {selectedChannel && (
//     <div>
//         <h2 className="text-lg font-bold mb-2">{selectedChannel.name}</h2>
//         {loadingMessages ? (
//             <div className="text-center p-4">Loading messages...</div>
//         ) : (
//             <div className="h-64 overflow-y-scroll border p-2 rounded mb-2">
//                 {messages.length > 0 ? (
//                     messages.map((msg) => (
//                         <div key={msg._id} className="mb-2">
//                             <div className="font-bold">User: {msg.userId.name}</div> {/* Ensure userId is accessed properly */}
//                             <div>{msg.content}</div>
//                         </div>
//                     ))
//                 ) : (
//                     <div className="text-center text-gray-500">No messages yet</div>
//                 )}
//             </div>
//         )}
//         <input
//             className="w-full p-2 border rounded mb-2"
//             placeholder="Type your message..."
//             value={newMessage}
//             onChange={(e) => setNewMessage(e.target.value)}
//         />
//         <button
//             className="w-full bg-green-500 text-white p-2 rounded"
//             onClick={handleSendMessage}
//         >
//             Send Message
//         </button>
//     </div>
// )}


//             </div>
//         </div>
//     );
// };

// export default Chat;

import { useAppStore } from "@/store";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ContactsContainer from "./components/contacts-container";
import EmptyChatContainer from "./components/empty-chat-container";
import axios from 'axios';
import io from 'socket.io-client';
import ChatContainer from "./components/chat-container";
// import { useAppStore } from "@/store";

const Chat = () => {
  const { userInfo } = useAppStore();
  const navigate = useNavigate();
  const { setOnlineUser,setSocket} = useAppStore(); 
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [image, setImage] = useState(null); // For storing the selected image

  useEffect(() => {
    if (!userInfo.profileSetup) {
      toast("Please complete your profile setup");
      navigate('/profile');
    }
  }, [userInfo, navigate]);

  // Fetch channels on load
  useEffect(() => {
    fetch("http://localhost:3000/api/channels/")
      .then((res) => res.json())
      .then((data) => setChannels(data.channels || []))
      .catch((err) => console.error("Error fetching channels:", err));
  }, []);

  useEffect(() => {
    const socketConnection = io(import.meta.env.VITE_HOST, {
      withCredentials: true,
    });
    console.log("socket is:", socketConnection)
    // Set socket connection in Zustand store
    setSocket(socketConnection);

     socketConnection.on('onlineUser',(data)=>{
      console.log(data)
      setOnlineUser(data)
    })


    // Cleanup: disconnect socket on component unmount
    // return () => {
    //   socketConnection.disconnect();
    // };
  }, [setSocket, setOnlineUser]);

  // Handle selecting a channel and fetching its messages
  const handleSelectChannel = (channel) => {
    setSelectedChannel(channel);
    fetch(`http://localhost:3000/api/channels/${channel._id}/messages`)
      .then((res) => res.json())
      .then((data) => setMessages(data.messages || []))
      .catch((err) => console.error("Error fetching messages:", err));
  };

  
  return (
    <div className="flex flex-row h-[100vh] text-white overflow-hidden">
      {/* Pass selectedChannel and handleSelectChannel to ContactsContainer */}
      <ContactsContainer 
        channels={channels} 
        onSelectChannel={handleSelectChannel} 
      />

      {/* Pass selectedChannel and messages to EmptyChatContainer */}
      {/* <EmptyChatContainer 
        selectedChannel={selectedChannel} 
        messages={messages} 
      /> */}
      <ChatContainer></ChatContainer>

      
    </div>
  );
};

export default Chat;
