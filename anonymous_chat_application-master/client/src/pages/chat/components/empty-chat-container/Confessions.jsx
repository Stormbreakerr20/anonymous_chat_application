import React, { useState, useEffect, useRef } from "react";
import { useAppStore } from "@/store";
import { toast } from "sonner";
import moment from "moment";
import axios from "axios";
import socket from "../../../../socket";
import { IoMdClose } from "react-icons/io";
import { FaArrowLeft } from "react-icons/fa"; // Add this import
import { useNavigate } from "react-router-dom"; // Add this import
import './Confession.css';

const Confessions = ({ selectedInfo }) => {
  const [messages, setMessages] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const { userInfo } = useAppStore();
  const [formData, setFormData] = useState({
    to: "",
    content: "",
    anonymous: true,
    category: "crush", // Replace mood with category
    backgroundColor: "from-purple-500 to-pink-500" // Add background color option
  });
  const lastMessageRef = useRef(null);
  const MAX_CONTENT_LENGTH = 300; // Add max length constant
  const [selectedImage, setSelectedImage] = useState(null);
  const navigate = useNavigate(); // Add this hook

  // Add this constant at the top of your component
  const COOLDOWN_TIME = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds

  // Add these new states
  const [lastConfessionTime, setLastConfessionTime] = useState(
    localStorage.getItem('lastConfessionTime') || null
  );
  const [timeRemaining, setTimeRemaining] = useState(null);
  
  // Fix the checkCooldown function
  const checkCooldown = () => {
    if (!lastConfessionTime) return false;
    
    const lastTime = new Date(parseInt(lastConfessionTime));
    const now = new Date();
    const diffInMs = now.getTime() - lastTime.getTime();
    
    return diffInMs < COOLDOWN_TIME;
  };

  // Update the calculateTimeRemaining function
  const calculateTimeRemaining = () => {
    if (!lastConfessionTime) return null;
    
    const lastTime = new Date(parseInt(lastConfessionTime));
    const now = new Date();
    const endTime = new Date(lastTime.getTime() + COOLDOWN_TIME);
    const diffInMs = endTime.getTime() - now.getTime();
    
    if (diffInMs <= 0) {
      setTimeRemaining(null);
      setLastConfessionTime(null);
      localStorage.removeItem('lastConfessionTime');
      return null;
    }
    
    const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${days}d ${hours}h ${minutes}m`;
  };

  // Update the timer effect to run more frequently and handle expiration
  useEffect(() => {
    // Calculate immediately when mounted
    if (lastConfessionTime) {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);
      
      // If cooldown has expired, clear the lastConfessionTime
      if (!remaining) {
        setLastConfessionTime(null);
        localStorage.removeItem('lastConfessionTime');
      }
    }

    // Then set up the interval to check more frequently (every second)
    const timer = setInterval(() => {
      if (lastConfessionTime) {
        const remaining = calculateTimeRemaining();
        setTimeRemaining(remaining);
        
        // If cooldown has expired, clear the lastConfessionTime
        if (!remaining) {
          setLastConfessionTime(null);
          localStorage.removeItem('lastConfessionTime');
          toast.success("You can now send a new confession!");
        }
      }
    }, 100); // Check every 100ms for smoother countdown

    return () => clearInterval(timer);
  }, [lastConfessionTime]);

  useEffect(() => {
    fetchConfessions();
    
    socket.on("receiveMessage", handleNewConfession);
    
    return () => {
      socket.off("receiveMessage", handleNewConfession);
    };
  }, [selectedInfo.id]);

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const fetchConfessions = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/channels/${selectedInfo.id}/messages`);
      const data = await response.json();
      // Make sure each message has a backgroundColor
      const messagesWithStyle = data.messages.map(msg => ({
        ...msg,
        backgroundColor: msg.backgroundColor || 'from-purple-500 to-pink-500' // Fallback style
      }));
      setMessages(messagesWithStyle);
    } catch (error) {
      console.error("Error fetching confessions:", error);
    }
  };

  const handleNewConfession = (message) => {
    if (message.channelId === selectedInfo.id) {
      const formattedMessage = {
        ...message,
        backgroundColor: message.backgroundColor || 'from-purple-500 to-pink-500', // Add fallback
        userId: {
          firstName: message.userId.firstName || message.userId?.name?.split(' ')[0] || '',
          lastName: message.userId.lastName || message.userId?.name?.split(' ')[1] || ''
        }
      };
      setMessages(prev => [...prev, formattedMessage]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (checkCooldown()) {
      toast.error("You can only send one confession every 3 days!");
      return;
    }
    if (formData.content.length > MAX_CONTENT_LENGTH) {
      toast.error(`Message too long! Maximum ${MAX_CONTENT_LENGTH} characters allowed.`);
      return;
    }

    try {
      // Include backgroundColor in the message
      const message = {
        channelId: selectedInfo.id,
        userId: userInfo.id,
        content: formData.content,
        to: formData.to,
        category: formData.category,
        anonymous: formData.anonymous,
        backgroundColor: formData.backgroundColor  // Make sure this is included
      };

      const response = await fetch(
        `http://localhost:3000/api/channels/${selectedInfo.id}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(message),
        }
      );

      const data = await response.json();
      
      // Make sure the backgroundColor is included in the emitted message
      const formattedMessage = {
        ...data.message,
        userId: {
          firstName: userInfo.firstName,
          lastName: userInfo.lastName
        },
        backgroundColor: formData.backgroundColor  // Add this explicitly
      };
      
      socket.emit("newMessage", formattedMessage);
      setShowForm(false);
      setFormData({
        to: "",
        content: "",
        anonymous: true,
        category: "crush",
        backgroundColor: "from-purple-500 to-pink-500"
      });
      setLastConfessionTime(Date.now().toString());
      localStorage.setItem('lastConfessionTime', Date.now().toString());
      toast.success("Confession sent successfully!");
    } catch (error) {
      toast.error("Failed to send confession");
    }
  };

  // Update form content with character limit
  const handleContentChange = (e) => {
    const content = e.target.value;
    if (content.length <= MAX_CONTENT_LENGTH) {
      setFormData(prev => ({ ...prev, content }));
    }
  };

  const backgroundOptions = [
    { name: "Purple Love", value: "from-purple-500 to-pink-500" },
    { name: "Ocean Blue", value: "from-blue-500 to-cyan-500" },
    { name: "Sunset", value: "from-orange-500 to-red-500" },
    { name: "Forest", value: "from-green-500 to-emerald-500" }
  ];

  const categories = [
    { name: "Crush", value: "crush" },
    { name: "Secret", value: "secret" },
    { name: "Appreciation", value: "appreciation" },
    { name: "Regret", value: "regret" }
  ];

  const handleCardClick = (message) => {
    setSelectedImage(message);
  };

  // Update the renderActionButton to show loading state
  const renderActionButton = () => {
    if (checkCooldown()) {
      if (!timeRemaining) {
        return (
          <div className="cooldown-timer">
            <span className="cooldown-text">Calculating...</span>
          </div>
        );
      }
      
      return (
        <div className="cooldown-timer">
          <span className="cooldown-text">Next confession in:</span>
          <span className="time-remaining">{timeRemaining}</span>
        </div>
      );
    }
    
    return (
      <button
        onClick={() => setShowForm(true)}
        className="new-confession-btn"
      >
        New Confession
      </button>
    );
  };

  return (
    <div className="confessions-container">
      <div className="header">
        <div className="header-left">
          <button 
            onClick={() => navigate('/')} 
            className="back-button"
          >
            <FaArrowLeft />
          </button>
          <h1 className="header-title">Confessions</h1>
        </div>
        {renderActionButton()}
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-title">
              <h2 className="modal-title-text">New Confession</h2>
              <button
                onClick={() => setShowForm(false)}
                className="modal-close-btn"
              >
                <IoMdClose size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div>
                <label className="modal-label">To:</label>
                <input
                  type="text"
                  value={formData.to}
                  onChange={(e) => setFormData(prev => ({ ...prev, to: e.target.value }))}
                  className="modal-input"
                  placeholder="Who is this confession for?"
                  required
                />
              </div>
              
              <div>
                <label className="modal-label">Category:</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="modal-select"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="modal-label">Card Style:</label>
                <div className="modal-bg-options">
                  {backgroundOptions.map(bg => (
                    <button
                      key={bg.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, backgroundColor: bg.value }))}
                      className={`modal-bg-option ${formData.backgroundColor === bg.value ? 'selected' : ''} bg-gradient-to-r ${bg.value}`}
                    >
                      {bg.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="modal-label">Your Confession:</label>
                <textarea
                  value={formData.content}
                  onChange={handleContentChange}
                  className="modal-textarea"
                  placeholder="Write your confession here..."
                  required
                />
                <div className="modal-char-count">
                  {formData.content.length}/{MAX_CONTENT_LENGTH}
                </div>
              </div>

              <div className="modal-checkbox">
                <input
                  type="checkbox"
                  checked={formData.anonymous}
                  onChange={(e) => setFormData(prev => ({ ...prev, anonymous: e.target.checked }))}
                  className="modal-checkbox-input"
                />
                <label className="modal-checkbox-label">Stay Anonymous</label>
              </div>

              <div className="modal-actions">
                <button
                  type="submit"
                  className="modal-submit-btn"
                >
                  Send Confession
                </button>
              </div>
              <div className="char-count-wrapper">
                <span className="char-limit-text">
                  {formData.content.length}/{MAX_CONTENT_LENGTH}
                </span>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="messages-grid">
        {messages.map((message, index) => (
          <div
            key={message._id}
            ref={index === messages.length - 1 ? lastMessageRef : null}
            className={`message-card bg-gradient-to-r ${message.backgroundColor}`}
            onClick={() => handleCardClick(message)}
          >
            <div className="message-content">
              <div className="message-header">
                <p className="message-to">To: {message.to}</p>
                <span className="message-category">
                  {message.category}
                </span>
              </div>
              <div className="message-body">
                <p className="message-text">
                  {message.content}
                </p>
                {message.content.length > 150 && (
                  <button 
                    className="message-read-more"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(message);
                    }}
                  >
                    Read more
                  </button>
                )}
              </div>
              <div className="message-footer">
                <span className="message-author">
                  {message.anonymous ? "Anonymous" : `${message.userId?.firstName || ''} ${message.userId?.lastName || ''}`}
                </span>
                <span className="message-timestamp">
                  {moment(message.createdAt).fromNow()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedImage && (
        <div 
          className="modal-overlay"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className={`expanded-message bg-gradient-to-r ${selectedImage.backgroundColor}`}
            onClick={e => e.stopPropagation()}
          >
            <div className="expanded-message-content">
              <div className="expanded-modal-header">
                <p className="modal-message-to">To: {selectedImage.to}</p>
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="modal-close-btn"
                >
                  <IoMdClose size={18} />
                </button>
              </div>
              <p className="modal-message-text">
                {selectedImage.content}
              </p>
              <div className="modal-message-footer">
                <span className="modal-message-author">
                  {selectedImage.anonymous 
                    ? "Anonymous" 
                    : `${selectedImage.userId?.firstName || ''} ${selectedImage.userId?.lastName || ''}`}
                </span>
                <span className="modal-message-timestamp">
                  {moment(selectedImage.createdAt).format('MMMM Do YYYY, h:mm a')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Confessions;
