import React from "react";
import { PiUserCircle } from "react-icons/pi";
import './Avatar.css';

const Avatar = ({ name, imageUrl, width, height }) => {
  let avatarName = "";

  if (name) {
    const splitName = name.split(" ");
    avatarName =
      splitName.length > 1
        ? splitName[0][0] + splitName[1][0]
        : splitName[0][0];
  }

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
    <div className="chat-avatar-container">
      <div className="avatar-image-wrapper">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="avatar-image"
            style={{ 
              '--avatar-width': `${width}px`,
              '--avatar-height': `${height}px`
            }}
          />
        ) : name ? (
          <div
            className={`avatar-placeholder ${bgColor[randomNumber]}`}
            style={{ 
              '--avatar-width': `${width}px`,
              '--avatar-height': `${height}px`
            }}
          >
            {avatarName}
          </div>
        ) : (
          <div className="avatar-icon-wrapper">
            <PiUserCircle size={width} />
          </div>
        )}
      </div>
      {name && (
        <div className="avatar-name">
          {name}
        </div>
      )}
    </div>
  );
};

export default Avatar;
