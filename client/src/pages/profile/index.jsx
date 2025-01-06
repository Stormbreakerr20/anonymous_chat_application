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

const Profile = () => {

  const navigate = useNavigate();

  const {userInfo,setUserInfo} = useAppStore();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [image, setImage] = useState(null);
  const [hovered , setHovered] = useState(false);
  const [selectedcolor, setSelectedColor] = useState(0);
  const fileInputRef = useRef(null);


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
        const formData = new FormData();
        formData.append('profile-image', file);

        console.log('Uploading file:', file); // Debug log

        const response = await apiClient.post(
            ADD_PROFILE_IMAGE_ROUTE,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true
            }
        );

        if (response.data?.image) {
            // Create a full URL for the image
            const imageUrl = `${import.meta.env.VITE_HOST}/${response.data.image}`;
            setImage(imageUrl);
            setUserInfo({ ...userInfo, image: response.data.image });
            toast.success("Image uploaded successfully");
        }
    } catch (error) {
        console.error("Image upload error:", error);
        toast.error("Failed to upload image. Please try again.");
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
    try{

      const response = await apiClient.delete(REMOVE_PROFILE_IMAGE_ROUTE,{withCredentials:true});
      if(response.status === 200){
        setUserInfo({...userInfo, image: null});
        toast.success("Image deleted successfully");
        setImage(null);
      }

    }catch(error){
      console.error("Delete image error:", error);
      toast.error("Failed to delete image. Please try again.");
    }
  };

  return (
    <div className="bg-[#1b1c24] h-[100vh] flex justify-center items-center flex-col gap-10">
      <div className="flex flex-col gap-10 w-[80vw] md:w-max">
        <div onClick={handleNavigate} className="flex items-center gap-5 cursor-pointer">
          <IoArrowBack className="text-white/90 text-4xl lg:text-6xl cursor-pointer" />
        </div>
        <div className="grid grid-cols-2">
          <div className="h-full w-32 md:w-48 md:h-48 relative flex items-center justify-center"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <Avatar className="h-32 w-32 md:h-48 md:w-48 rounded-full overflow-hidden">
              {
                image ? (<AvatarImage src={image || (userInfo.image ? `${import.meta.env.VITE_HOST}/${userInfo.image}` : null)} alt="profile" className="object-cover w-full h-full bg-black" />): (
                <div className={`uppercase text-5xl flex items-center justify-center w-32 h-32 md:w-48 md:h-48 rounded-full ${getColor(selectedcolor)}`}>
                {firstName ? firstName.split("").shift(): userInfo.email.split("").shift()}
                </div>)
              }
            </Avatar>
            {
              hovered &&
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 ring-fuchsia-50 rounded-full"
                  onClick={image ? handleDeleteImage : handleFileInputClick}
                >
                  {
                    image ? <FaTrash className="text-white text-3xl cursor-pointer" /> : <FaPlus className="text-white text-3xl cursor-pointer" />
                  }
                </div>
              
            }
            <input type="file" ref = {fileInputRef} className="hidden" onChange={handleImageChange} name="profile-image" accept=".png, .jpg, .jpeg, .svg, .webp" />
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
      </div>
    </div>
  )
}

export default Profile