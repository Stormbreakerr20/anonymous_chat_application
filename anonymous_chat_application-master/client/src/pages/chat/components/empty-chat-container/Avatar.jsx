import React from "react";
import { PiUserCircle } from "react-icons/pi";

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
    <div
      className="flex items-center" // Change this to `flex` to place items horizontally
      style={{ width: "auto", height: height + "px" }}
    >
      {/* Profile Image */}
      <div
        className={`relative flex justify-center items-center overflow-hidden rounded-full`}
        style={{ width: width + "px", height: height + "px" }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            width={width}
            height={height}
            alt={name}
            className="rounded-full object-cover"
          />
        ) : name ? (
          <div
            className={`flex justify-center items-center text-lg ${bgColor[randomNumber]}`}
            style={{ width: width + "px", height: height + "px" }}
          >
            {avatarName}
          </div>
        ) : (
          <PiUserCircle size={width} />
        )}
      </div>

      {/* Name Display */}
      {name && (
        <div className="font-semibold text-white text-sm ml-3"> {/* ml-3 adds space between the image and the name */}
          {name}
        </div>
      )}
    </div>
  );
};

export default Avatar;
