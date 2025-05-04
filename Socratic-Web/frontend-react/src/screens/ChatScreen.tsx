// src/screens/ChatScreen.tsx
// v7: Refactored to use shared ApiClient and common-types

import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Chatbox from '../components/Chatbox';
import InputArea from '../components/InputArea';
// --- Import shared type ---
import { ApiHistoryMessage } from '@socratic/common-types'; // Import from shared package
// --- Import shared API client instance ---
import apiClientInstance from '../services/api'; // Import the configured shared client instance

// Removed local MessageData interface

const ChatScreen: React.FC = () => {
  // --- Use shared type for state ---
  const [messages, setMessages] = useState<ApiHistoryMessage[]>([]); // Use ApiHistoryMessage
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // --- End State ---

  // Initial greeting message using the shared type
  const initialMessage: ApiHistoryMessage = {
      role: 'assistant',
      content: 'Greetings. I do not have answers, only questions. Shall we think something through together?'
  };

  // Add initial message only once on mount
  useEffect(() => {
    setMessages([initialMessage]);
  }, []);

  // --- Send Message Handler using shared client ---
  const handleSendMessage = async (newMessageContent: string) => {
    setError(null);
    const newUserMessage: ApiHistoryMessage = { role: 'user', content: newMessageContent };

    // Add user message to state immediately for optimistic update
    // Use functional update to ensure we have the latest state
    let currentMessages: ApiHistoryMessage[] = [];
    setMessages(prevMessages => {
        currentMessages = [...prevMessages, newUserMessage];
        return currentMessages;
    });
    setIsLoading(true);

    try {
      // Prepare history for API (current messages array is already in the correct format)
      const historyForApi = currentMessages;
      console.log("[Web ChatScreen] Sending history:", historyForApi);

      // --- Call the API service function using the shared client instance ---
      // The instance automatically adds the auth token via its interceptor
      const responseText = await apiClientInstance.postDialogue(historyForApi);
      // --- End API Call ---

      if (responseText) {
        const aiResponse: ApiHistoryMessage = { role: 'assistant', content: responseText };
        setMessages(prev => [...prev, aiResponse]); // Add AI response
      } else {
         // Handle case where API returned null (error handled in apiClient)
         setError("Failed to get response from the AI.");
         // Revert optimistic update
         setMessages(prev => prev.slice(0, -1));
      }

    } catch (err: any) {
      // Catch errors not handled by apiClient's internal handler (e.g., network errors)
      console.error("Error calling dialogue API from ChatScreen:", err);
      setError(err.message || "An error occurred while fetching the response.");
      // Revert optimistic update
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };
  // --- End Send Message Handler ---

  // --- Clear Chat Handler ---
  const handleClearChat = () => {
      console.log("Clearing chat");
      // Reset messages to only the initial greeting
       setMessages([initialMessage]);
       setError(null); // Clear errors as well
  };
  // --- End Clear Chat Handler ---


  return (
    // Main container for the chat screen
    <div className="flex flex-col h-full overflow-hidden">
      {/* Pass handleClearChat to Header */}
      <Header onClearChat={handleClearChat} />

      {/* Display error above chatbox if exists */}
      {error && (
          <div className="p-2 bg-red-100 border-b border-red-300 text-red-700 text-center text-sm">
              {error}
          </div>
      )}

      {/* Pass messages and isLoading state down */}
      {/* Ensure Chatbox component expects ApiHistoryMessage[] */}
      <Chatbox messages={messages} isLoading={isLoading} />

      {/* Pass handler down */}
      <InputArea onSendMessage={handleSendMessage} />

    </div>
  );
};

export default ChatScreen;
