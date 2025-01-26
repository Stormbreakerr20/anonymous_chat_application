import { useAppStore } from "@/store";
import { GET_ALL_MESSAGES_ROUTE } from "@/utils/constants";
import { get, set } from "lodash";
import moment from "moment";
import { useEffect, useRef } from "react";

const MessageContainer = () => {
    const scrollRef = useRef(null); // Initialize with null
    const { selectedChatType, selectedChatData, userInfo, selectedChatMessages,setSelectedChatMessages } = useAppStore();

    useEffect(()=>{
      const getMessages = async () => {  
try{
  const res = await axios.post(GET_ALL_MESSAGES_ROUTE,{id: selectedChatData._id},{withCredentials: true});
  setSelectedChatMessages(res.data.messages);
}catch(error){
  console.log({error});
      }
      
      if (selectedChatData._id){
          if (selectedChatType === "contact") {
            getMessages();
          }
        }
      }
    },[selectedChatData,selectedChatType,setSelectedChatMessages])

    // Scroll to the bottom whenever selectedChatMessages change
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [selectedChatMessages]);

    const renderMessages = () => {
        if (!Array.isArray(selectedChatMessages)) {
            console.error("selectedChatMessages is not an array");
            return null;
        }

        let lastDate = null; // To track date changes for rendering
        return selectedChatMessages.map((message, index) => {
            const messageDate = moment(message.timestamp).format("YYYY-MM-DD");
            const showDate = messageDate !== lastDate; // Show date only if it's different from the last
            lastDate = messageDate;

            return (
                <div key={index}>
                    {showDate && (
                        <div className="text-center text-gray-500 my-2">
                            {moment(message.timestamp).format("LL")}
                        </div>
                    )}
                    {selectedChatType === "contact" && renderDMMessages(message)}
                    <div ref={scrollRef}></div>
                </div>
            );
        });
    };

    const renderDMMessages = (message) => (
        <div
            className={`${
                message.sender === selectedChatData._id ? "text-left" : "text-right"
            }`}
        >
            {message.messageType === "text" && (
                <div
                    className={`${
                        message.sender !== selectedChatData._id
                            ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
                            : "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20"
                    } border inline-block p-4 rounded my-1 max-w-[50%] break-words`}
                >
                    {message.content}
                </div>
            )}
            <div className="text-xs text-gray-600">
                {moment(message.timestamp).format("LT")}
            </div>
        </div>
    );

    return <div className="message-container">{renderMessages()}</div>;
};

export default MessageContainer;