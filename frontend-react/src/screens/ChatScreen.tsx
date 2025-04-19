// src/screens/ChatScreen.tsx
// v3: Added isLoading state and passed it to Chatbox

import React, { useState } from 'react'; // Import useState
import Header from '../components/Header';
import Chatbox from '../components/Chatbox';
import InputArea from '../components/InputArea';
import { MessageData } from '../components/Message'; // Import MessageData type

// Define props expected from App.tsx
interface ChatScreenProps {
  isGuest: boolean;
  onLogout: () => void;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ isGuest, onLogout }) => {
  // --- State for Messages and Loading ---
  // Using dummy data initially for testing display
  const [messages, setMessages] = useState<MessageData[]>([
    { role: 'assistant', content: 'Hello! This is a test message.' },
    { role: 'user', content: 'Hi there! This is my reply.' },
    { role: 'assistant', content: 'Interesting. Tell me more.' },
    { role: 'user', content: 'Just testing the scrolling behavior.' },
    { role: 'assistant', content: 'Okay, does it scroll down?' },
    { role: 'user', content: 'Let\'s see...' },
    { role: 'assistant', content: 'The last message should be visible.' },
  ]);
  // Add isLoading state, default to false
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // --- End State ---

  // --- Temporary Send Message Handler (for testing) ---
  const handleSendMessage = (newMessageContent: string) => {
    const newUserMessage: MessageData = { role: 'user', content: newMessageContent };
    // Simulate adding user message and AI response after delay
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true); // Set loading true
    setTimeout(() => {
      const aiResponse: MessageData = { role: 'assistant', content: `AI reply to: ${newMessageContent}`};
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false); // Set loading false
    }, 1500); // Simulate 1.5 second delay
  };
  // --- End Temporary Handler ---

  return (
    // Main container for the chat screen
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        isGuest={isGuest}
        onLogout={onLogout}
        // Add other props like onClearChat later
      />

      {/* Pass messages AND isLoading state down */}
      <Chatbox messages={messages} isLoading={isLoading} />

      {/* Pass temporary handler down */}
      <InputArea onSendMessage={handleSendMessage} />

    </div>
  );
};

export default ChatScreen;
