import EmojiPicker, { Emoji } from "emoji-picker-react";
import { useEffect, useRef, useState } from "react";
import { GrAttachment } from "react-icons/gr";
import { IoSend } from "react-icons/io5";
import { RiEmojiStickerLine } from "react-icons/ri";

const MessageBar = () => {

    const emojiRef = useRef();
    const [message, setMessage] = useState("");
    const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

    useEffect(() => {
        function handleClickOutside(event) {
            if (emojiRef.current && !emojiRef.current.contains(event.target)) {
                setEmojiPickerOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [emojiRef]);

    const handleAddEmoji = (emoji) => {
        setMessage((msg)=> msg + emoji.emoji);
    };
    const handleSendMesssage = async () => {

    };

  return (
    <div className="h-[10vh] bg-[#1c1d25] flex items-center justify-between px-8 mb-6 gap-6">
        <div className="flex-1 flex bg-[#2a2b33] rounded-md items-center gap-5 pr-5">
            <input type="text" placeholder="Type a message" className="flex-1 p-5 rounded-md bg-transparent focus:border-none focus:outline-none"
            value={message} onChange={(e) => setMessage(e.target.value)} />
            <button className=" hover:text-white rounded-md text-2xl focus:outline-none duration-300 transition-all p-2 hover:bg-neutral-800">
                <GrAttachment className="text-2xl" />
            </button>
            <div className="relative">
            <button className=" hover:text-white rounded-md text-2xl focus:outline-none duration-300 transition-all p-2 hover:bg-neutral-800"
                onClick={() => setEmojiPickerOpen(true)} 
                
            >
                <RiEmojiStickerLine className="text-2xl" />
            </button>
            <div className="absolute bottom-16 right-0" ref={emojiRef}>
                <EmojiPicker theme="dark"
                    open={emojiPickerOpen}
                    onEmojiClick={handleAddEmoji}
                    autoFocusSearch={false}
                />
            </div>
            </div>  
            
        </div>
        <button className="bg-[#8417ff] flex items-center justify-center p-5 hover:text-white rounded-md focus:outline-none duration-300 transition-all hover:bg-[#741bda] focus:bg-[#741bda]"
            onClick={handleSendMesssage}
        >
            <IoSend className="text-2xl" />
        </button>
        </div>
  )
}

export default MessageBar