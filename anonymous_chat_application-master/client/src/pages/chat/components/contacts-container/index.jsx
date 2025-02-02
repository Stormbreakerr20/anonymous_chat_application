import React, { useState ,useEffect} from "react";
import NewDM from "./components/new-dm";
import ProfileInfo from "./components/profile-info";
import socket from "../../../../socket";
const Logo = () => {
  return (
    <div className="flex p-5 justify-start items-center gap-2">
      <svg
        id="logo-38"
        width="78"
        height="32"
        viewBox="0 0 78 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M55.5 0H77.5L58.5 32H36.5L55.5 0Z"
          className="ccustom"
          fill="#8338ec"
        ></path>
        <path
          d="M35.5 0H51.5L32.5 32H16.5L35.5 0Z"
          className="ccompli1"
          fill="#975aed"
        ></path>
        <path
          d="M19.5 0H31.5L12.5 32H0.5L19.5 0Z"
          className="ccompli2"
          fill="#a16ee8"
        ></path>
      </svg>
      <span className="text-3xl font-semibold ">Shadow</span>
    </div>
  );
};

const ContactsContainer = ({ dms, channels, onSelect }) => {
  const [showDMs, setShowDMs] = useState(false); // Toggle for DM dropdown
  const [showChannels, setShowChannels] = useState(false); // Toggle for Channels dropdown
  const [searchQuery, setSearchQuery] = useState(""); // Search query for DMs

  // Filter DMs based on search
  const filteredDMs = dms.filter((dm) =>
    dm.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle selecting a contact (direct message)
  const handleSelectingContact = (contact) => {
    onSelect("dm", contact); // Trigger the parent `onSelect`
  };
  
   useEffect(() => {

    socket.on('channelToDM', (userId) => {
      handleSelectingContact(userId)
    });

    // Clean up the listener when the component unmounts
    return () => {
      socket.off('channelToDM');
    };
  }, []);
  return (
    <div className="relative md:w-[40vw] lg:w-[35vw] xl:w-[25vw] h-full bg-[#1b1c24] border-r-2 border-[#2f303b] w-full">
      <div className="pt-3">
        <Logo />
      </div>

      {/* Direct Messages Section */}
      <div className="my-5">
        <div className="flex items-center justify-between px-4">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setShowDMs((prev) => !prev)} // Toggle DM dropdown
          >
            <Title text="Direct Messages" />
            <span className="text-neutral-400">{showDMs ? "▼" : "►"}</span>
          </div>
          <NewDM onSelecting={handleSelectingContact} />
        </div>
        {showDMs && (
          <div className="mt-3 bg-[#2a2b36] p-3 rounded-lg max-h-[300px] overflow-y-auto">
            {/* Search Bar for DMs */}
            <input
              type="text"
              placeholder="Search DMs"
              className="w-full p-2 bg-[#33363b] rounded text-white mb-3"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {/* DM List */}
            <div className="space-y-2">
              {filteredDMs.map((dm) => (
                <div
                  key={dm._id}
                  className="p-2 bg-[#3a3b47] hover:bg-[#4a4b57] rounded cursor-pointer"
                  onClick={() => onSelect("dm", dm._id)}
                >
                  <div className="font-bold text-white">{dm.name}</div>
                  <div className="text-sm text-gray-400">DM</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Channels Section */}
      <div className="my-5">
        <div
          className="flex items-center justify-between px-4 cursor-pointer"
          onClick={() => setShowChannels((prev) => !prev)} // Toggle Channels dropdown
        >
          <div className="flex items-center gap-2">
            <Title text="Channels" />
            <span className="text-neutral-400">{showChannels ? "▼" : "►"}</span>
          </div>
        </div>
        {showChannels && (
          <div className="mt-3 bg-[#2a2b36] p-3 rounded-lg max-h-[300px] overflow-y-auto">
            {/* Channel List */}
            <div className="space-y-2">
              {channels.map((channel) => (
                <div
                  key={channel._id}
                  className="p-2 bg-[#3a3b47] hover:bg-[#4a4b57] rounded cursor-pointer"
                  onClick={() => onSelect("channel", channel._id, channel.name)}
                >
                  <div className="font-bold text-white">{channel.name}</div>
                  <div className="text-sm text-gray-400">{channel.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ProfileInfo />
    </div>
  );
};

export default ContactsContainer;

const Title = ({ text }) => {
  return (
    <h6 className="uppercase tracking-widest text-neutral-400 font-light text-opacity-90 text-sm">
      {text}
    </h6>
  );
};
