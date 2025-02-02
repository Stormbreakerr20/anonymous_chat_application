import React, { useEffect, useState } from "react";
import { PiUserCircle } from "react-icons/pi";
import { useAppStore } from "@/store";
import socket from "../../../../../../socket";

const Avatar = ({ userId, name, imageUrl, width, height, handleOnline }) => {
  const onlineUsers = useAppStore((state) => state.onlineUser);
  const [isOnline, setIsOnline] = useState(false);
  let avatarName = "";

  // Set online status and pass the update to the parent
  useEffect(() => {
    setIsOnline(onlineUsers.includes(userId));
    handleOnline(isOnline); // Pass the status back to parent component
  }, [onlineUsers, userId, isOnline]);

  if (name) {
    const splitName = name?.split(" ");
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

  const randomNumber = Math.floor(Math.random() * 9);

  return (
    <div
      className={`flex items-center gap-4 text-slate-800 rounded-full font-bold relative`}
      style={{ width: width + "px", height: height + "px" }}
    >
      {/* Avatar */}
      <div className="relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            width={width}
            height={height}
            alt={name}
            className="overflow-hidden rounded-full"
          />
        ) : (
          <div
            style={{ width: width + "px", height: height + "px" }}
            className={`overflow-hidden rounded-full flex justify-center items-center text-lg ${bgColor[randomNumber]}`}
          >
            {avatarName}
          </div>
        )}
        {isOnline && (
          <div className="bg-green-600 p-1 absolute bottom-2 -right-1 z-10 rounded-full"></div>
        )}
      </div>

      {/* Name and Status */}
      <div>
        <h3 className="font-semibold text-lg text-white">{name}</h3>
        <p className="text-sm text-gray-400">
          {isOnline ? (
            <span className="text-green-500">Online</span>
          ) : (
            <span className="text-red-500">Offline</span>
          )}
        </p>
      </div>
    </div>
  );
};

export default Avatar;
