// app/(tabs)/index.tsx - Using Gifted Chat & Header
import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, Platform, SafeAreaView } from 'react-native'; // Added SafeAreaView, Removed others
import { GiftedChat, IMessage, User } from 'react-native-gifted-chat';
import { useAuth } from '@/src/context/AuthContext';
import { postDialogue } from '@/src/services/api';
import { Alert } from 'react-native';
import { Colors } from '@/src/constants/Colors'; // Import Colors
import { useColorScheme } from '@/src/hooks/useColorScheme'; // Import useColorScheme

// --- Import Custom Header ---
import ChatHeader from '@/src/components/ChatHeader'; // Adjust path if needed

// Define user objects for Gifted Chat
const USER: User = {
    _id: 1,
    name: 'User',
};

const ASSISTANT: User = {
    _id: 2,
    name: 'Socratic Partner',
};

export default function ChatScreen() {
  const { user } = useAuth();
  const colorScheme = useColorScheme(); // Get current color scheme
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initial greeting message
  const initialMessage: IMessage = {
    _id: 1,
    text: 'Hello! How can I help you explore your thoughts today?',
    createdAt: new Date(),
    user: ASSISTANT,
  };

  useEffect(() => {
    setMessages([initialMessage]);
  }, []);


  // Helper function to get numeric timestamp
  const getTimestamp = (dateOrNumber: Date | number | undefined): number => {
      if (dateOrNumber instanceof Date) return dateOrNumber.getTime();
      if (typeof dateOrNumber === 'number') return dateOrNumber;
      return 0;
  };

  // Map Gifted Chat's IMessage back to our API format
  const mapToApiHistory = (msgs: IMessage[]) => {
      return msgs
          .map(msg => ({
              role: msg.user._id === USER._id ? 'user' : 'assistant',
              content: msg.text
          }))
          .reverse(); // Reverse for chronological order for API
  };

  // Function called when the user presses the send button
  const onSend = useCallback(async (newMessages: IMessage[] = []) => {
    if (!user || isLoading) {
        if (!user) Alert.alert("Error", "You must be logged in to chat.");
        return;
    }

    let updatedMessages: IMessage[] = [];
    setMessages((previousMessages) => {
        updatedMessages = GiftedChat.append(previousMessages, newMessages);
        return updatedMessages;
    });

    setIsLoading(true);
    const apiHistory = mapToApiHistory(updatedMessages);

    try {
      console.log('[API Call] Sending history (chronological):', apiHistory);
      const responseText = await postDialogue(apiHistory as any);

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

  // --- Function to clear chat messages ---
  const handleClearChat = useCallback(() => {
      // Reset messages, keeping only the initial greeting
      setMessages([initialMessage]);
  }, [initialMessage]); // Include initialMessage dependency

  return (
    // Use SafeAreaView to avoid notches/status bars
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        {/* Render the custom header */}
        <ChatHeader onClearChat={handleClearChat} />

        {/* GiftedChat takes the remaining space */}
        <GiftedChat
            messages={messages}
            onSend={newMessages => onSend(newMessages)}
            user={USER}
            isTyping={isLoading}
            placeholder="Type your message..."
            alwaysShowSend
            renderTime={() => null}
            renderDay={() => null}
            renderAvatar={() => null}
            showAvatarForEveryMessage={false}
            // GiftedChat includes its own KeyboardAvoidingView handling usually
        />
    </SafeAreaView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor is set dynamically now
  },
  // Removed loading styles as GiftedChat has isTyping prop
});
