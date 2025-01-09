import { RiCloseFill } from 'react-icons/ri';

const ChatHeader = () => {
  return (
    <div className="h-[10vh] border-b-2 border-[#2f303b] flex items-center justify-between px-20">
        <div className="flex gap-5 items-center">
            <div className="flex items-center gap-3 justify-center">
                <div className="felx items-center gap-5 justify-center">
                    <button className="text-neutral-500 hover:text-white text-2xl focus:outline-none duration-300 transition-all p-2 rounded-full hover:bg-neutral-800">
                        <RiCloseFill className='text-3xl' />
                    </button>
                </div>
            </div>
        </div>
    </div>
  )
}

export default ChatHeader