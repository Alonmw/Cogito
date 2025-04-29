// app/(tabs)/index.tsx - Using Gifted Chat & Shared API Client
import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, Platform, Alert, Text } from 'react-native';
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
import { useAuth } from '@/src/context/AuthContext';
// --- Import the configured apiClient instance ---
import apiClientInstance from '@/src/services/api'; // Adjust path if needed
// --- End Import ---
import { Colors } from '@/src/constants/Colors';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import ChatHeader from '@/src/components/ChatHeader';
import { SafeAreaView } from 'react-native-safe-area-context';
// --- Import shared type if needed for clarity ---
import { ApiHistoryMessage } from '@socratic/common-types'; // Adjust path if needed

// Define user objects for Gifted Chat
const USER: User = { _id: 1, name: 'User' };
const ASSISTANT: User = { _id: 2, name: 'Socratic Partner' };

export default function ChatScreen() {
  const { user } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
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
  const mapToApiHistory = (msgs: IMessage[]): ApiHistoryMessage[] => { // Use imported type
      return msgs
          .map(msg => ({
              role: msg.user._id === USER._id ? 'user' : 'assistant',
              content: msg.text
          }))
          .reverse(); // Reverse for chronological order for API
  };

  // Function called when the user presses the send button
  const onSend = useCallback(async (newMessages: IMessage[] = []) => {
    // Use guest check from context if needed, or rely on backend optional auth
    // if (!user && !isGuest) { // Example check if guest mode needs restriction
    if (!user && !useAuth().isGuest) { // Check if not logged in and not guest
        Alert.alert("Login Required", "Please log in or continue as guest to use the chat.");
        return;
    }
     if (isLoading) return; // Prevent sending while loading

    let updatedMessages: IMessage[] = [];
    setMessages((previousMessages) => {
        updatedMessages = GiftedChat.append(previousMessages, newMessages);
        return updatedMessages;
    });

    setIsLoading(true);
    const apiHistory = mapToApiHistory(updatedMessages);

    try {
      console.log('[API Call] Sending history (chronological):', apiHistory);
      // --- Use the imported apiClientInstance ---
      const responseText = await apiClientInstance.postDialogue(apiHistory);
      // --- End Change ---

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
    // Removed messages from dependency array as functional update is used
  }, [user, isLoading, useAuth().isGuest]); // Added isGuest dependency

  // Function to clear chat messages
  const handleClearChat = useCallback(() => {
      setMessages([initialMessage]);
  }, [initialMessage]);

  // --- Custom Bubble Renderer ---
  const renderCustomBubble = (props: BubbleProps<IMessage>) => {
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

  // --- Custom Input Toolbar Renderer (Theme Colors Only) ---
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

  // --- Custom Composer (Text Input) Renderer (Theme Colors Only) ---
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

   // --- Custom Send Button Renderer (Theme Colors Only) ---
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


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        <ChatHeader onClearChat={handleClearChat} />

        <GiftedChat
            messages={messages}
            onSend={newMessages => onSend(newMessages)}
            user={USER}
            isTyping={isLoading}
            alwaysShowSend
            renderTime={() => null}
            renderDay={() => null}
            renderAvatar={() => null}
            showAvatarForEveryMessage={false}
            renderBubble={renderCustomBubble}
            renderInputToolbar={renderCustomInputToolbar}
            renderComposer={renderCustomComposer}
            renderSend={renderCustomSend}
        />
    </SafeAreaView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sendButtonContainer: { // Added style for Send button text container
    marginRight: 10,
    marginBottom: 10,
  }
});