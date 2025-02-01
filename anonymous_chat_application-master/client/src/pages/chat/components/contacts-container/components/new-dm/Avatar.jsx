import React, { useEffect, useState } from "react";
import { PiUserCircle } from "react-icons/pi";
import { useAppStore } from "@/store";
import socket from "../../../../../../socket";
import './Avatar.css';

const Avatar = ({ userId, name, imageUrl, width, height, handleOnline }) => {
  const onlineUsers = useAppStore((state) => state.onlineUser);
  const [isOnline, setIsOnline] = useState(false);
  
  // Get initials from name
  const getInitials = (name) => {
    if (!name) return "?";
    
    const words = name.trim().split(/\s+/);
    if (words.length === 0) return "?";
    
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  const avatarName = getInitials(name);

  // Set online status and pass the update to the parent
  useEffect(() => {
    const online = onlineUsers.includes(userId);
    setIsOnline(online);
    if (handleOnline) {
      handleOnline(online);
    }
  }, [onlineUsers, userId, handleOnline]);

  const bgColor = [
    "bg-slate-200",
    "bg-teal-200",
    "bg-red-200",
    "bg-green-200",
    "bg-yellow-200",
    "bg-gray-200",
    "bg-cyan-200",
    "bg-sky-200",
    "bg-blue-200",
  ];

  const randomNumber = Math.floor(Math.random() * bgColor.length);

  return (
    <div className="avatar-container" style={{
      '--avatar-width': `${width}px`,
      '--avatar-height': `${height}px`
    }}>
      <div className="avatar-wrapper">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name || 'User avatar'}
            className="avatar-image"
          />
        ) : (
          <div className={`avatar-placeholder ${bgColor[randomNumber]}`}>
            {avatarName}
          </div>
        )}
        {isOnline && <div className="online-indicator" />}
      </div>
      <div className="user-info">
        <h3 className="user-name">{name || 'Anonymous User'}</h3>
        <p className="user-status">
          {isOnline ? (
            <span className="status-online">Online</span>
          ) : (
            <span className="status-offline">Offline</span>
          )}
        </p>
      </div>
    </div>
  );
};

export default Avatar;
