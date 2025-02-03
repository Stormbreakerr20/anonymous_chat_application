import React, { useEffect, useRef, useState } from 'react'
import './MessagePage.css';
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
import { useAppStore } from '@/store';
import { IoMdSend } from "react-icons/io";
import moment from 'moment'
import { FaTrash } from 'react-icons/fa';
import { toast } from 'sonner';
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const MessagePage = (userId) => {
  
  const params = userId
  const onlineUsers =useAppStore((state) => state.onlineUser);
  const socketConnection = useAppStore((state) => state.socket);
  const user = useAppStore((state) => state.userInfo);
  if (socketConnection?.connected) {
    console.log('Socket is connected:', socketConnection.id);
} else {
    console.error('Socket is not connected.');
}

  const uploadMenuRef = useRef(null);

  const [isOnline, setIsOnline] = useState(false);
  const handleOnline =(online)=>{
      setIsOnline(online);
  }
  const [dataUser,setDataUser] = useState({
    name : "",
    email : "",
    image : "",
    online : false,
    _id : ""
  })
  // const [imageU,setImageU] = useState("")
  const [openImageVideoUpload,setOpenImageVideoUpload] = useState(false)
  const [message,setMessage] = useState({
    text : "",
    imageUrl : "",
    videoUrl : ""
  })
  const [loading,setLoading] = useState(false)
  const [allMessage,setAllMessage] = useState([])
  const currentMessage = useRef(null)
  const [deletePrompt, setDeletePrompt] = useState({ show: false, messageId: null });
  const [currentConversation, setCurrentConversation] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(()=>{
      if(currentMessage.current){
          currentMessage.current.scrollIntoView({behavior : 'smooth', block : 'end'})
      }
  },[allMessage])
  // console.log(user)

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
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (uploadMenuRef.current && !uploadMenuRef.current.contains(event.target)) {
        setOpenImageVideoUpload(false);
      }
    };
  
    if (openImageVideoUpload) {
      document.addEventListener("mousedown", handleClickOutside);
    }
  
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openImageVideoUpload]);
  
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

  useEffect(() => {
    if (socketConnection) {
      socketConnection.emit('message-page', params.userId);
      socketConnection.emit('seen', params.userId);
      
      socketConnection.on('message-user', (data) => {
        // console.log("data:",data)
        // console.log("User Data Received:", data); // Debugging log
        setDataUser(data);
        // setImageU(data.image)
        // console.log("Profile Pic URL (before render):", dataUser?.image);
      });
      

      socketConnection.on('message', (data) => {
        setAllMessage(data);
        if (data && data.length > 0) {
          setCurrentConversation({
            _id: data[0].conversationId,
            sender: user.id,
            receiver: params.userId
          });
        }
      });

      socketConnection.on('directMessage', (messages) => {
        setAllMessage(messages);
      });

      socketConnection.on('messageError', (error) => {
        toast.error(error.error || 'Failed to send message');
      });

      socketConnection.on('messageDeleted', ({ messageId }) => {
        setAllMessage(prev => prev.filter(msg => msg._id !== messageId));
      });

      return () => {
        socketConnection.off('message-user');
        socketConnection.off('message');
        socketConnection.off('messageDeleted');
        socketConnection.off('deletionError');
        socketConnection.off('directMessage');
        socketConnection.off('messageError');
      };
    }
  }, [socketConnection, params?.userId, user]);

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

    if (!message.text && !message.imageUrl && !message.videoUrl) {
      return;
    }

    try {
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
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  }

  const handleDeleteMessage = (messageId) => {
    if (socketConnection) {
      socketConnection.emit('deleteDirectMessage', {
        messageId,
        sender: user.id,
        receiver: params.userId
      });
      setDeletePrompt({ show: false, messageId: null });
    }
  };

  return (
  <div className="message-container">
    <header className="message-header">
      <div className="header-content">
        <Link to="/" className="back-button">
          <FaAngleLeft size={25} />
        </Link>
        
        <div className="header-controls">
          
          <Avatar
            width={50}
            height={50}
            imageUrl={dataUser?.image}
            
            name={dataUser?.name}
            userId={dataUser?._id}
            handleOnline={handleOnline}
          />
          {/* {dataUser.image} */}
          <button className="cursor-pointer hover:text-purple-500">
            <HiDotsVertical />
          </button>
        </div>
      </div>
    </header>

  <section className="message-section">
    <div className="message-list">
      {allMessage.map((msg, index) => (
        <div
          key={index}
          className={`flex ${
            user.id === msg?.msgByUserId ? "justify-end" : "justify-start"
          }`}
        >
          <div className={`message-bubble ${user.id === msg?.msgByUserId ? "sent" : "received"}`}>
            {user.id === msg?.msgByUserId && (
              <button
                className="absolute -top-2 -right-2 p-1 bg-[#262831] rounded-full text-red-500 hover:text-red-700 transition-colors"
                onClick={() => setDeletePrompt({ show: true, messageId: msg._id })}
              >
                <FaTrash size={12} />
              </button>
            )}
            {msg.imageUrl && (
              
 <div className="relative w-64 h-64" onClick={() => setSelectedImage(msg.imageUrl)}>
 <img
   src={msg.imageUrl}
   alt="Sent Image"
   className="rounded-lg w-full h-full object-cover shadow-lg  hover:opacity-90 transition-opacity "
 />
</div>

)}

            {msg.videoUrl && (
              <video
                src={msg.videoUrl}
                controls
                className="w-full rounded-md mb-2"
              />
            )}
            <p className="min-w-0 break-words">{msg.text}</p>
            <span className="text-xs text-white/70 block text-right mt-1">
              {moment(msg.createdAt).format("h:mm A")}
            </span>
          </div>
        </div>
      ))}
      <div ref={currentMessage} />
    </div>

    {message.imageUrl && (
  <div className="fixed bottom-24 left-[21%] flex justify-start items-center w-full">
    <div className="relative bg-purple-900 p-1 rounded-lg shadow-md max-w-lg">
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
        onClick={() => handleImageClick(msg.imageUrl)}
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

  <section className="input-section">
    <div className="relative">
      <button
      onClick={handleUploadImageVideoOpen}
      className="p-3 bg-purple-500 rounded-full hover:bg-purple-600">
  {loading ? (
    <AiOutlineLoading3Quarters className="animate-spin text-white" size={20} />
  ) : (
    <FaPlus />
  )}
</button>
{openImageVideoUpload && (
  <div ref={uploadMenuRef} className="upload-menu">
    <form className="p-2">
      <label
        htmlFor="uploadImage"
        className="upload-menu-item"
      >
        <FaImage className="text-purple-400" />
        <span className="upload-menu-text">Upload Image</span>
      </label>
      <input
        type="file"
        id="uploadImage"
        onChange={handleUploadImage}
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

       {selectedImage && (
              <div className="modal-overlay"
                onClick={() => setSelectedImage(null)}>
                <button
                  className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
                  onClick={() => setSelectedImage(null)}
                >
                  <IoClose size={32} />
                </button>
                <img
                  src={selectedImage}
                  alt="Full size"
                  className="max-h-[90vh] max-w-[90vw] object-contain"
                />
              </div>
            )}
      

  {deletePrompt.show && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#2a2b36] p-6 rounded-lg max-w-sm w-full mx-4">
        <h3 className="text-white text-lg font-semibold mb-4 text-center"></h3>
          Delete this message?
        
        <div className="flex justify-center gap-4">
          <button
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            onClick={() => handleDeleteMessage(deletePrompt.messageId)}
          >
            Delete
          </button>
          <button
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            onClick={() => setDeletePrompt({ show: false, messageId: null })}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )}
</div>

  )
}

export default MessagePage