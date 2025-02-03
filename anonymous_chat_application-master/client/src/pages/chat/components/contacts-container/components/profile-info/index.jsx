import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { apiClient } from "@/lib/api-client";
import { getColor } from "@/lib/utils";
import { useAppStore } from "@/store";
import { LOGOUT_ROUTE } from "@/utils/constants";
import { FiEdit2 } from "react-icons/fi";
import { IoPowerSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import './index.css';

const ProfileInfo = () => {
    const { userInfo, setUserInfo } = useAppStore();
    const navigate = useNavigate();

    const getImageUrl = () => {
        if (!userInfo.image) return null;
        return userInfo.image;
    };

    const logOut = async () => {
        try {
            const response = await apiClient.post(LOGOUT_ROUTE, {}, { withCredentials: true });
            if (response.status === 200) {
                navigate('/auth');
                setUserInfo(null);
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="profile-container">
            <div className="profile-info">
                <div className={`profile-avatar ${getColor(userInfo.color || 0)}`}>
                    
                    {userInfo.image ? (
                        <img
                            src={getImageUrl()}
                            alt="profile"
                            className="avatar-image"
                        />
                    ) : (
                        <div className={`avatar-placeholder`}>
                            {userInfo.firstName?.[0]?.toUpperCase() || userInfo.email?.[0]?.toUpperCase()}
                        </div>
                    )}
                </div>
                <div className="profile-name">
                    {userInfo.firstName && userInfo.lastName ? `${userInfo.firstName} ${userInfo.lastName}` : ""}
                </div>
            </div>
            <div className="profile-actions">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <FiEdit2 className="edit-icon" onClick={() => navigate('/profile')} />
                        </TooltipTrigger>
                        <TooltipContent className="tooltip-content">
                            Edit Profile
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger>
                            <IoPowerSharp className="logout-icon" onClick={logOut} />
                        </TooltipTrigger>
                        <TooltipContent className="tooltip-content">
                            Logout
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    );
};

export default ProfileInfo;