import React, { useState, useContext, useEffect } from 'react';
import './Chatbot.css'; // Make sure to style it appropriately
import AccountContext from '../../../Context/AccountContext'; // Ensure correct path

// Replace these with your actual API Gateway endpoints
const endpoints = {
  'popular album': 'https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/popularalbumforbot',
  'popular track': 'https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/populartrackforbot',
  'popular artist': 'https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/popularartistforbot',
  'popular genre': 'https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/populargenre',
};

const getEndpoint = (query) => {
  const normalizedQuery = query.toLowerCase().trim();
  if (normalizedQuery.includes('album')) {
    return endpoints['popular album'];
  } else if (normalizedQuery.includes('track')) {
    return endpoints['popular track'];
  } else if (normalizedQuery.includes('artist')) {
    return endpoints['popular artist'];
  } else if (normalizedQuery.includes('genre')) {
    return endpoints['popular genre'];
  }
  return null;
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const { getsession } = useContext(AccountContext);

  useEffect(() => {
    // Check user session and role on component mount
    getsession()
      .then((sessionData) => {
        console.log("User session:", sessionData);

        // Get email from session data
        const email = localStorage.getItem('email');

        // Check if the user is the admin user
        if (email === 'chamodjanaka90@gmail.com') {
          setIsAdmin(true);
        } else {
          setIsAuthenticated(true); // Set user as authenticated if they are not the admin
        }
      })
      .catch((err) => {
        console.error("Failed to fetch user session", err);
        setIsAuthenticated(false); // User not authenticated
      });
  }, [getsession]);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSend = async () => {
    if (input.trim()) {
      // Add user's message to the chat
      setMessages((prevMessages) => [...prevMessages, { sender: 'user', text: input }]);
      const endpoint = getEndpoint(input);

      if (endpoint) {
        try {
          // Make a GET request to the correct endpoint
          const response = await fetch(`${endpoint}?question=${encodeURIComponent(input)}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          });
          const result = await response.json();

          // Add bot's response to the chat
          setMessages((prevMessages) => [...prevMessages, { sender: 'bot', text: result.message }]);
        } catch (error) {
          console.error('Error fetching from API:', error);
          setMessages((prevMessages) => [...prevMessages, { sender: 'bot', text: 'Sorry, something went wrong!' }]);
        }
      } else {
        setMessages((prevMessages) => [...prevMessages, { sender: 'bot', text: 'I do not understand that query.' }]);
      }

      // Clear the input box after sending the message
      setInput('');
    }
  };

  // Render nothing if the user is not authenticated or is the admin
  if (!isAuthenticated || isAdmin) return null;

  return (
    <div className={`chatbot ${isOpen ? 'open' : ''}`}>
      <button className="chatbot-toggle" onClick={toggleChat}>
        Chat
      </button>
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`chatbot-message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
          </div>
          <div className="chatbot-input-container">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me about popular albums, tracks, artists, or genres..."
            />
            <button onClick={handleSend}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
