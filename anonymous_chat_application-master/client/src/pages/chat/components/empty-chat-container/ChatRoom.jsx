import React, { useEffect, useState, useRef } from "react";
import socket from "../../../../socket";
import { toast } from "sonner";
import moment from "moment";
import axios from "axios";
import { useAppStore } from "@/store";
import Avatar from "./Avatar";
import { Link, useParams } from 'react-router-dom'
import { FaAngleLeft } from "react-icons/fa6";

const ChatRoom = ({ selectedInfo}) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const { userInfo } = useAppStore();
  const currentUserId = userInfo?.id?.toString();
  const [image, setImage] = useState(null);
  const lastMessageRef = useRef(null);
  const channelId = selectedInfo.id;
  const channelName = selectedInfo.name;
  const [dmPrompt, setDmPrompt] = useState({ show: false, username: "", userId: null }); // DM prompt state

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

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [channelId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !image) return;

    try {
      let imageUrl = null;
      if (image) {
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
      socket.emit("newMessage", data.message);
      setNewMessage("");
      setImage(null);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

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
    socket.emit('channelToDm',userInfo.id,userId)
    // console.log(userInfo.id,userId)
    setDmPrompt({ show: false, username: "", userId: null }); // Close the prompt
    // toast.success(`DM sent to ${username}!`);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#1c1d25]">
      {/* Header Section */}
      <div className="bg-[#2a2b36] p-4 flex items-center justify-between rounded-t-lg">
      
        <Avatar
          name={channelName}
          width={50}
          height={50}
          imageUrl={channelId?.profile_pic}
        />
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto bg-[#262831] p-4 space-y-4">
        {messages.length > 0 ? (
          messages.map((msg) => {
            const isCurrentUser =
              msg.userId._id === currentUserId || msg.userId === currentUserId;
            const displayName = isCurrentUser
              ? "You"
              : msg.userName || "Unknown User";

            return (
              <div
                key={msg._id}
                className={`flex ${
                  isCurrentUser ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`relative max-w-[70%] p-3 rounded-lg ${
                    isCurrentUser
                      ? "bg-purple-500 text-white"
                      : "bg-[#2a2b36] text-white"
                  }`}
                >
                  {/* Triangle for chat bubble */}
                  <div
                    className={`absolute top-0 w-4 h-4 ${
                      isCurrentUser
                        ? "-right-2 border-l-8 border-l-purple-500 border-t-8 border-t-transparent"
                        : "-left-2 border-r-8 border-r-[#2a2b36] border-t-8 border-t-transparent"
                    }`}
                  />
                  <div
                    className="font-bold text-sm cursor-pointer hover:underline"
                    onClick={() =>
                      !isCurrentUser &&
                      setDmPrompt({
                        show: true,
                        username: msg.userName,
                        userId: msg.userId,
                      })
                    }
                  >
                    {displayName}
                  </div>
                  <div className="mt-1 text-base break-words">{msg.content}</div>
                  {msg.imageUrl && (
                    <img
                      src={msg.imageUrl}
                      alt="Message attachment"
                      className="w-32 h-32 mt-2 rounded-md object-cover"
                    />
                  )}
                  <div className="mt-1 text-xs text-gray-300 text-right">
                    {moment(msg.createdAt).format("h:mm A")}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-gray-500">No messages yet</div>
        )}

        {/* Reference to the last message */}
        <div ref={lastMessageRef} />
      </div>

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

      {/* Input Section */}
      <div className="bg-[#2a2b36] p-4 flex items-center gap-3 rounded-b-lg">
        <input
          className="flex-1 p-3 bg-[#33343f] text-white rounded-lg outline-none placeholder-gray-400"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleSendMessage();
            }
          }}
        />
        <label className="bg-blue-500 text-white p-2 rounded cursor-pointer">
          Upload Image
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setImage(e.target.files[0])}
          />
        </label>
        {image && <span className="text-white">{image.name}</span>}
        <button
          className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-all"
          onClick={handleSendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;
