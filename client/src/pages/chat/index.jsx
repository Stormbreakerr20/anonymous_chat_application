import { useAppStore } from "@/store"
import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import { toast } from "sonner";
import socket from '../../socket';

const Chat = () => {

//   const {userInfo} = useAppStore();
//   const navigate = useNavigate();
//   useEffect(() => {
//     if(!userInfo.profileSetup){

//       toast("Please complete your profile setup");
//       navigate('/profile');
//     }
//   },[userInfo,navigate]);

  const [channels, setChannels] = useState([]);
    const [newChannelName, setNewChannelName] = useState('');
    const [newChannelDescription, setNewChannelDescription] = useState('');
    const [selectedChannel, setSelectedChannel] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    // Fetch channels on load
    useEffect(() => {
        fetch('http://localhost:3000/api/channels/')
            .then((res) => res.json())
            .then((data) => setChannels(data.channels))
            .catch((err) => console.error('Error fetching channels:', err));
    }, []);

    // Real-time updates
    useEffect(() => {
        socket.on('channelCreated', (channel) => {
            setChannels((prev) => [...prev, channel]);
        });

        socket.on('receiveMessage', (message) => {
            if (message.channelId === selectedChannel?._id) {
                setMessages((prev) => [...prev, message]);
            }
        });

        return () => {
            socket.off('channelCreated');
            socket.off('receiveMessage');
        };
    }, [selectedChannel]);

    // Create a new channel
    const handleCreateChannel = () => {
        if (!newChannelName || !newChannelDescription) {
            alert('Please fill in all fields');
            return;
        }

        fetch('http://localhost:3000/api/channels/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newChannelName, description: newChannelDescription }),
        })
            .then((res) => res.json())
            .then((data) => {
                socket.emit('newChannel', data.channel);
                setNewChannelName('');
                setNewChannelDescription('');
            })
            .catch((err) => console.error('Error creating channel:', err));
    };

    // Select a channel and fetch its messages
    const handleSelectChannel = (channel) => {
        setSelectedChannel(channel);
        fetch(`http://localhost:3000/api/channels/${channel._id}/messages`)
            .then((res) => res.json())
            .then((data) => setMessages(data.messages))
            .catch((err) => console.error('Error fetching messages:', err));
            console.log("message sent succesfull");
    };

    // Send a new message
    const handleSendMessage = () => {
        if (!newMessage) return;
        console.log(newMessage);
        fetch(`http://localhost:3000/api/channels/${selectedChannel._id}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: 'user123', content: newMessage }),
        })
            .then((res) => res.json())
            .then((data) => {
                socket.emit('newMessage', data.message);
                setNewMessage('');
            })
            .catch((err) => console.error('Error sending message:', err));
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-4">
                <h1 className="text-2xl font-bold text-center mb-4">Chat Channels</h1>
                {/* Create Channel Section */}
                <div className="mb-6">
                    <h2 className="text-lg font-bold mb-2">Create a New Channel</h2>
                    <input
                        className="w-full p-2 mb-2 border rounded"
                        placeholder="Channel Name"
                        value={newChannelName}
                        onChange={(e) => setNewChannelName(e.target.value)}
                    />
                    <input
                        className="w-full p-2 mb-2 border rounded"
                        placeholder="Channel Description"
                        value={newChannelDescription}
                        onChange={(e) => setNewChannelDescription(e.target.value)}
                    />
                    <button
                        className="w-full bg-blue-500 text-white p-2 rounded"
                        onClick={handleCreateChannel}
                    >
                        Create Channel
                    </button>
                </div>

                {/* Channel List */}
                <div className="mb-6">
                    <h2 className="text-lg font-bold mb-2">Available Channels</h2>
                    <ul className="space-y-2">
                        {channels.map((channel) => (
                            <li
                                key={channel._id}
                                className={`p-2 border rounded cursor-pointer ${
                                    selectedChannel?._id === channel._id ? 'bg-blue-100' : ''
                                }`}
                                onClick={() => handleSelectChannel(channel)}
                            >
                                <div className="font-bold">{channel.name}</div>
                                <div className="text-sm text-gray-600">{channel.description}</div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Messages Section */}
                {selectedChannel && (
                    <div>
                        <h2 className="text-lg font-bold mb-2">{selectedChannel.name}</h2>
                        <div className="h-64 overflow-y-scroll border p-2 rounded mb-2">
                            {messages.map((msg) => (
                                <div key={msg._id} className="mb-2">
                                    <div className="font-bold">User: {msg.userId}</div>
                                    <div>{msg.content}</div>
                                </div>
                            ))}
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
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat