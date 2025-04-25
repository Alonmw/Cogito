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
    // No avatar needed for clean UI
};

const ASSISTANT: User = {
    _id: 2, // Needs a unique ID for the assistant
    name: 'Socratic Partner',
    // No avatar needed for clean UI
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
          .map(msg => ({
              role: msg.user._id === USER._id ? 'user' : 'assistant',
              content: msg.text
          }))
          // Reverse the mapped array to get chronological order for API
          .reverse(); // Assuming GiftedChat state has newest first
  };

  // Function called when the user presses the send button in Gifted Chat
  const onSend = useCallback(async (newMessages: IMessage[] = []) => {
    if (!user || isLoading) {
        if (!user) Alert.alert("Error", "You must be logged in to chat.");
        return;
    }

    // Append the new user message(s) sent from Gifted Chat UI
    let updatedMessages: IMessage[] = [];
    setMessages((previousMessages) => {
        updatedMessages = GiftedChat.append(previousMessages, newMessages);
        return updatedMessages;
    });

    setIsLoading(true);

    // Prepare history for API call using the latest state
    const apiHistory = mapToApiHistory(updatedMessages); // Use the updated state

    try {
      console.log('[API Call] Sending history (chronological):', apiHistory);
      const responseText = await postDialogue(apiHistory as any); // Cast if needed

      if (responseText) {
        const aiResponse: IMessage = {
          _id: `assistant-${Date.now()}`,
          text: responseText,
          createdAt: new Date(),
          user: ASSISTANT,
        };
        setMessages((previousMessages) =>
          GiftedChat.append(previousMessages, [aiResponse]),
        );
      } else {
        Alert.alert("Error", "Failed to get response from assistant.");
      }
    } catch (error) {
      console.error("Error in onSend calling postDialogue:", error);
      Alert.alert("Error", "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [user, isLoading]);

  return (
    <View style={styles.container}>
      <GiftedChat
        messages={messages}
        onSend={newMessages => onSend(newMessages)}
        user={USER}
        isTyping={isLoading}
        placeholder="Type your message..."
        alwaysShowSend
        // --- UI Customization Props ---
        renderTime={() => null} // Hide the timestamp below messages
        renderDay={() => null} // Hide the date separator (e.g., "Today")
        showUserAvatar={false} // Hide the user's avatar circle (redundant with renderAvatar)
        renderAvatar={() => null} // Hide ALL avatars
        showAvatarForEveryMessage={false}
        // --- End UI Customization ---
      />
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
