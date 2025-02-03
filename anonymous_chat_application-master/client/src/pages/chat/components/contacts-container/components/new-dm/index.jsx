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
        <DialogContent className="dialog-wrapper max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle className="dialog-header text-xl font-semibold">Please Select a Contact</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Search Contacts"
            className="search-input p-3 border rounded-lg mb-4 w-full bg-gray-100 text-gray-800"
            onChange={(e) => searchContacts(e.target.value)}
          />
          
          <ScrollArea className="contacts-list max-h-60 overflow-auto">
            <div className="flex flex-col gap-3">
              {searchedContacts.map((contact) => (
                <div
                  key={contact._id}
                  className="contact-item p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-200 rounded-lg transition-colors"
                  onClick={() => handleSelectContact(contact._id)}
                >
                  <Avatar className="contact-avatar w-12 h-12">
                    {contact.image ? (
                      <AvatarImage
                        src={contact.image}
                        alt={`${contact.firstName || contact.email}'s profile`}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center uppercase bg-gray-500 text-white rounded-full">
                        {contact.firstName?.charAt(0) || contact.email?.charAt(0)}
                      </div>
                    )}
                  </Avatar>

                  <div className="contact-info flex flex-col">
                    <p className="contact-name text-lg font-semibold text-gray-900">{contact.firstName}</p>
                    <p className="contact-email text-sm text-gray-600">{contact.email}</p>
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
