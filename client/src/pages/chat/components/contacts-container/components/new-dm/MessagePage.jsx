import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Avatar from "./Avatar";
import { HiDotsVertical } from "react-icons/hi";
import { FaAngleLeft } from "react-icons/fa6";
import uploadFile from "../../../../../../helpers/uploadFile";
import { IoClose } from "react-icons/io5";
import Loading from "./Loading";
import { useAppStore } from "@/store";
import { IoMdSend } from "react-icons/io";
import moment from "moment";
import { toast } from "sonner";
import axios from "axios";

const MessagePage = () => {
  const params = useParams();
  const socketConnection = useAppStore((state) => state.socket);
  const user = useAppStore((state) => state.userInfo);

  const [dataUser, setDataUser] = useState({
    name: "",
    email: "",
    profile_pic: "",
    online: false,
    _id: "",
  });
  const [message, setMessage] = useState({ text: "", imageUrl: "" });
  const [loading, setLoading] = useState(false);
  const [allMessage, setAllMessage] = useState([]);
  const currentMessage = useRef(null);
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (currentMessage.current) {
      currentMessage.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [allMessage]);

  const handleUploadImage = async () => {
    if (!image) return;

    setLoading(true);
    try {
      const {
        data: { signature, timestamp, cloudName, apiKey },
      } = await axios.post("http://localhost:3000/api/cloudinary/get-signature");

      const formData = new FormData();
      formData.append("file", image);
      formData.append("timestamp", timestamp);
      formData.append("api_key", apiKey);
      formData.append("signature", signature);

      const uploadResponse = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData
      );

      const imageUrl = await uploadResponse.data.secure_url;
      console.log(imageUrl)
      await setMessage((prev) => ({ ...prev, imageUrl }));
      toast.success("Image uploaded successfully!");
      setImage(null);

      // // Save the image URL in the database
      // await axios.post("http://localhost:3000/api/messages/save-image", {
      //   imageUrl,
      // });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Image upload failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearImage = () => {
    setMessage((prev) => ({ ...prev, imageUrl: "" }));
  };

  useEffect(() => {
    if (socketConnection) {
      socketConnection.emit("message-page", params.userId);
      socketConnection.emit("seen", params.userId);

      socketConnection.on("message-user", (data) => {
        setDataUser(data);
      });

      socketConnection.on("message", (data) => {
        setAllMessage(data);
      });

      socketConnection.on("directmessage", (newMessage) => {
        setAllMessage(newMessage);
      });
    }
  }, [socketConnection, params?.userId, user]);

  const handleOnChange = (e) => {
    const { value } = e.target;
    setMessage((prev) => ({ ...prev, text: value }));
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (image)  await handleUploadImage();
    if (message.text || message.imageUrl) {
      if (socketConnection) {
        socketConnection.emit("new message", {
          sender: user?.id,
          receiver: params.userId,
          text: message.text,
          imageUrl: message.imageUrl,
          msgByUserId: user?.id,
        });
        setMessage({ text: "", imageUrl: "" });
      }
    }
  };

  return (
    <div className="bg-no-repeat bg-cover">
      <header className="sticky top-0 h-16 bg-white flex justify-between items-center px-4">
        <div className="flex items-center gap-4">
          <Link to={"/"} className="lg:hidden">
            <FaAngleLeft size={25} />
          </Link>
          <div>
            <Avatar
              width={50}
              height={50}
              imageUrl={dataUser?.profile_pic}
              name={dataUser?.name}
              userId={dataUser?._id}
            />
          </div>
          <div>
            <h3 className="font-semibold text-lg my-0 text-ellipsis line-clamp-1">
              {dataUser?.name}
            </h3>
            <p className="-my-2 text-sm">
              {dataUser.online ? (
                <span className="text-primary">online</span>
              ) : (
                <span className="text-slate-400">offline</span>
              )}
            </p>
          </div>
        </div>
        <button className="cursor-pointer hover:text-primary">
          <HiDotsVertical />
        </button>
      </header>

      <section className="h-[calc(100vh-128px)] overflow-x-hidden overflow-y-scroll scrollbar relative bg-slate-200 bg-opacity-50">
        <div className="flex flex-col gap-2 py-2 mx-2" ref={currentMessage}>
          {allMessage.map((msg, index) => (
            <div
              key={index}
              className={`p-1 py-1 rounded w-fit max-w-[280px] md:max-w-sm lg:max-w-md ${
                user._id === msg?.msgByUserId ? "ml-auto bg-teal-100" : "bg-white"
              }`}
            >
              {msg?.imageUrl && (
                <img
                  src={msg?.imageUrl}
                  className="w-full h-full object-scale-down"
                  alt="Message Attachment"
                />
              )}
              <p className="px-2">{msg.text}</p>
              <p className="text-xs ml-auto w-fit">
                {moment(msg.createdAt).format("hh:mm")}
              </p>
            </div>
          ))}
        </div>

        {message.imageUrl && (
          <div className="w-full h-full sticky bottom-0 bg-slate-700 bg-opacity-30 flex justify-center items-center rounded overflow-hidden">
            <div
              className="w-fit p-2 absolute top-0 right-0 cursor-pointer hover:text-red-600"
              onClick={handleClearImage}
            >
              <IoClose size={30} />
            </div>
            <div className="bg-white p-3">
              <img
                src={message.imageUrl}
                alt="uploadImage"
                className="aspect-square w-full h-full max-w-sm m-2 object-scale-down"
              />
            </div>
          </div>
        )}

        {loading && (
          <div className="w-full h-full flex sticky bottom-0 justify-center items-center">
            <Loading />
          </div>
        )}
      </section>

      <section className="h-16 bg-white flex items-center px-4">
        <div className="relative">
          <label className="flex justify-center items-center w-11 h-11 rounded-full hover:bg-primary hover:text-white cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setImage(e.target.files[0])}
            />
            Upload
          </label>
        </div>

        <form className="h-full w-full flex gap-2" onSubmit={handleSendMessage}>
          <input
            type="text"
            placeholder="Type here message..."
            className="py-1 px-4 outline-none w-full h-full"
            value={message.text}
            onChange={handleOnChange}
          />
          <button
            className="text-primary hover:text-secondary"
            type="button"
            onClick={handleUploadImage}
          >
            Upload Image
          </button>
          <button className="text-primary hover:text-secondary">
            <IoMdSend size={28} />
          </button>
        </form>
      </section>
    </div>
  );
};

export default MessagePage;
