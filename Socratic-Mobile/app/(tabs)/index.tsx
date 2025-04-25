// app/(tabs)/index.tsx - Using Gifted Chat & Header
import React, { useState, useCallback, useEffect } from 'react';
// --- Ensure Text is imported from react-native ---
import { StyleSheet, View, Platform, Alert, Text } from 'react-native';
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
import { postDialogue } from '@/src/services/api';
import { Colors } from '@/src/constants/Colors'; // Import Colors
import { useColorScheme } from '@/src/hooks/useColorScheme'; // Import useColorScheme

// --- Import Custom Header ---
import ChatHeader from '@/src/components/ChatHeader'; // Adjust path if needed
import { SafeAreaView } from 'react-native-safe-area-context'; // Use SafeAreaView from this library for better edge handling

// Define user objects for Gifted Chat
const USER: User = { _id: 1, name: 'User' };
const ASSISTANT: User = { _id: 2, name: 'Socratic Partner' };

export default function ChatScreen() {
  const { user } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme]; // Get theme colors object
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
              // Apply theme colors, but keep default layout structure
              backgroundColor: themeColors.background,
              borderTopColor: themeColors.tabIconDefault,
              borderTopWidth: StyleSheet.hairlineWidth,
          }}
      />
  );
  // --- End Custom Input Toolbar Renderer ---

  // --- Custom Composer (Text Input) Renderer (Theme Colors Only) ---
  const renderCustomComposer = (props: ComposerProps) => (
      <Composer
          {...props}
          // Only override color-related text input styles
          textInputStyle={{
              color: themeColors.text,
              // Add other non-layout styles if needed, e.g., fontSize
          }}
          placeholderTextColor={themeColors.tabIconDefault}
      />
  );
  // --- End Custom Composer Renderer ---

   // --- Custom Send Button Renderer (Theme Colors Only) ---
   const renderCustomSend = (props: SendProps<IMessage>) => (
       <Send
           {...props}
           // Keep default container style for layout
           // containerStyle={{}}
       >
           {/* Only change the text color */}
           <View>
                <Text style={{ color: themeColors.tint, marginRight: 10, marginBottom: 10, fontWeight: '600' }}>Send</Text>
           </View>
       </Send>
   );
   // --- End Custom Send Button Renderer ---


  return (
    // Ensure SafeAreaView takes full screen height
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        <ChatHeader onClearChat={handleClearChat} />

        {/* Let GiftedChat handle its own layout within SafeAreaView */}
        <GiftedChat
            messages={messages}
            onSend={newMessages => onSend(newMessages)}
            user={USER}
            isTyping={isLoading}
            // placeholder handled by renderComposer now
            alwaysShowSend
            // --- UI Customization Props ---
            renderTime={() => null}
            renderDay={() => null}
            renderAvatar={() => null}
            showAvatarForEveryMessage={false}
            renderBubble={renderCustomBubble}
            renderInputToolbar={renderCustomInputToolbar} // <-- Use custom toolbar
            renderComposer={renderCustomComposer} // <-- Use custom composer
            renderSend={renderCustomSend} // <-- Use custom send button
            // --- End UI Customization ---
        />
    </SafeAreaView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1, // Ensure SafeAreaView takes full height
  },
});
