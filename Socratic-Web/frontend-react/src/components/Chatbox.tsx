// src/components/Chatbox.tsx
// v3: Refactored to use shared ApiHistoryMessage type

import React, { useEffect, useRef } from 'react';
import Message from './Message'; // Keep importing Message component
// --- Import shared type ---
import { ApiHistoryMessage } from '@socratic/common-types'; // Adjust path if needed

// --- Removed local MessageData import ---

interface ChatboxProps {
  // --- Use shared type for messages prop ---
  messages: ApiHistoryMessage[];
  isLoading: boolean;
}

const Chatbox: React.FC<ChatboxProps> = ({ messages, isLoading }) => {
  // Ref to the scrollable chatbox div
  const chatboxScrollRef = useRef<HTMLDivElement>(null);

  // Effect to scroll to bottom whenever messages array changes
  useEffect(() => {
    if (chatboxScrollRef.current) {
      setTimeout(() => {
        if (chatboxScrollRef.current) {
             chatboxScrollRef.current.scrollTo({
                top: chatboxScrollRef.current.scrollHeight,
                behavior: 'smooth'
             });
        }
      }, 50);
    }
  }, [messages]);

  return (
    // This container grows and handles scrolling
    <div
      ref={chatboxScrollRef}
      className="flex-grow p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900"
    >
      {/* Map over messages array (now ApiHistoryMessage[]) */}
      {messages.map((msg, index) => (
        // Pass the ApiHistoryMessage object to the Message component
        // Use a more stable key if possible, e.g., message ID if backend provides one
        <Message key={msg.role + index} message={msg} /> // Key updated slightly
      ))}

      {/* Loading Indicator */}
      {isLoading && (
         <div className="text-center p-4 text-gray-500 dark:text-gray-400">
           <i>Reasoning...</i>
         </div>
      )}

      {/* You might want a small spacer at the bottom */}
      <div className="h-2"></div>
    </div>
  );
};

export default Chatbox;
