import { useAppStore } from "@/store";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ContactsContainer from "./components/contacts-container";
import EmptyChatContainer from "./components/empty-chat-container";
import io from "socket.io-client";
import socket from "../../socket";
import './index.css';

const Chat = () => {
  const { userInfo } = useAppStore();
  const navigate = useNavigate();
  const { setOnlineUser, setSocket } = useAppStore(); 

  const [channels, setChannels] = useState([]);
  const [dms, setDms] = useState([]); // Separate state for DMs
  const [selectedInfo, setSelectedInfo] = useState({ type: null, id: null ,name:null});
 // Selected item info
  // const [messages, setMessages] = useState([]);
  console.log(selectedInfo);
  useEffect(() => {
    if (!userInfo.profileSetup) {
      toast("Please complete your profile setup");
      navigate("/profile");
    }
  }, [userInfo, navigate]);

  // Fetch channels and DMs on load
  useEffect(() => {
    // Fetch channels
    fetch("http://localhost:3000/api/channels/")
      .then((res) => res.json())
      .then((data) => setChannels(data.channels || []))
      .catch((err) => console.error("Error fetching channels:", err));

    socket.emit("sidebar", { userId: userInfo.id });

    // Listen for the response with conversation data
    socket.on("conversation", (conversations) => {
      console.log("Recent conversations:", conversations);
      const formattedUsers = conversations.map((conv) => {
        const otherUser = conv.sender._id === userInfo.id ? conv.receiver : conv.sender;
        return {
          id: otherUser._id,
          name: `${otherUser.firstName} ${otherUser.lastName}`,
          unseenMsg: conv.unseenMsg,
          lastMsg: conv.lastMsg.text
        };
      });
      // console.log(formattedUsers)
      // console.log("dms",dms)
      setDms(formattedUsers)
      // Fetch DMs (Replace the endpoint with your actual DMs endpoint)
      // fetch("http://localhost:3000/api/dms/")
      //   .then((res) => res.json())
      //   .then((data) => setDms(data.dms || []))
      //   .catch((err) => console.error("Error fetching DMs:", err));
    });
  }, []);


  useEffect(() => {
    const socketConnection = io(import.meta.env.VITE_HOST, {
      withCredentials: true,
    });

    // Set socket connection in Zustand store
    setSocket(socketConnection);

    socketConnection.on("onlineUser", (data) => {
      console.log(data);
      setOnlineUser(data);
    });

    // Cleanup: disconnect socket on component unmount
    return () => {
      socketConnection.disconnect();
    };
  }, [setSocket, setOnlineUser]);

  // Handle selecting a DM or channel
  const handleSelect = (type, id,name) => {
    // const selectedItem = type === "dm" ? dms.find((dm) => dm._id === id) : channels.find((channel) => channel._id === id);
    // console.log(type)
    
    setSelectedInfo({ type, id ,name});
    // const endpoint = type === "dm" ? `/api/dms/${id}/messages` : `/api/channels/${id}/messages`;

    // fetch(`http://localhost:3000${endpoint}`)
    //   .then((res) => res.json())
    //   .then((data) => setMessages(data.messages || []))
    //   .catch((err) => console.error("Error fetching messages:", err));
  };

  return (
    <div className="chat-container">
      <div className={`chat-sidebar ${selectedInfo.type ? 'chat-sidebar--hidden lg:block' : ''}`}>
        <ContactsContainer 
          channels={channels} 
          dms={dms} 
          onSelect={handleSelect} 
        />
      </div>

      <div className={`chat-main ${selectedInfo.type ? 'chat-main--active' : ''}`}>
        <EmptyChatContainer 
          selectedInfo={selectedInfo} 
        />
      </div>
    </div>
  );
};

export default Chat;
