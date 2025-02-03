import { useAppStore } from "@/store"
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { colors, getColor } from "@/lib/utils";
import { FaTrash, FaPlus } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { ADD_PROFILE_IMAGE_ROUTE, HOST, REMOVE_PROFILE_IMAGE_ROUTE, UPDATE_PROFILE_ROUTE } from "@/utils/constants";
import axios from "axios"




const Profile = () => {

  const navigate = useNavigate();

  const {userInfo,setUserInfo} = useAppStore();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [image, setImage] = useState(null);
  const [hovered , setHovered] = useState(false);
  const [selectedcolor, setSelectedColor] = useState(0);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);


  useEffect(()=> {
    if(userInfo.profileSetup){
      setFirstName(userInfo.firstName);
      setLastName(userInfo.lastName);
      setSelectedColor(userInfo.color);
    }
    if(userInfo.image){
      setImage(`${HOST}/${userInfo.image}`);
    }

  },[userInfo]);

  const validateProfile = () => {
    if(!firstName.length){
      toast.error("First Name is required");
      return false;
    }
    if(!lastName.length){
      toast.error("Last Name is required");
      return false;
    }
    return true;
  };

  const saveChanges = async () => {
    if(validateProfile()){
      try{
        const response = await apiClient.post(UPDATE_PROFILE_ROUTE, {firstName, lastName, color: selectedcolor, image},{withCredentials:true});
        if(response.status === 200 && response.data){
          setUserInfo({...response.data});
          toast.success("Profile updated successfully");
          navigate("/chat");
        }
      }catch(error){
        console.error("Save Changes error:", error);
        toast.error(error.message || "Internal server error");
      }
    }
  };

  const handleNavigate = () => {
    if(userInfo.profileSetup){
      navigate("/chat");
    }else{
      toast.error("Please complete your profile setup");
    }
  };

  const handleFileInputClick = () => { 
    fileInputRef.current.click();
  };
  const handleImageUpload = async (file) => {
    try {
      setLoading(true); // Start loading
      const signatureResponse = await axios.post("http://localhost:3000/api/cloudinary/get-signature", {}, {
        withCredentials: true,
      });
  
      if (!signatureResponse.data) {
        toast.error("Failed to get Cloudinary signature");
        return;
      }
  
      const { timestamp, signature, cloudName, apiKey } = signatureResponse.data;
  
      const formData = new FormData();
      formData.append("file", file);
      formData.append("timestamp", timestamp);
      formData.append("api_key", apiKey);
      formData.append("signature", signature);
  
      const cloudinaryResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });
  
      const cloudinaryData = await cloudinaryResponse.json();
      if (cloudinaryData.error) {
        toast.error("Cloudinary upload failed");
        return;
      }
  
      const imageUrl = cloudinaryData.secure_url;
  
      // Update user profile image in backend
      const userResponse = await axios.post(
        "http://localhost:3000/api/auth/add-profile-image",
        { imageUrl },
        { withCredentials: true }
      );
  
      if (userResponse.status === 200) {
        toast.success("Profile image updated successfully");
        setUserInfo({ ...userInfo, image: imageUrl });
      } else {
        toast.error("Failed to update profile image");
      }
    } catch (error) {
      toast.error("An error occurred during the upload");
      console.error("Upload error:", error);
    } finally {
      setLoading(false); // End loading
    }
  };
   
  const handleImageChange = async  (event) => {
    const file = event.target.files[0];
    console.log(file);
    if(file){
      await handleImageUpload(file);
    }
  };

  const handleDeleteImage = async () => {
    try {
      setLoading(true); // Start loading
      const response = await apiClient.delete(REMOVE_PROFILE_IMAGE_ROUTE, { withCredentials: true });
      
      if (response.status === 200) {
        setUserInfo({ ...userInfo, image: null });
        toast.success("Image deleted successfully");
        setImage(null);
      }
    } catch (error) {
      console.error("Delete image error:", error);
      toast.error("Failed to delete image. Please try again.");
    } finally {
      setLoading(false); // End loading
    }
  };
  

  return (
    <div className="bg-[#1b1c24] h-[100vh] flex justify-center items-center flex-col gap-10">
      <div className="flex flex-col gap-10 w-[80vw] md:w-max">
        <div onClick={handleNavigate} className="flex items-center gap-5 cursor-pointer">
          <IoArrowBack className="text-white/90 text-4xl lg:text-6xl cursor-pointer" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-24 w-24 sm:h-32 sm:w-32 md:w-48 md:h-48 relative flex items-center justify-center mx-auto md:mx-0"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
  <Avatar className="h-full w-full rounded-full overflow-hidden flex items-center justify-center bg-[#2c2e3b]">
  {loading ? (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
      <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
    </div>
  ) : (
    image || userInfo.image ? (
      <AvatarImage 
        src={userInfo.image} 
        alt="profile" 
        className="w-full h-full object-cover"
      />
    ) : (
      <div className={`w-full h-full flex items-center justify-center ${getColor(selectedcolor)}`}>
        <span className="text-2xl sm:text-3xl md:text-5xl uppercase">
          {firstName ? firstName.charAt(0) : userInfo.email.charAt(0)}
        </span>
      </div>
    )
  )}
</Avatar>

            {hovered && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full"
                onClick={image ? handleDeleteImage : handleFileInputClick}
              >
                {image ? 
                  <FaTrash className="text-white text-xl sm:text-2xl md:text-3xl" /> : 
                  <FaPlus className="text-white text-xl sm:text-2xl md:text-3xl" />
                }
              </div>
            )}
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageChange} name="profile-image" accept="image/*" />
          </div>
          <div className="flex min-w-32 md:min-w-64 flex-col gap-5 text-white items-center justify-center">
            <div className="w-full">
              <Input placeholder = "Email" type="email" disabled value={userInfo.email} className="rounded-lg p-6 bg-[#2c2e3b] border-none" />
            </div>
            <div className="w-full">
              <Input placeholder = "First Name" type="text" onChange = {(e)=>setFirstName(e.target.value)} value={firstName} className="rounded-lg p-6 bg-[#2c2e3b] border-none" />
            </div>
            <div className="w-full">
              <Input placeholder = "Last Name" type="text" onChange = {(e)=>setLastName(e.target.value)} value={lastName} className="rounded-lg p-6 bg-[#2c2e3b] border-none" />
            </div>
            <div className="w-full flex gap-5">
              {
                colors.map((color, index) => <div className={`${color} h-8 w-8 rounded-full cursor-pointer transition-all duration-300 ${selectedcolor === index ? "outline outline-white/50 outline-3" : ""}`}
                key = {index}
                onClick={()=>setSelectedColor(index)}
                >

                </div>)
              }
            </div>
          </div>
        </div>
        <div className="w-full">
          <button className="h-16 bg-purple-700 hover:bg-purple-900 transition-all duration-300 w-full" onClick={saveChanges}>Save Changes</button>
        </div>
        <div className="w-full">
          <Input 
            placeholder="Anonymous ID" 
            type="text" 
            disabled 
            value={userInfo.email.split('@')[0]} // Show only the ID part
            className="rounded-lg p-6 bg-[#2c2e3b] border-none" 
          />
        </div>
      </div>
    </div>
  )
}

export default Profile