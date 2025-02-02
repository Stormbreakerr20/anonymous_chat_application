import Lottie from "react-lottie";
import { animationDefaultOptions } from "@/lib/utils";
import ChatRoom from "./ChatRoom";
import DMRoom from "../contacts-container/components/new-dm/MessagePage";

const EmptyChatContainer = ({ selectedInfo }) => {
  console.log(selectedInfo);

  //  useEffect(() => {
    // // Listen for 'channelToDM' event from the server
    // socket.on('channelToDM', (userId) => {
    //   onSelect("dm",userId)
    //   // console.log(`DM received from user ${senderId}`);
    //   // Here, you can handle the incoming message:
    //   // For example, you can update the state with the sender's info or show a notification
    //   // setDmMessage(`You have received a DM from ${senderId}`);
    // });

    // Clean up the listener when the component unmounts
  //   return () => {
  //     socket.off('channelToDM');
  //   };
  // }, []);
  if (!selectedInfo || !selectedInfo.type) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center bg-[#1c1d25]">
        <Lottie
          isClickToPauseDisabled={true}
          height={200}
          width={200}
          options={animationDefaultOptions}
        />
        <h3 className="text-white text-3xl mt-4">
          Welcome to <span className="text-purple-500">Shadow</span> Talk!
        </h3>
      </div>
    );
  }

switch (selectedInfo.type) {
    case "channel":
      return <ChatRoom selectedInfo={selectedInfo} />;
    case "dm":
      return <DMRoom userId={selectedInfo.id} />;
    default:
      return <div className="text-white">Invalid Selection</div>;
  }
};

export default EmptyChatContainer;
