import { useAppStore } from "@/store";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ContactsContainer from "./components/contacts-container";
import EmptyChatContainer from "./components/empty-chat-container";
import io from "socket.io-client";

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

    // Fetch DMs (Replace the endpoint with your actual DMs endpoint)
    // fetch("http://localhost:3000/api/dms/")
    //   .then((res) => res.json())
    //   .then((data) => setDms(data.dms || []))
    //   .catch((err) => console.error("Error fetching DMs:", err));
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
    <div className="flex h-[100vh] text-white overflow-hidden">
      {/* Pass channels, DMs, and onSelect function to ContactsContainer */}
      <ContactsContainer 
        channels={channels} 
        dms={dms} 
        onSelect={handleSelect} 
      />

      {/* Pass selectedInfo and messages to EmptyChatContainer */}
      <EmptyChatContainer 
        selectedInfo={selectedInfo} 
      />
    </div>
  );
};

export default Chat;
