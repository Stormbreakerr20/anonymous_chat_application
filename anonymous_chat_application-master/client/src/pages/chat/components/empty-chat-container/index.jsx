import Lottie from "react-lottie";
import { animationDefaultOptions } from "@/lib/utils";
import ChatRoom from "./ChatRoom";
import DMRoom from "../contacts-container/components/new-dm/MessagePage";
import Confessions from "./Confessions";
import './index.css';

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
      <div className="empty-container">
        <div className="welcome-animation">
          <Lottie
            isClickToPauseDisabled={true}
            height={200}
            width={200}
            options={animationDefaultOptions}
          />
        </div>
        <h3 className="welcome-text">
          Welcome to <span className="welcome-highlight">Shadow</span> Talk!
        </h3>
      </div>
    );
  }

  const renderContent = () => {
    switch (selectedInfo.type) {
      case "channel":
        if (selectedInfo.name === "Confessions") {
          return <Confessions selectedInfo={selectedInfo} />;
        }
        return <ChatRoom selectedInfo={selectedInfo} />;
      case "dm":
        return <DMRoom userId={selectedInfo.id} />;
      default:
        return <div className="text-white">Invalid Selection</div>;
    }
  };

  return (
    <div className="content-container">
      {renderContent()}
    </div>
  );
};

export default EmptyChatContainer;
