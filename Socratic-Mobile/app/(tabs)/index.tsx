// app/(tabs)/index.tsx - Renaming conceptually to ChatScreen
import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native'; // Added Alert
import { useAuth } from '@/src/context/AuthContext';
import { Colors } from '@/src/constants/Colors'; // Adjust path if needed
import { useColorScheme } from '@/src/hooks/useColorScheme'; // Adjust path if needed

// --- Import Chat Components ---
import MessageList from '@/src/components/MessageList'; // Adjust path if needed
import ChatInput from '@/src/components/ChatInput';   // Adjust path if needed

// --- Import API Service ---
import { postDialogue } from '@/src/services/api'; // Adjust path if needed

// Define the structure for a message (can be shared in types/index.ts later)
interface Message {
  id: string; // Unique ID for each message
  text: string;
  sender: 'user' | 'assistant'; // Or 'bot', 'ai'
  timestamp: Date;
}

export default function ChatScreen() {
  const colorScheme = useColorScheme();
  const { user } = useAuth(); // Get user info if needed

  const [messages, setMessages] = useState<Message[]>([]); // State to hold messages
  const [inputText, setInputText] = useState(''); // State for the text input
  const [isLoading, setIsLoading] = useState(false); // State for loading AI response

  // Function to handle sending a message
  const handleSend = useCallback(async () => {
    if (inputText.trim().length === 0 || isLoading || !user) {
      // Also check if user exists before sending
      if (!user) Alert.alert("Error", "You must be logged in to chat.");
      return;
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    // Combine current history with the new user message for the API call
    const currentHistory = [...messages, userMessage];

    // Optimistically update the UI
    setMessages(currentHistory);
    setInputText('');
    setIsLoading(true);

    // --- Call Real API Service ---
    try {
      const responseText = await postDialogue(currentHistory); // Pass the updated history

      if (responseText) {
        const aiResponse: Message = {
          id: `assistant-${Date.now()}`,
          text: responseText,
          sender: 'assistant',
          timestamp: new Date(),
        };
        // Add the AI response to the message list
        setMessages((prevMessages) => [...prevMessages, aiResponse]);
      } else {
        // Handle case where API returned null (error occurred)
        Alert.alert("Error", "Failed to get response from assistant.");
        // Optional: Remove the user's optimistic message if the API call failed
        // setMessages((prevMessages) => prevMessages.slice(0, -1));
      }
    } catch (error) {
      // Catch any unexpected errors from the API call itself
      console.error("Error in handleSend calling postDialogue:", error);
      Alert.alert("Error", "An unexpected error occurred.");
      // Optional: Remove the user's optimistic message
      // setMessages((prevMessages) => prevMessages.slice(0, -1));
    } finally {
      // Ensure loading indicator is turned off regardless of success/failure
      setIsLoading(false);
    }
    // --- End API Call ---

  }, [inputText, messages, isLoading, user]); // Added user dependency


  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <MessageList messages={messages} />

      {isLoading && (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={Colors[colorScheme ?? 'light'].text}/>
            <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].text }]}>
                Assistant is thinking...
            </Text>
        </View>
      )}

      <ChatInput
        inputText={inputText}
        setInputText={setInputText}
        onSend={handleSend}
        isLoading={isLoading}
      />
    </KeyboardAvoidingView>
  );
}

// Styles remain the same
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 5,
  },
  loadingText: {
    marginLeft: 5,
    fontStyle: 'italic',
  },
});
