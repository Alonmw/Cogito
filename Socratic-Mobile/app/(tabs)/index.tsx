// app/(tabs)/index.tsx - Using Gifted Chat & Header
import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, Platform, Alert, Text, ActivityIndicator, KeyboardAvoidingView } from 'react-native';
import {
  GiftedChat,
  IMessage,
  User,
  Bubble, // Keep Bubble import
  BubbleProps,
  InputToolbar, // Keep these commented out until text error is resolved
  InputToolbarProps,
  Composer,
  ComposerProps,
  Send,
  SendProps
} from 'react-native-gifted-chat';
import { useAuth } from '@/src/context/AuthContext';
import apiClientInstance from '@/src/services/api';
import { Colors } from '@/src/constants/Colors';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import ChatHeader from '@/src/components/ChatHeader';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ApiHistoryMessage, DialogueResponse } from '@socratic/common-types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {Ionicons} from "@expo/vector-icons";

// Define user objects for Gifted Chat
const USER: User = { _id: 1, name: 'User' };
const ASSISTANT: User = { _id: 2, name: 'Socratic Partner' };

export default function ChatScreen() {
  const { user, isGuest } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const router = useRouter();

  const params = useLocalSearchParams<{ conversationId?: string; conversationTitle?: string }>();
  const conversationIdParam = params.conversationId ? parseInt(params.conversationId, 10) : undefined;
  const [activeConversationId, setActiveConversationId] = useState<number | undefined>(conversationIdParam);

  const initialGreetingMessage: IMessage = {
    _id: `assistant-greeting-${Date.now()}`,
    text: 'Hello! How can I help you explore your thoughts today?', // This is a string
    createdAt: new Date(),
    user: ASSISTANT,
  };

  const mapApiMessageToIMessage = (apiMsg: ApiHistoryMessage, convId: number | string | undefined, index: number): IMessage => ({
    _id: `hist-${convId || 'new'}-${apiMsg.role}-${index}-${new Date(apiMsg.timestamp || Date.now()).getTime()}`,
    text: String(apiMsg.content || ''), // Ensure text is always a string
    createdAt: apiMsg.timestamp ? new Date(apiMsg.timestamp) : new Date(),
    user: apiMsg.role === 'user' ? USER : ASSISTANT,
  });

  useEffect(() => {
    setActiveConversationId(conversationIdParam);
    const loadConversation = async () => {
      if (conversationIdParam && !isNaN(conversationIdParam)) {
        setIsLoadingHistory(true);
        setMessages([]);
        try {
          const fetchedMessages = await apiClientInstance.getConversationMessages(conversationIdParam);
          if (fetchedMessages && fetchedMessages.length > 0) {
            const giftedChatMessages = fetchedMessages.map((msg, index) => mapApiMessageToIMessage(msg, conversationIdParam, index)).reverse();
            setMessages(giftedChatMessages);
          } else {
            setMessages([initialGreetingMessage]);
            if (!fetchedMessages) Alert.alert("Error", "Could not load conversation history for this session.");
          }
        } catch (error) {
          Alert.alert("Error", "Failed to load conversation history.");
          setMessages([initialGreetingMessage]);
        } finally {
          setIsLoadingHistory(false);
        }
      } else {
        setMessages([initialGreetingMessage]);
        setActiveConversationId(undefined);
      }
    };
    loadConversation();
  }, [conversationIdParam]);

  const mapToApiHistory = (msgs: IMessage[]): ApiHistoryMessage[] => {
      return msgs
          .map(msg => ({
              role: (msg.user._id === USER._id ? 'user' : 'assistant') as 'user' | 'assistant',
              content: String(msg.text || ''), // Ensure content is string
          }))
          .reverse();
  };

  const onSend = useCallback(async (newMessages: IMessage[] = []) => {
    if (!user && !isGuest) {
        Alert.alert("Login Required", "Please log in or continue as guest to use the chat.");
        return;
    }
     if (isLoading) return;

    let currentUIMessages: IMessage[] = [];
    setMessages((previousMessages) => {
        const processedNewMessages = newMessages.map(m => ({...m, text: String(m.text || '')})); // Ensure text is string
        currentUIMessages = GiftedChat.append(previousMessages, processedNewMessages);
        return currentUIMessages;
    });

    setIsLoading(true);
    const apiHistory = mapToApiHistory(currentUIMessages);

    try {
      const dialogueApiResponse = await apiClientInstance.postDialogue(apiHistory, activeConversationId);
      if (dialogueApiResponse && dialogueApiResponse.response) {
        const responseText = dialogueApiResponse.response;
        const returnedConversationId = dialogueApiResponse.conversation_id;
        if (returnedConversationId && (!activeConversationId || activeConversationId !== returnedConversationId) ) {
            setActiveConversationId(returnedConversationId);
        }
        const aiResponse: IMessage = {
          _id: `assistant-${Date.now()}`,
          text: String(responseText || ''), // Ensure text is string
          createdAt: new Date(),
          user: ASSISTANT,
        };
        setMessages((previousMessages) => GiftedChat.append(previousMessages, [aiResponse]));
      } else {
        Alert.alert("Error", "Failed to get response from assistant.");
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [user, isLoading, isGuest, activeConversationId, messages]);

  const handleClearChat = useCallback(() => {
      setMessages([initialGreetingMessage]);
      setActiveConversationId(undefined);
      router.setParams({ conversationId: undefined, conversationTitle: undefined });
  }, [initialGreetingMessage, router]);

  // --- Minimal Bubble Renderer ---
  // This passes all props through to GiftedChat's default Bubble,
  // only adding our desired margin.
  const renderCustomBubble = (props: BubbleProps<IMessage>) => {
    return (
      <View style={{ marginBottom: 10 }}>
        <Bubble
          {...props}
          // Re-apply themed wrapper and text styles if needed, but keep it minimal for now
          wrapperStyle={{
            left: { backgroundColor: colorScheme === 'light' ? '#E5E5EA' : '#2C2C2E' },
            right: { backgroundColor: themeColors.tint },
          }}
          textStyle={{
            left: { color: themeColors.text },
            right: { color: colorScheme === 'dark' ? '#000000' : '#FFFFFF' },
          }}
        />
      </View>
    );
  };


  const renderCustomInputToolbar = (props: InputToolbarProps<IMessage>) => (
  <InputToolbar
    {...props}
    containerStyle={{
      backgroundColor: themeColors.background,
      borderTopColor: themeColors.tint,
      borderTopWidth: 1,
      padding: 5,
    }}
    primaryStyle={{ alignItems: 'center' }}
  />
);

  const renderCustomComposer = (props: ComposerProps) => (
  <Composer
    {...props}
    textInputStyle={{
      color: themeColors.text,
      backgroundColor: colorScheme === 'dark' ? '#1E1E1E' : '#F0F0F0',
      paddingHorizontal: 12,
      borderRadius: 20,
    }}
  />
);

const renderCustomSend = (props: SendProps<IMessage>) => (
  <Send {...props}>
    <View style={{ marginRight: 10, marginBottom: 5 }}>
      <Ionicons name="send" size={24} color={themeColors.tint} />
    </View>
  </Send>
);


  // --- End Minimal Bubble Renderer ---
if (isLoadingHistory) {
  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: themeColors.background,
          justifyContent: 'center',
          alignItems: 'center',
        },
      ]}
    >
      <ActivityIndicator size="large" color={themeColors.tint} />
      <Text style={{ color: themeColors.text, marginTop: 10 }}>
        Loading conversation...
      </Text>
    </SafeAreaView>
  );
}

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
            renderBubble={renderCustomBubble} // Using the simplified bubble
            // Custom input renderers remain commented out
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
  chatContainer: {
    flex: 1,
  },
});
