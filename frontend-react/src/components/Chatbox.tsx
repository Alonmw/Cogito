// src/components/Chatbox.tsx
// v2: Renders messages and handles auto-scrolling

import React, { useEffect, useRef } from 'react';
import Message, { MessageData } from './Message'; // Import Message component and type

interface ChatboxProps {
  messages: MessageData[]; // Expect an array of message objects
  isLoading: boolean; // Add isLoading prop
}

const Chatbox: React.FC<ChatboxProps> = ({ messages, isLoading }) => {
  // Ref to the scrollable chatbox div
  const chatboxScrollRef = useRef<HTMLDivElement>(null);

  // Effect to scroll to bottom whenever messages array changes
  useEffect(() => {
    if (chatboxScrollRef.current) {
      // Scroll down smoothly after messages render
      // Use setTimeout to ensure scroll happens after DOM update
      setTimeout(() => {
        if (chatboxScrollRef.current) {
             chatboxScrollRef.current.scrollTo({
                top: chatboxScrollRef.current.scrollHeight,
                behavior: 'smooth' // Add smooth scrolling
             });
        }
      }, 50); // Small delay helps ensure rendering is complete
    }
  }, [messages]); // Dependency array: run effect when messages change

  return (
    // This container grows and handles scrolling
    <div
      ref={chatboxScrollRef} // Attach ref here
      className="flex-grow p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900"
    >
      {/* Map over messages array to render Message components */}
      {messages.map((msg, index) => (
        // Use index as key for now, consider unique IDs later if available
        <Message key={index} message={msg} />
      ))}

      {/* Loading Indicator */}
      {isLoading && (
         <div className="text-center p-4 text-gray-500 dark:text-gray-400">
           <i>AI is thinking...</i>
         </div>
      )}

      {/* You might want a small spacer at the bottom */}
      <div className="h-2"></div>
    </div>
  );
};

export default Chatbox;
