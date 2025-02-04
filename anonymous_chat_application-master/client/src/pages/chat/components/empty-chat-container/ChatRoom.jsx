import React, { useEffect, useState, useRef } from "react";
import socket from "../../../../socket";
import { toast } from "sonner";
import moment from "moment";
import axios from "axios";
import { useAppStore } from "@/store";
import Avatar from "./Avatar";
import { FaTrash } from 'react-icons/fa';
import { Link, useParams } from 'react-router-dom'
import { FaAngleLeft } from "react-icons/fa6";
import { IoMdClose } from "react-icons/io"; // Add this import
import { FaPlus } from "react-icons/fa6";
import { IoMdSend } from "react-icons/io";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import './ChatRoom.css';

const ChatRoom = ({ selectedInfo }) => {
  // Add loading state
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const { userInfo } = useAppStore();
  const currentUserId = userInfo?.id?.toString();
  const [image, setImage] = useState(null);
  const lastMessageRef = useRef(null);
  const channelId = selectedInfo.id;
  const channelName = selectedInfo.name;
  const [dmPrompt, setDmPrompt] = useState({ show: false, username: "", userId: null }); // DM prompt state
  const [deletePrompt, setDeletePrompt] = useState({ show: false, messageId: null });
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3000/api/channels/${channelId}/messages`)
      .then((res) => res.json())
      .then((data) => {
        const normalizedMessages = data.messages.map((msg) => ({
          ...msg,
          userId: msg.userId,
          userName: msg.userId.firstName + " " + msg.userId.lastName || "Unknown User",
        }));

        setMessages(normalizedMessages);
      })
      .catch((err) => console.error("Error fetching messages:", err));

    const handleReceiveMessage = (message) => {
      if (message.channelId === channelId) {
        setMessages((prev) => [
          ...prev,
          {
            ...message,
            userId: message.userId,
            userName: message.userName || "Unknown User",
          },
        ]);
      }
    };
    const handleDelete=(msgId)=>{
      setMessages((prevMessages) => prevMessages.filter(msg => msg._id !== msgId));
    }
    socket.on("receiveMessage", handleReceiveMessage);
    socket.on('deleteMessage',handleDelete);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("deleteMessage", handleDelete);
    };
  }, [channelId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !image) return;
    if (isSubmitting) return; // Prevent multiple submissions

    try {
      setIsSubmitting(true); // Lock submission
      let imageUrl = null;

      if (image) {
        setLoading(true); // Set loading to true when upload starts
        const { data: { signature, timestamp, cloudName, apiKey } } = await axios.post("http://localhost:3000/api/cloudinary/get-signature");

        const formData = new FormData();
        formData.append("file", image);
        formData.append("timestamp", timestamp);
        formData.append("api_key", apiKey);
        formData.append("signature", signature);

        const uploadResponse = await axios.post(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          formData
        );

        imageUrl = uploadResponse.data.secure_url;
        toast.success("Image uploaded successfully!");
        setImage(null);
        setLoading(false); // Set loading to false after upload completes
      }

      const message = {
        channelId: channelId,
        userId: currentUserId,
        content: newMessage.trim() || undefined,
        imageUrl: imageUrl || undefined,
      };

      const response = await fetch(
        `http://localhost:3000/api/channels/${channelId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(message),
        }
      );

      const data = await response.json();
      
      // Only emit the message once
      if (response.ok) {
        socket.emit("newMessage", data.message);
        setNewMessage("");
        setImage(null);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
      setIsSubmitting(false); // Unlock submission
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await axios.delete(`http://localhost:3000/api/channels/${selectedInfo.id}/messages/${messageId}`, {
        data: { userId: userInfo.id }
      });
      
      // Emit deletion event with both message ID and channel ID
      socket.emit('deletion', messageId, channelId);
      setDeletePrompt({ show: false, messageId: null });
      toast.success('Message deleted successfully');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  useEffect(() => {
    // ...existing socket event listeners...

    const handleDelete = (data) => {
      if (data.channelId === channelId) {
        setMessages((prevMessages) => prevMessages.filter(msg => msg._id !== data.msgId));
      }
    };

    socket.on('deleteMessage', handleDelete);
    socket.on('deletionError', (error) => {
      toast.error(error.error || 'Failed to delete message');
    });

    return () => {
      socket.off('deleteMessage', handleDelete);
      socket.off('deletionError');
    };
  }, [channelId]);

  // Scroll to the last message
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  // Handle DM prompt submission
  const handleSendDm = (username, userId) => {
    console.log(`Send DM to ${username} with ID ${userId}`);
    // You can implement actual DM functionality here
    // selectingDM(userId);
    socket.emit('channelToDM',userInfo.id,userId)
    // console.log(userInfo.id,userId)
    setDmPrompt({ show: false, username: "", userId: null }); // Close the prompt
    // toast.success(`DM sent to ${username}!`);
  };

  const renderDateSeparator = (date) => (
    <div className="flex items-center justify-center my-4">
      <div className="bg-[#2a2b36] px-4 py-1 rounded-full text-xs text-gray-400">
        {moment(date).calendar(null, {
          sameDay: '[Today]',
          lastDay: '[Yesterday]',
          lastWeek: 'dddd',
          sameElse: 'MMMM D, YYYY'
        })}
      </div>
    </div>
  );

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(msg => {
      const date = moment(msg.createdAt).format('YYYY-MM-DD');
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });
    return groups;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!isSubmitting) {
      handleSendMessage();
    }
  };

  return (
    <div className="chatroom-container">
      <div className="chatroom-header">
        <Link to="/" className="back-button">
          <FaAngleLeft size={25} />
        </Link>
        <Avatar
          name={channelName}
          width={50}
          height={50}
          imageUrl={channelId?.profile_pic}
        />
      </div>

      {/* Message List - Updated message bubble styling */}
      <div className="messages-container">
        {messages.length > 0 ? (
          Object.entries(groupMessagesByDate(messages)).map(([date, dateMessages]) => (
            <div key={date}>
              <div className="date-separator">
                <div className="date-label">
                  {moment(date).calendar(null, {
                    sameDay: '[Today]',
                    lastDay: '[Yesterday]',
                    lastWeek: 'dddd',
                    sameElse: 'MMMM D, YYYY'
                  })}
                </div>
              </div>
              {dateMessages.map((msg) => {
                const isCurrentUser = msg.userId._id === currentUserId || msg.userId === currentUserId;
                const displayName = isCurrentUser ? "You" : msg.userName || "Unknown User";

                return (
                  <div key={msg._id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} mb-4`}>
                    <div className={`relative max-w-[70%] w-fit ${isCurrentUser ? "bg-purple-500" : "bg-[#2a2b36]"} 
                      rounded-2xl p-4 shadow-lg transform transition-all duration-200 hover:scale-[1.02]`}
                    >
                      <div className="font-bold text-sm text-white/90 cursor-pointer hover:underline mb-1"
                        onClick={() => !isCurrentUser && setDmPrompt({
                          show: true,
                          username: msg.userName,
                          userId: msg.userId,
                        })}
                      >
                        {displayName}
                      </div>
                      
                      {msg.content && (
                        <div className="text-white/95 text-base break-words mb-2 w-full">
                          <p style={{ 
                            overflowWrap: 'break-word', 
                            wordBreak: 'break-word',
                            whiteSpace: 'pre-wrap',
                            maxWidth: '100%',
                            hyphens: 'auto'
                          }}>
                            {msg.content}
                          </p>
                        </div>
                      )}

                      {msg.imageUrl && (
                        <div className="mt-2 cursor-pointer" onClick={() => setSelectedImage(msg.imageUrl)}>
                          <img
                            src={msg.imageUrl}
                            alt="Message attachment"
                            className="rounded-lg w-64 h-64 object-cover hover:opacity-90 transition-opacity"
                          />
                        </div>
                      )}

                      <div className="text-xs text-white/70 text-right mt-1">
                        {moment(msg.createdAt).format("h:mm A")}
                      </div>

                      {isCurrentUser && (
                        <button
                          className="absolute -top-2 -right-2 text-red-500 hover:text-red-700 bg-[#262831] rounded-full p-1"
                          onClick={() => setDeletePrompt({ show: true, messageId: msg._id })}
                        >
                          <FaTrash size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500">No messages yet</div>
        )}
        <div ref={lastMessageRef} />
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}>
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <IoMdClose size={32} />
          </button>
          <img
            src={selectedImage}
            alt="Full size"
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />
        </div>
      )}

      {deletePrompt.show && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
    <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full mt-10">
      <h3 className="text-lg font-bold mb-6 text-gray-800 text-center">
        Are you sure you want to delete this message?
      </h3>
      <div className="flex justify-center gap-4">
        <button
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg shadow-md transition-all"
          onClick={() => {
            handleDeleteMessage(deletePrompt.messageId);
            setDeletePrompt({ show: false, messageId: null });
          }}
        >
          Yes, Delete
        </button>
        <button
          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg shadow-md transition-all"
          onClick={() => setDeletePrompt({ show: false, messageId: null })}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

      {/* DM Prompt */}
      {dmPrompt.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
  <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full">
    <h3 className="text-lg font-bold mb-6 text-gray-800 text-center">
      You are about to send a DM to <span className="text-purple-600">{dmPrompt.username}</span>
    </h3>
    <div className="flex justify-center gap-4">
      <button
        className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg shadow-md transition-all"
        onClick={() => handleSendDm(dmPrompt.username, dmPrompt.userId)}
      >
        Send DM
      </button>
      <button
        className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg shadow-md transition-all"
        onClick={() => setDmPrompt({ show: false, username: "", userId: null })}
      >
        Cancel
      </button>
    </div>
  </div>
</div>

      )}

      {/* Upload Preview */}
      {image && (
        <div className="fixed bottom-24 left-[21%] flex justify-start items-center w-full">
          <div className="relative bg-purple-900 p-1 rounded-lg shadow-md max-w-lg">
            <button
              onClick={() => setImage(null)}
              className="absolute top-2 right-2 text-red-500"
            >
              <IoMdClose size={20} />
            </button>
            <img
              src={URL.createObjectURL(image)}
              alt="Upload Preview"
              className="w-full rounded-md object-contain"
            />
          </div>
        </div>
      )}

      {/* Input Section */}
      <div className="h-20 bg-[#262831] flex items-center px-4">
        <div className="relative">
          <label className="inline-flex items-center justify-center w-10 h-10 bg-purple-500 rounded-full hover:bg-purple-600 cursor-pointer transition-colors">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => !isSubmitting && setImage(e.target.files[0])}
              disabled={isSubmitting}
            />
            {loading ? (
              <AiOutlineLoading3Quarters className="animate-spin text-white" size={20} />
            ) : (
              <FaPlus className="text-white" size={16} />
            )}
          </label>
        </div>
        <form className="flex-1 flex items-center ml-4" onSubmit={handleFormSubmit}>
          <input
            type="text"
            placeholder="Type your message..."
            className="w-full p-3 rounded-lg bg-[#2a2b36] text-white outline-none"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isSubmitting}
          />
          <button 
            className="ml-2 text-purple-500 hover:text-purple-600"
            disabled={isSubmitting}
          >
            <IoMdSend size={25} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatRoom;
