import NewDM from "./components/new-dm";
import ProfileInfo from "./components/profile-info";

const Logo = () => {
    return (
      <div className="flex p-5  justify-start items-center gap-2">
        <svg
          id="logo-38"
          width="78"
          height="32"
          viewBox="0 0 78 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {" "}
          <path
            d="M55.5 0H77.5L58.5 32H36.5L55.5 0Z"
            className="ccustom"
            fill="#8338ec"
          ></path>{" "}
          <path
            d="M35.5 0H51.5L32.5 32H16.5L35.5 0Z"
            className="ccompli1"
            fill="#975aed"
          ></path>{" "}
          <path
            d="M19.5 0H31.5L12.5 32H0.5L19.5 0Z"
            className="ccompli2"
            fill="#a16ee8"
          ></path>{" "}
        </svg>
        <span className="text-3xl font-semibold ">Shadow</span>
      </div>
    );
  };
  

const ContactsContainer = ({ channels, onSelectChannel }) => {
  return (
    <div className="relative md:w-[35vw] lg:w-[30vw] xl:w-[20vw] h-full bg-[#1b1c24] border-r-2 border-[#2f303b] w-full">
      <div className="pt-3">
        <Logo />
      </div>
      <div className="my-5">
        <div className="flex items-center justify-between pr-10">
          <Title text="Direct Messages" />
          <NewDM />
        </div>
      </div>
      <div className="my-5">
        <div className="flex items-center justify-between pr-10">
          <Title text="Channels" />
        </div>
        <ul className="pl-10 mt-3 space-y-2">
          {channels.map((channel) => (
            <li
              key={channel._id}
              className="p-2 bg-[#2a2b36] hover:bg-[#3a3b47] rounded cursor-pointer"
              onClick={() => onSelectChannel(channel)} // Call parent function on click
            >
              <div className="font-bold text-white">{channel.name}</div>
              <div className="text-sm text-gray-400">{channel.description}</div>
            </li>
          ))}
        </ul>
      </div>
      <ProfileInfo />
    </div>
  );
};

export default ContactsContainer; 

const Title = ({text}) => {
  return (
    <h6 className="uppercase tracking-widest text-neutral-400 pl-10 font-light text-opacity-90 text-sm">
        {text}
    </h6>
  )
};