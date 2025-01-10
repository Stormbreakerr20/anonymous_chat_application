import { useEffect, useState } from "react";
import PropTypes from 'prop-types';
import socket from '../../../../socket';
import Lottie from 'react-lottie'; // Make sure to import Lottie
import { animationDefaultOptions } from "@/lib/utils";

const EmptyChatContainer = ({ selectedChannel, messages }) => {

  // Declare hooks at the top level
  const [newMessage, setNewMessage] = useState('');
  const [allMessages, setAllMessages] = useState(messages);

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
    socket.on('receiveMessage', handleReceiveMessage);

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
    };
  }, [selectedChannel]);

  // Handle sending a new message
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChannel) return;

    const message = {
      channelId: selectedChannel._id,
      userId: "677ae2c7f845ed72198c6898", // Replace with actual userId
      content: newMessage,
    };

    fetch(`http://localhost:3000/api/channels/${selectedChannel._id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    })
      .then((res) => res.json())
      .then((data) => {
        socket.emit('newMessage', data.message);
        setNewMessage('');
      })
      .catch((err) => console.error('Error sending message:', err));
  };

  // Render fallback UI if no channel or messages
  if (!selectedChannel || !messages) {
    return (
      <div className="flex-1 md:bg-[#1c1d25] md:flex flex-col justify-center items-center hidden duration-1000 transition-all">
        <Lottie
          isClickToPauseDisabled={true}
          height={200}
          width={200}
          options={animationDefaultOptions} // Make sure you define your animation options here
        />
        <div className="text-opacity-80 text-white flex flex-col items-center gap-5 mt-10 lg:text-4xl text-3xl transition-all duration-300 text-center">
          <h3 className="poppins-medium">
            Hi<span className="text-purple-500">! </span>Welcome to
            <span className="text-purple-500"> Shadow</span> Talk<span className="text-purple-500">.</span>
          </h3>
        </div>
      </div>
    );
  }

  // Render the chat container if the channel is selected
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
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500">No messages yet</div>
            )}
          </div>
          <input
            className="w-full p-2 border rounded mb-2"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button
            className="w-full bg-green-500 text-white p-2 rounded"
            onClick={handleSendMessage}
          >
            Send Message
          </button>
        </>
      )}
    </div>
  );
};

// PropTypes validation
EmptyChatContainer.propTypes = {
  selectedChannel: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }),
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      userId: PropTypes.shape({
        name: PropTypes.string,
      }).isRequired,
      content: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default EmptyChatContainer;
