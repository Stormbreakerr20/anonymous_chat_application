import { useNavigate } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { apiClient } from "@/lib/api-client";
import { SEARCH_CONTACTS_ROUTES } from "@/utils/constants";
import './index.css';

const NewDM = ({ onSelecting }) => {
  const [openNewContactModal, setOpenNewContactModal] = useState(false);
  const [searchedContacts, setSearchedContacts] = useState([]);
  const navigate = useNavigate();

  const searchContacts = async (searchTerm) => {
    try {
      if (searchTerm.length > 0) {
        const response = await apiClient.post(
          SEARCH_CONTACTS_ROUTES,
          { searchTerm },
          { withCredentials: true }
        );
        if (response.status === 200 && response.data.contacts) {
          setSearchedContacts(response.data.contacts);
        }
      } else {
        setSearchedContacts([]);
      }
    } catch (error) {
      console.log({ error });
      setSearchedContacts([]);
    }
  };

  const handleSelectContact = (contact) => {
    onSelecting(contact); // Pass the selected contact back to the parent
    setOpenNewContactModal(false); // Close the modal
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="flex items-center justify-center">
            <FaPlus size={20} className="new-dm-button" onClick={() => setOpenNewContactModal(true)} />
          </TooltipTrigger>
          <TooltipContent className="tooltip-content">
            Select New Contact
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Dialog open={openNewContactModal} onOpenChange={setOpenNewContactModal}>
        <DialogContent className="dialog-wrapper">
          <DialogHeader>
            <DialogTitle className="dialog-header">Please Select a Contact</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Search Contacts"
            className="search-input"
            onChange={(e) => searchContacts(e.target.value)}
          />
          <ScrollArea className="contacts-list">
            <div className="flex flex-col gap-2">
              {searchedContacts.map((contact) => (
                <div
                  key={contact._id}
                  className="contact-item"
                  onClick={() => handleSelectContact(contact._id)}
                >
                  <Avatar className="contact-avatar">
                    {contact.image ? (
                      <AvatarImage
                        src={`${import.meta.env.VITE_HOST}/${contact.image}`}
                        alt="profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center uppercase">
                        {contact.firstName?.charAt(0) || contact.email?.charAt(0)}
                      </div>
                    )}
                  </Avatar>
                  <div className="contact-info">
                    <p className="contact-name">{contact.name}</p>
                    <p className="contact-email">{contact.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NewDM;
