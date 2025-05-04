// app/(tabs)/index.tsx - Using Gifted Chat & Header
import React, { useState, useCallback, useEffect } from 'react';
// --- Import ActivityIndicator ---
import { StyleSheet, View, Platform, Alert, Text, ActivityIndicator } from 'react-native';
// --- End Import ---
// --- Import Gifted Chat components AND specific render props ---
import {
  GiftedChat,
  IMessage,
  User,
  Bubble,
  BubbleProps,
  InputToolbar,
  InputToolbarProps,
  Composer,
  ComposerProps,
  Send,
  SendProps
} from 'react-native-gifted-chat';
// --- End Import ---
import { useAuth } from '@/src/context/AuthContext';
import apiClientInstance from '@/src/services/api'; // Import the instance
import { Colors } from '@/src/constants/Colors';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import ChatHeader from '@/src/components/ChatHeader';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ApiHistoryMessage } from '@socratic/common-types'; // Adjust path if needed

// Define user objects for Gifted Chat
const USER: User = { _id: 1, name: 'User' };
const ASSISTANT: User = { _id: 2, name: 'Socratic Partner' };

export default function ChatScreen() {
  const { user, isGuest } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false); // This controls the typing indicator

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
  const mapToApiHistory = (msgs: IMessage[]): ApiHistoryMessage[] => {
      return msgs
          .map(msg => {
              // --- Re-add explicit type assertion for role ---
              const role = (msg.user._id === USER._id ? 'user' : 'assistant') as 'user' | 'assistant';
              // --- End Change ---
              return {
                  role: role,
                  content: msg.text
              };
          })
          .reverse(); // Reverse for chronological order for API
  };

  // Function called when the user presses the send button
  const onSend = useCallback(async (newMessages: IMessage[] = []) => {
    if (!user && !isGuest) {
        Alert.alert("Login Required", "Please log in or continue as guest to use the chat.");
        return;
    }
     if (isLoading) return;

    let updatedMessages: IMessage[] = [];
    setMessages((previousMessages) => {
        updatedMessages = GiftedChat.append(previousMessages, newMessages);
        return updatedMessages;
    });

    setIsLoading(true); // This will trigger the typing indicator via the isTyping prop
    const apiHistory = mapToApiHistory(updatedMessages);

    try {
      console.log('[API Call] Sending history (chronological):', apiHistory);
      const responseText = await apiClientInstance.postDialogue(apiHistory); // Use correct type now

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
      setIsLoading(false); // This will hide the typing indicator
    }
  }, [user, isLoading, isGuest]);

  // Function to clear chat messages
  const handleClearChat = useCallback(() => {
      setMessages([initialMessage]);
  }, [initialMessage]);

  // --- Custom Bubble Renderer ---
  const renderCustomBubble = (props: BubbleProps<IMessage>) => {
      // ... (bubble rendering logic remains the same) ...
      const userBubbleColor = themeColors.tint;
      const assistantBubbleColor = colorScheme === 'light' ? '#E5E5EA' : '#2C2C2E';
      const userTextColor = colorScheme === 'dark' ? '#000000' : '#FFFFFF';
      const assistantTextColor = themeColors.text;

      return (
          <View style={{ marginBottom: 10 }}>
              <Bubble
                  {...props}
                  wrapperStyle={{
                      left: { backgroundColor: assistantBubbleColor },
                      right: { backgroundColor: userBubbleColor },
                  }}
                  textStyle={{
                      left: { color: assistantTextColor },
                      right: { color: userTextColor },
                  }}
              />
          </View>
      );
  };
  // --- End Custom Bubble Renderer ---

  // --- Custom Input Toolbar Renderer ---
  const renderCustomInputToolbar = (props: InputToolbarProps<IMessage>) => (
      <InputToolbar
          {...props}
          containerStyle={{
              backgroundColor: themeColors.background,
              borderTopColor: themeColors.tabIconDefault,
              borderTopWidth: StyleSheet.hairlineWidth,
          }}
          primaryStyle={{ alignItems: 'center' }}
      />
  );
  // --- End Custom Input Toolbar Renderer ---

  // --- Custom Composer Renderer ---
  const renderCustomComposer = (props: ComposerProps) => (
      <Composer
          {...props}
          textInputStyle={{
              color: themeColors.text,
          }}
          placeholderTextColor={themeColors.tabIconDefault}
      />
  );
  // --- End Custom Composer Renderer ---

   // --- Custom Send Button Renderer ---
   const renderCustomSend = (props: SendProps<IMessage>) => (
       <Send
           {...props}
       >
           <View style={styles.sendButtonContainer}>
                <Text style={{ color: themeColors.tint, fontWeight: '600' }}>Send</Text>
           </View>
       </Send>
   );
   // --- End Custom Send Button Renderer ---

   // --- Removed Custom Typing Indicator Renderer ---
   // const renderCustomTypingIndicator = () => { ... };
   // --- End Removed Custom Typing Indicator Renderer ---


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        <ChatHeader onClearChat={handleClearChat} />

        <GiftedChat
            messages={messages}
            onSend={newMessages => onSend(newMessages)}
            user={USER}
            isTyping={isLoading} // Controls visibility of the default typing indicator
            alwaysShowSend
            renderTime={() => null}
            renderDay={() => null}
            renderAvatar={() => null}
            showAvatarForEveryMessage={false}
            renderBubble={renderCustomBubble}
            renderInputToolbar={renderCustomInputToolbar}
            renderComposer={renderCustomComposer}
            renderSend={renderCustomSend}
            // --- Removed renderTyping prop ---
            // renderTyping={renderCustomTypingIndicator}
            // --- End Removed prop ---
        />
    </SafeAreaView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sendButtonContainer: {
    marginRight: 10,
    marginBottom: 10,
  },
  // --- Removed Style for Typing Indicator Container ---
  // typingContainer: { ... }
  // --- End Removed Style ---
});
