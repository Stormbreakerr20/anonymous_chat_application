import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import defaultAvatar from '@/assets/default-avatar.png'; // Add a default avatar image

const ProfileInfo = () => {
  const { userInfo } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(!userInfo);

  useEffect(() => {
    if (userInfo) {
      setIsLoading(false);
    }
  }, [userInfo]);
  
  // Add default values and null checks
  const defaultUserInfo = {
    firstName: userInfo?.firstName || 'Anonymous',
    lastName: userInfo?.lastName || '',
    email: userInfo?.email || '',
    image: userInfo?.image || defaultAvatar
  };

  if (isLoading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  return (
    <div className="profile-info-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <img 
            src={defaultUserInfo.image} 
            alt="Profile" 
            className="avatar-image"
            onError={(e) => {
              e.target.onerror = null; // Prevent infinite loop
              e.target.src = defaultAvatar;
            }}
          />
        </div>

        <div className="profile-details">
          <h2 className="profile-name">
            {`${defaultUserInfo.firstName} ${defaultUserInfo.lastName}`.trim()}
          </h2>
          <p className="profile-email">{defaultUserInfo.email}</p>
        </div>

      </div>
    </div>
  );
};

export default ProfileInfo;
