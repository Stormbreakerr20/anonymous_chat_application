import React, { useEffect, useRef, useState } from 'react'
// import { useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'
import Avatar from './Avatar'
import { HiDotsVertical } from "react-icons/hi";
import { FaAngleLeft } from "react-icons/fa6";
import { FaPlus } from "react-icons/fa6";
import { FaImage } from "react-icons/fa6";
import { FaVideo } from "react-icons/fa6";
import uploadFile from '../../../../../../helpers/uploadFile';
import { IoClose } from "react-icons/io5";
import Loading from './Loading';
// import backgroundImage from '../assets/wallapaper.jpeg'
import { useAppStore } from '@/store';
import { IoMdSend } from "react-icons/io";
import moment from 'moment'

const MessagePage = (userId) => {
<<<<<<< HEAD
  
=======
>>>>>>> 8d91393cb22001982699109dad253017b29a8384
  const params = userId
  // console.log(params);
  const onlineUsers =useAppStore((state) => state.onlineUser);
  const socketConnection = useAppStore((state) => state.socket);
  const user = useAppStore((state) => state.userInfo);
  // console.log(socketConnection)
  if (socketConnection?.connected) {
    console.log('Socket is connected:', socketConnection.id);
} else {
    console.error('Socket is not connected.');
}

  // console.log(user)
  const [isOnline, setIsOnline] = useState(false);
  const handleOnline =(online)=>{
      setIsOnline(online);
  }
  const [dataUser,setDataUser] = useState({
    name : "",
    email : "",
    profile_pic : "",
    online : false,
    _id : ""
  })
  const [openImageVideoUpload,setOpenImageVideoUpload] = useState(false)
  const [message,setMessage] = useState({
    text : "",
    imageUrl : "",
    videoUrl : ""
  })
  const [loading,setLoading] = useState(false)
  const [allMessage,setAllMessage] = useState([])
  const currentMessage = useRef(null)
// console.log("HEy there :",allMessage)

// useEffect(()=>{
//   if(socketConnection){
//       socketConnection.emit('sidebar',userId)
      
//       socketConnection.on('conversation',(data)=>{
//           console.log('conversation',data)
          
//           const conversationUserData = data.map((conversationUser,index)=>{
//               if(conversationUser?.sender?._id === conversationUser?.receiver?._id){
//                   return{
//                       ...conversationUser,
//                       userDetails : conversationUser?.sender
//                   }
//               }
//               else if(conversationUser?.receiver?._id !== user?._id){
//                   return{
//                       ...conversationUser,
//                       userDetails : conversationUser.receiver
//                   }
//               }else{
//                   return{
//                       ...conversationUser,
//                       userDetails : conversationUser.sender
//                   }
//               }
//           })

//           setAllUser(conversationUserData)
//       })
//   }
// })

  useEffect(()=>{
      if(currentMessage.current){
          currentMessage.current.scrollIntoView({behavior : 'smooth', block : 'end'})
      }
  },[allMessage])
  console.log(user)
  const handleUploadImageVideoOpen = ()=>{
    setOpenImageVideoUpload(preve => !preve)
  }

  const handleUploadImage = async(e)=>{
    const file = e.target.files[0]

    setLoading(true)
    const uploadPhoto = await uploadFile(file)
    setLoading(false)
    setOpenImageVideoUpload(false)

    setMessage(preve => {
      return{
        ...preve,
        imageUrl : uploadPhoto.url
      }
    })
  }
  const handleClearUploadImage = ()=>{
    setMessage(preve => {
      return{
        ...preve,
        imageUrl : ""
      }
    })
  }

  const handleUploadVideo = async(e)=>{
    const file = e.target.files[0]

    setLoading(true)
    const uploadPhoto = await uploadFile(file)
    setLoading(false)
    setOpenImageVideoUpload(false)

    setMessage(preve => {
      return{
        ...preve,
        videoUrl : uploadPhoto.url
      }
    })
  }
  const handleClearUploadVideo = ()=>{
    setMessage(preve => {
      return{
        ...preve,
        videoUrl : ""
      }
    })
  }

  useEffect(()=>{
      if(socketConnection){
        console.log('Emitting message-page event with userId:', params.userId);
        socketConnection.emit('message-page',params.userId)

        socketConnection.emit('seen',params.userId)

        socketConnection.on('message-user',(data)=>{
          // console.log("data is:", data)
          setDataUser(data)
        }) 
        
        socketConnection.on('message',(data)=>{
          // console.log('message data',data)
          setAllMessage(data)
        })

        socketConnection.on('directmessage', (newMessage) => {
          // Append the new message to the existing list of messages
          // console.log('Real-time message received:', newMessage);
          setAllMessage(newMessage);
    });
      }

    
  },[socketConnection,params?.userId,user])

  const handleOnChange = (e)=>{
    const { name, value} = e.target

    setMessage(preve => {
      return{
        ...preve,
        text : value
      }
    })
  }

  const handleSendMessage = (e)=>{
    e.preventDefault()

    if(message.text || message.imageUrl || message.videoUrl){
      if(socketConnection){
        socketConnection.emit('new message',{
          sender : user?.id,
          receiver : params.userId,
          text : message.text,
          imageUrl : message.imageUrl,
          videoUrl : message.videoUrl,
          msgByUserId : user?.id
        })
        setMessage({
          text : "",
          imageUrl : "",
          videoUrl : ""
        })
      }
    }
  }


  return (
  <div className="flex flex-col h-screen w-full bg-[#1c1d25]">
  <header className="sticky top-0 h-16 bg-[#262831] flex justify-between items-center px-4 shadow-md">
    <div className="flex items-center gap-4">
      <Link to="/" className="lg:hidden">
        <FaAngleLeft size={25} />
      </Link>
      <Avatar
        width={50}
        height={50}
        imageUrl={dataUser?.profile_pic}
        name={dataUser?.name}
        userId={dataUser?._id}
        handleOnline={handleOnline}
      />
      

    </div>
    <button className="cursor-pointer hover:text-purple-500">
      <HiDotsVertical />
    </button>
  </header>

  <section className="flex-1 overflow-y-auto p-4 bg-[#1c1d25]">
    <div className="flex flex-col gap-4">
      {allMessage.map((msg, index) => (
        <div
          key={index}
          className={`flex ${
            user.id === msg?.msgByUserId ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`max-w-[70%] p-3 rounded-lg ${
              user.id === msg?.msgByUserId
                ? "bg-purple-500 text-white"
                : "bg-[#2a2b36]"
            }`}
          >
            {msg.imageUrl && (
              <img
                src={msg.imageUrl}
                alt="attachment"
                className="w-full rounded-md mb-2"
              />
            )}
            {msg.videoUrl && (
              <video
                src={msg.videoUrl}
                controls
                className="w-full rounded-md mb-2"
              />
            )}
            <p>{msg.text}</p>
            <span className="text-xs text-gray-400 block text-right mt-1">
              {moment(msg.createdAt).format("h:mm A")}
            </span>
          </div>
        </div>
      ))}
      <div ref={currentMessage} />
    </div>

    {/* Upload Preview */}
    {message.imageUrl && (
      <div className="fixed bottom-24 left-0 right-0 flex justify-center items-center">
        <div className="relative bg-white p-4 rounded-lg shadow-md max-w-lg">
          <button
            onClick={handleClearUploadImage}
            className="absolute top-2 right-2 text-red-500"
          >
            <IoClose size={20} />
          </button>
          <img
            src={message.imageUrl}
            alt="Uploaded Preview"
            className="w-full rounded-md object-contain"
          />
        </div>
      </div>
    )}

    {message.videoUrl && (
      <div className="fixed bottom-24 left-0 right-0 flex justify-center items-center">
        <div className="relative bg-white p-4 rounded-lg shadow-md max-w-lg">
          <button
            onClick={handleClearUploadVideo}
            className="absolute top-2 right-2 text-red-500"
          >
            <IoClose size={20} />
          </button>
          <video
            src={message.videoUrl}
            controls
            className="w-full rounded-md object-contain"
          />
        </div>
      </div>
    )}
  </section>

  <section className="h-20 bg-[#262831] flex items-center px-4">
    <div className="relative">
      <button
        onClick={handleUploadImageVideoOpen}
        className="p-3 bg-purple-500 rounded-full hover:bg-purple-600"
      >
        <FaPlus />
      </button>
      {openImageVideoUpload && (
        <div className="absolute bottom-14 left-0 bg-white rounded-lg shadow-md">
          <form className="p-3">
            <label
              htmlFor="uploadImage"
              className="flex items-center gap-2 p-2 hover:bg-gray-200 cursor-pointer rounded-md"
            >
              <FaImage className="text-purple-500" />
              <span>Upload Image</span>
            </label>
            <input
              type="file"
              id="uploadImage"
              onChange={handleUploadImage}
              className="hidden"
            />
            <label
              htmlFor="uploadVideo"
              className="flex items-center gap-2 p-2 hover:bg-gray-200 cursor-pointer rounded-md"
            >
              <FaVideo className="text-blue-500" />
              <span>Upload Video</span>
            </label>
            <input
              type="file"
              id="uploadVideo"
              onChange={handleUploadVideo}
              className="hidden"
            />
          </form>
        </div>
      )}
    </div>
    <form className="flex-1 flex items-center ml-4" onSubmit={handleSendMessage}>
      <input
        type="text"
        placeholder="Type a message..."
        className="w-full p-3 rounded-lg bg-[#2a2b36] text-white outline-none"
        value={message.text}
        onChange={handleOnChange}
      />
      <button className="ml-2 text-purple-500 hover:text-purple-600">
        <IoMdSend size={25} />
      </button>
    </form>
  </section>
</div>

  )
}

export default MessagePage


// import React, { useEffect, useRef, useState } from "react";
// import { Link } from "react-router-dom";
// import Avatar from "./Avatar";
// import { HiDotsVertical } from "react-icons/hi";
// import { FaAngleLeft, FaPlus, FaImage, FaVideo } from "react-icons/fa6";
// import { IoClose } from "react-icons/io5";
// import { IoMdSend } from "react-icons/io";
// import uploadFile from "../../../../../../helpers/uploadFile";
// import Loading from "./Loading";
// import moment from "moment";
// import { useAppStore } from "@/store";

// const MessagePage = ({ userId }) => {
//   const socketConnection = useAppStore((state) => state.socket);
//   const user = useAppStore((state) => state.userInfo);

//   const [dataUser, setDataUser] = useState({
//     name: "",
//     email: "",
//     profile_pic: "",
//     online: false,
//     _id: "",
//   });
//   const [openImageVideoUpload, setOpenImageVideoUpload] = useState(false);
//   const [message, setMessage] = useState({
//     text: "",
//     imageUrl: "",
//     videoUrl: "",
//   });
//   const [loading, setLoading] = useState(false);
//   const [allMessage, setAllMessage] = useState([]);
//   const currentMessage = useRef(null);

//   useEffect(() => {
//     if (currentMessage.current) {
//       currentMessage.current.scrollIntoView({ behavior: "smooth", block: "end" });
//     }
//   }, [allMessage]);

//   const handleUploadImageVideoOpen = () => {
//     setOpenImageVideoUpload((prev) => !prev);
//   };

//   const handleUploadImage = async (e) => {
//     const file = e.target.files[0];
//     setLoading(true);
//     const uploadPhoto = await uploadFile(file);
//     setLoading(false);
//     setOpenImageVideoUpload(false);
//     setMessage((prev) => ({ ...prev, imageUrl: uploadPhoto.url }));
//   };

//   const handleClearUploadImage = () => {
//     setMessage((prev) => ({ ...prev, imageUrl: "" }));
//   };

//   const handleUploadVideo = async (e) => {
//     const file = e.target.files[0];
//     setLoading(true);
//     const uploadPhoto = await uploadFile(file);
//     setLoading(false);
//     setOpenImageVideoUpload(false);
//     setMessage((prev) => ({ ...prev, videoUrl: uploadPhoto.url }));
//   };

//   const handleClearUploadVideo = () => {
//     setMessage((prev) => ({ ...prev, videoUrl: "" }));
//   };

//   useEffect(() => {
//     if (socketConnection) {
//       socketConnection.emit("message-page", userId);
//       socketConnection.emit("seen", userId);

//       socketConnection.on("message-user", (data) => setDataUser(data));

//       socketConnection.on("message", (data) => setAllMessage(data));

//       socketConnection.on("directmessage", (newMessage) => setAllMessage((prev) => [...prev, newMessage]));
//     }
//   }, [socketConnection, userId]);

//   const handleOnChange = (e) => {
//     const { name, value } = e.target;
//     setMessage((prev) => ({ ...prev, text: value }));
//   };

//   const handleSendMessage = (e) => {
//     e.preventDefault();
//     if (message.text || message.imageUrl || message.videoUrl) {
//       socketConnection.emit("new message", {
//         sender: user?.id,
//         receiver: userId,
//         text: message.text,
//         imageUrl: message.imageUrl,
//         videoUrl: message.videoUrl,
//         msgByUserId: user?.id,
//       });
//       setMessage({ text: "", imageUrl: "", videoUrl: "" });
//     }
//   };

//   return (
//     <div className="flex flex-col h-screen bg-[#1c1d25] text-white">
//       {/* Header */}
//       <header className="sticky top-0 h-16 bg-[#262831] flex justify-between items-center px-4">
//         <div className="flex items-center gap-4">
//           <Link to="/" className="lg:hidden">
//             <FaAngleLeft size={25} />
//           </Link>
//           <Avatar
//             width={50}
//             height={50}
//             imageUrl={dataUser?.profile_pic}
//             name={dataUser?.name}
//             userId={dataUser?._id}
//           />
//           <div>
//             <h3 className="font-semibold text-lg">{dataUser?.name}</h3>
//             <p className="text-sm">
//               {dataUser.online ? <span className="text-green-500">Online</span> : <span className="text-gray-400">Offline</span>}
//             </p>
//           </div>
//         </div>
//         <button className="cursor-pointer hover:text-purple-500">
//           <HiDotsVertical />
//         </button>
//       </header>

//       {/* Message Section */}
//       <section className="flex-1 overflow-y-auto p-4">
//         <div className="flex flex-col gap-4">
//           {allMessage.map((msg, index) => (
//             <div
//               key={index}
//               className={`flex ${
//                 user._id === msg?.msgByUserId ? "justify-end" : "justify-start"
//               }`}
//             >
//               <div
//                 className={`max-w-[70%] p-3 rounded-lg ${
//                   user._id === msg?.msgByUserId ? "bg-purple-500" : "bg-[#2a2b36]"
//                 }`}
//               >
//                 {msg.imageUrl && <img src={msg.imageUrl} alt="attachment" className="w-full rounded-md mb-2" />}
//                 {msg.videoUrl && (
//                   <video src={msg.videoUrl} controls className="w-full rounded-md mb-2" />
//                 )}
//                 <p>{msg.text}</p>
//                 <span className="text-xs text-gray-400 block text-right mt-1">
//                   {moment(msg.createdAt).format("h:mm A")}
//                 </span>
//               </div>
//             </div>
//           ))}
//           <div ref={currentMessage} />
//         </div>
//       </section>

//       {/* Message Input */}
//       <section className="h-20 bg-[#262831] flex items-center px-4">
//         <button
//           onClick={handleUploadImageVideoOpen}
//           className="p-3 bg-purple-500 rounded-full hover:bg-purple-600"
//         >
//           <FaPlus />
//         </button>
//         <form className="flex-1 flex items-center ml-4" onSubmit={handleSendMessage}>
//           <input
//             type="text"
//             placeholder="Type a message..."
//             className="w-full p-3 rounded-lg bg-[#2a2b36] text-white outline-none"
//             value={message.text}
//             onChange={handleOnChange}
//           />
//           <button className="ml-2 text-purple-500 hover:text-purple-600">
//             <IoMdSend size={25} />
//           </button>
//         </form>
//       </section>
//     </div>
//   );
// };

// export default MessagePage;
