import PropTypes from "prop-types";
import socket from "../../../../socket";
import axios from "axios"; // Ensure axios is imported
import { toast } from "sonner"; // Ensure toast is imported
import Lottie from "react-lottie"; // Ensure Lottie is imported
import EmojiPicker, { Emoji } from "emoji-picker-react";
import { useEffect, useRef, useState } from "react";
import { GrAttachment } from "react-icons/gr";
import { IoSend } from "react-icons/io5";
import { RiEmojiStickerLine } from "react-icons/ri";
import { FaImage } from "react-icons/fa"; // Added for image icon
import { animationDefaultOptions } from "@/lib/utils";

const EmptyChatContainer = ({ selectedChannel, messages }) => {
  // Declare hooks
  const emojiRef = useRef();
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

  const [newMessage, setNewMessage] = useState("");
  const [allMessages, setAllMessages] = useState(messages);
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (selectedChannel) {
      fetch(`http://localhost:3000/api/channels/${selectedChannel._id}/messages`)
        .then((res) => res.json())
        .then((data) => setAllMessages(data.messages || []))
        .catch((err) => console.error("Error fetching messages:", err));
    }

    const handleReceiveMessage = (message) => {
      if (message.channelId === selectedChannel?._id) {
        setAllMessages((prev) => [...prev, message]);
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [selectedChannel]);

  const handleSendMessage = async () => {
    if (!selectedChannel) return;
    if (!newMessage.trim() && !image) return;

    try {
      let imageUrl = null;
      if (image) {
        const {
          data: { signature, timestamp, cloudName, apiKey },
        } = await axios.post("http://localhost:3000/api/cloudinary/get-signature");

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
        channelId: selectedChannel._id,
        userId: "677ae2c7f845ed72198c6898", // Replace with actual userId
        content: newMessage.trim() || undefined,
        imageUrl: imageUrl || undefined,
      };

      const response = await fetch(
        `http://localhost:3000/api/channels/${selectedChannel._id}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(message),
        }
      );

      const data = await response.json();
      socket.emit("newMessage", data.message);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  const handleAddEmoji = (emoji) => {
    setNewMessage((msg) => msg + emoji.emoji);
  };

  if (!selectedChannel || !messages) {
    return (
      <div className="flex-1 md:bg-[#1c1d25] md:flex flex-col justify-center items-center hidden duration-1000 transition-all">
        <Lottie
          isClickToPauseDisabled={true}
          height={200}
          width={200}
          options={animationDefaultOptions}
        />
        <div className="text-opacity-80 text-white flex flex-col items-center gap-5 mt-10 lg:text-4xl text-3xl transition-all duration-300 text-center">
          <h3 className="poppins-medium">
            Hi<span className="text-purple-500">! </span>Welcome to
            <span className="text-purple-500"> Shadow</span> Talk
            <span className="text-purple-500">.</span>
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 md:bg-[#1c1d25] md:flex flex-col justify-center items-center hidden duration-1000 transition-all">
      {selectedChannel && (
        <>
          <h3 className="text-white text-xl mb-4">{selectedChannel.name}</h3>
          <div className="h-64 overflow-y-scroll border p-2 rounded mb-2">
            {allMessages.length > 0 ? (
              allMessages.map((msg) => (
                <div key={msg._id} className="mb-2">
                  <div className="font-bold">User: {msg.userId.name}</div>
                  <div>{msg.content}</div>
                  {msg.imageUrl && (
                    <img
                      src={msg.imageUrl}
                      alt="Message attachment"
                      className="w-32 h-32 mt-2"
                    />
                  )}
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500">No messages yet</div>
            )}
          </div>
          <div className="flex-1 flex bg-[#2a2b33] rounded-md items-center gap-5 pr-5">
            <button
              className="text-neutral-500 focus:outline-none duration-300 transition-all focus:text-white"
              onClick={() => document.getElementById('image-upload').click()}
            >
              <FaImage className="text-2xl" />
            </button>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setImage(e.target.files[0])}
            />
            <input
              type="text"
              placeholder="Type your message"
              className="flex-1 p-5 rounded-md bg-transparent focus:border-none focus:outline-none"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <div className="relative">
              <button
                className="text-neutral-500 focus:outline-none duration-300 transition-all focus:text-white"
                onClick={() => setEmojiPickerOpen(true)}
              >
                <RiEmojiStickerLine className="text-2xl" />
              </button>
              {emojiPickerOpen && (
                <div className="absolute bottom-16 right-0" ref={emojiRef}>
                  <EmojiPicker
                    theme="dark"
                    onEmojiClick={handleAddEmoji}
                    autoFocusSearch={false}
                  />
                </div>
              )}
            </div>
            <button
              className="bg-[#8417ff] flex items-center justify-center p-5 rounded-md focus:outline-none duration-300 transition-all hover:bg-[#741bda] focus:bg-[#741bda]"
              onClick={handleSendMessage}
            >
              <IoSend className="text-2xl" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default EmptyChatContainer;
