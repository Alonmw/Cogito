// app/(tabs)/index.tsx - Using Gifted Chat
import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, Platform } from 'react-native'; // Removed KeyboardAvoidingView, Text, Button etc.
import { GiftedChat, IMessage, User } from 'react-native-gifted-chat'; // Import Gifted Chat components
import { useAuth } from '@/src/context/AuthContext';
import { postDialogue } from '@/src/services/api'; // Import your API service
import { Alert } from 'react-native'; // Keep Alert for errors

// Define user objects for Gifted Chat
const USER: User = {
    _id: 1, // Or use Firebase user.uid if available and consistent
    name: 'User', // Can be updated with user.displayName
    // avatar: 'path/to/user/avatar.png' // Optional
};

const ASSISTANT: User = {
    _id: 2, // Needs a unique ID for the assistant
    name: 'Socratic Partner',
    // avatar: 'path/to/assistant/avatar.png' // Optional
};

export default function ChatScreen() {
  const { user } = useAuth(); // Get Firebase user
  const [messages, setMessages] = useState<IMessage[]>([]); // State uses Gifted Chat's IMessage type
  const [isLoading, setIsLoading] = useState(false); // State for loading AI response

  // Optional: Set initial message or load history when component mounts
  useEffect(() => {
    setMessages([
      {
        _id: 1, // Unique ID for the message
        text: 'Hello! How can I help you explore your thoughts today?',
        createdAt: new Date(),
        user: ASSISTANT, // Use the assistant user object
      },
    ]);
  }, []);


  // Helper function to get numeric timestamp
  const getTimestamp = (dateOrNumber: Date | number | undefined): number => {
      if (dateOrNumber instanceof Date) {
          return dateOrNumber.getTime();
      }
      if (typeof dateOrNumber === 'number') {
          return dateOrNumber;
      }
      // Fallback for undefined or unexpected type
      return 0;
  };

  // Map Gifted Chat's IMessage back to our API format
  const mapToApiHistory = (msgs: IMessage[]) => {
      return msgs
          // --- Fixed Sort Logic ---
          .sort((a, b) => getTimestamp(b.createdAt) - getTimestamp(a.createdAt)) // Sort descending (newest first in sorted array)
          // --- End Fixed Sort Logic ---
          .map(msg => ({
              role: msg.user._id === USER._id ? 'user' : 'assistant',
              content: msg.text
          }));
      // IMPORTANT: Double-check if your backend expects newest message first or last in the history array.
      // If it expects oldest first, change sort to: .sort((a, b) => getTimestamp(a.createdAt) - getTimestamp(b.createdAt))
  };

  // Function called when the user presses the send button in Gifted Chat
  const onSend = useCallback(async (newMessages: IMessage[] = []) => {
    if (!user || isLoading) {
        if (!user) Alert.alert("Error", "You must be logged in to chat.");
        return;
    }

    // Append the new user message(s) sent from Gifted Chat UI
    // Use a functional update to ensure we have the latest state
    let updatedMessages: IMessage[] = [];
    setMessages((previousMessages) => {
        updatedMessages = GiftedChat.append(previousMessages, newMessages);
        return updatedMessages;
    });

    setIsLoading(true); // Show loading indicator

    // Prepare history for API call using the latest state
    const currentHistory = mapToApiHistory(updatedMessages); // Use the updated state

    try {
      console.log('[API Call] Sending history:', currentHistory);
      const responseText = await postDialogue(currentHistory as any); // Cast if needed, ensure postDialogue accepts correct format

      if (responseText) {
        const aiResponse: IMessage = {
          _id: `assistant-${Date.now()}`, // Generate unique ID
          text: responseText,
          createdAt: new Date(),
          user: ASSISTANT, // Use the assistant user object
        };
        // Append the AI response
        setMessages((previousMessages) =>
          GiftedChat.append(previousMessages, [aiResponse]), // Append requires an array
        );
      } else {
        Alert.alert("Error", "Failed to get response from assistant.");
        // Optional: Handle UI feedback for error (e.g., add an error message to the chat)
      }
    } catch (error) {
      console.error("Error in onSend calling postDialogue:", error);
      Alert.alert("Error", "An unexpected error occurred.");
      // Optional: Handle UI feedback for error
    } finally {
      setIsLoading(false);
    }
  }, [user, isLoading]); // Removed messages from dependency array, using functional update instead

  return (
    <View style={styles.container}>
      <GiftedChat
        messages={messages}
        onSend={newMessages => onSend(newMessages)}
        user={USER} // Tell Gifted Chat who the current user is
        isLoadingEarlier={isLoading} // Can be used for loading history indicator
        isTyping={isLoading} // Show typing indicator while waiting for AI
        placeholder="Type your message..."
        alwaysShowSend
      />
      {/* KeyboardAvoidingView might be needed depending on specific layout issues */}
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // Example background color
  },
});
