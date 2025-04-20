// src/screens/ChatScreen.tsx
// v6: Implemented real handleSendMessage using API service

import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Chatbox from '../components/Chatbox';
import InputArea from '../components/InputArea';
import { MessageData } from '../components/Message';
// No longer need useAuth directly in this component if Header handles auth display/logout
// import { useAuth } from '../context/AuthContext';
import { postDialogue } from '../services/api'; // Import API function

// Removed props interface

const ChatScreen: React.FC = () => {
  // const { currentUser } = useAuth(); // Removed - Header uses context directly

  // --- Real State for Chat ---
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // --- End State ---

  // Add initial message only once on mount
  useEffect(() => {
    setMessages([
        { role: 'assistant', content: 'Greetings. I do not have answers, only questions. Shall we think something through together?' }
    ]);
  }, []);

  // --- Real Send Message Handler ---
  const handleSendMessage = async (newMessageContent: string) => {
    setError(null); // Clear previous errors
    const newUserMessage: MessageData = { role: 'user', content: newMessageContent };

    // Add user message to state immediately for optimistic update
    const currentMessages = [...messages, newUserMessage];
    setMessages(currentMessages);
    setIsLoading(true); // Set loading true

    try {
      // Prepare history for API (current messages array)
      const historyForApi = currentMessages;

      // Call the API service function
      // api.ts (api_service_v4) handles getting/adding the auth token internally
      const data = await postDialogue(historyForApi);

      if (data && data.response) {
        const aiResponse: MessageData = { role: 'assistant', content: data.response };
        setMessages(prev => [...prev, aiResponse]); // Add AI response
      } else {
         // Handle case where API returns success but no response content
         setError("Received an empty or invalid response from the AI.");
         // Remove the optimistic user message if AI response fails? Optional.
         // setMessages(messages);
      }

    } catch (err: any) {
      console.error("Error calling dialogue API:", err);
      // Display error message to the user
      setError(err.message || "An error occurred while fetching the response.");
      // Remove the optimistic user message when the API call fails
      setMessages(messages); // Revert to state before optimistic update
    } finally {
      setIsLoading(false); // Set loading false
    }
  };
  // --- End Send Message Handler ---

  // --- Clear Chat Handler ---
  const handleClearChat = () => {
      console.log("Clearing chat");
      // Reset messages to only the initial greeting
       setMessages([
           { role: 'assistant', content: 'Greetings. I do not have answers, only questions. Shall we think something through together?' }
       ]);
       setError(null); // Clear errors as well
  };
  // --- End Clear Chat Handler ---


  return (
    // Main container for the chat screen
    <div className="flex flex-col h-full overflow-hidden">
      {/* Pass handleClearChat to Header */}
      {/* Header gets auth state directly from context */}
      <Header onClearChat={handleClearChat} />

      {/* Display error above chatbox if exists */}
      {error && (
          <div className="p-2 bg-red-100 border-b border-red-300 text-red-700 text-center text-sm">
              {error}
          </div>
      )}

      {/* Pass real messages and isLoading state down */}
      <Chatbox messages={messages} isLoading={isLoading} />

      {/* Pass real handler down */}
      <InputArea onSendMessage={handleSendMessage} />

    </div>
  );
};

export default ChatScreen;
