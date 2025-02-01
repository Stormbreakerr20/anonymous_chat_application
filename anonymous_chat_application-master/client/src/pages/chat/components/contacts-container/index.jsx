import React, { useState, useEffect } from "react";
import './index.css';
import NewDM from "./components/new-dm";
import ProfileInfo from "./components/profile-info";
import socket from "../../../../socket";

const Logo = () => {
  return (
    <div className="logo-container">
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
      <span className="logo-text">Shadow</span>
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
    <div className="contacts-container">
      <div className="contacts-header">
        <div className="mobile-header">
          <Logo />
        </div>
      </div>

      <div className="contacts-scroll-area">
        {/* Direct Messages Section */}
        <div className="section-container">
          <div className="section-header">
            <div className="section-title-container" onClick={() => setShowDMs((prev) => !prev)}>
              <Title text="Direct Messages" />
              <span className="text-neutral-400">{showDMs ? "▼" : "►"}</span>
            </div>
            <div className="add-contact-button">
              <NewDM onSelecting={handleSelectingContact} />
            </div>
          </div>
          {showDMs && (
            <div className="dropdown-content">
              <input
                type="text"
                placeholder="Search DMs"
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="item-list">
                {filteredDMs.map((dm) => (
                  <div
                    key={dm._id}
                    className="list-item"
                    onClick={() => onSelect("dm", dm.id)}
                  >
                    <div className="item-title">{dm.name}</div>
                    <div className="item-subtitle">DM</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Channels Section */}
        <div className="section-container">
          <div className="section-header">
            <div className="section-title-container" onClick={() => setShowChannels((prev) => !prev)}>
              <Title text="Channels" />
              <span className="text-neutral-400">{showChannels ? "▼" : "►"}</span>
            </div>
          </div>
          {showChannels && (
            <div className="dropdown-content">
              <div className="item-list">
                {channels.map((channel) => (
                  <div
                    key={channel._id}
                    className="list-item"
                    onClick={() => onSelect("channel", channel._id, channel.name)}
                  >
                    <div className="item-title">{channel.name}</div>
                    <div className="item-subtitle">{channel.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="contacts-footer">
        <ProfileInfo />
      </div>
    </div>
  );
};

const Title = ({ text }) => {
  return <h6 className="section-title">{text}</h6>;
};

export default ContactsContainer;
