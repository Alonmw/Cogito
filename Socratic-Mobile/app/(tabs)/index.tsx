// app/(tabs)/index.tsx - Using Gifted Chat & Header
import React, { useState, useCallback, useEffect, useRef } from 'react';
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
import { ApiHistoryMessage, DialogueResponse, PersonaId, DialoguePayload } from '@socratic/common-types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {Ionicons} from "@expo/vector-icons";
import { personas, getDefaultPersona, PersonaUI } from '@/src/personas';
import { ThemedView } from '@/src/components/ThemedView';
import { ThemedText } from '@/src/components/ThemedText';
import { spacing, shadows } from '@/src/constants/spacingAndShadows';
import SwipeableScreen from '@/src/components/SwipeableScreen';

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

  const params = useLocalSearchParams<{ conversationId?: string; conversationTitle?: string; personaId?: string; initialUserMessage?: string }>();
  const conversationIdParam = params.conversationId ? parseInt(params.conversationId, 10) : undefined;
  const [activeConversationId, setActiveConversationId] = useState<number | undefined>(conversationIdParam);
  const [currentPersona, setCurrentPersona] = useState<PersonaUI>(getDefaultPersona());
  const [initialUserMessage, setInitialUserMessage] = useState<string | undefined>(undefined);

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

  useEffect(() => {
    const newPersonaId = params.personaId;
    const newInitialUserMessage = params.initialUserMessage;

    // Set current persona based on params or default
    if (newPersonaId) {
      const foundPersona = personas.find(p => p.id === newPersonaId) || getDefaultPersona();
      setCurrentPersona(foundPersona);
    } else {
      // If no personaId is passed, and it's a new chat, use default.
      // If it's a loaded chat, personaId should have come with conversation data.
      if (!params.conversationId) {
        setCurrentPersona(getDefaultPersona());
      }
    }

    // If it's a new chat WITHOUT an initialUserMessage (e.g., user just navigated to a new chat tab)
    // then set the initial greeting.
    // The case WITH an initialUserMessage is handled by the other useEffect.
    if (!params.conversationId && !newInitialUserMessage) {
      const personaToGreetWith = newPersonaId ? (personas.find(p => p.id === newPersonaId) || getDefaultPersona()) : getDefaultPersona();
      setMessages([{
        _id: `assistant-greeting-${Date.now()}`,
        text: personaToGreetWith.initialGreeting,
        createdAt: new Date(),
        user: { _id: 2, name: personaToGreetWith.name, avatar: personaToGreetWith.image },
      }]);
    }

    // If there's an initialUserMessage, set it to the state variable.
    // The other useEffect will pick it up.
    if (newInitialUserMessage && !params.conversationId) {
      setInitialUserMessage(newInitialUserMessage);
    } else {
      setInitialUserMessage(undefined); // Clear if loading history or no suggestion
    }

    setActiveConversationId(params.conversationId ? parseInt(params.conversationId, 10) : undefined);

    // Reset the suggestion sent flag if conversation or persona changes
    if (params.conversationId) {
      initialSuggestionSentRef.current = true; // Prevent auto-send for loaded history
    }
  }, [params.personaId, params.conversationId, params.initialUserMessage]);

  const onSend = useCallback(async (newMessages: IMessage[] = []) => {
    if (!user && !isGuest) {
      Alert.alert("Login Required", "Please log in or continue as guest to use the chat.");
      return;
    }
    if (isLoading) return;

    setIsLoading(true);

    let historyToSend: IMessage[] = [];
    if (newMessages.length > 0) {
      // Called from GiftedChat: append new messages to current state
      const updatedMessages = GiftedChat.append(messages, newMessages);
      setMessages(updatedMessages);
      historyToSend = updatedMessages;
      console.log('[DEBUG] onSend called with newMessages. updatedMessages:', updatedMessages);
    } else {
      // Called for initial suggestion: use current messages state
      historyToSend = messages;
      console.log('[DEBUG] onSend called with no newMessages. using messages:', messages);
    }

    const apiHistory = mapToApiHistory(historyToSend);
    console.log('[DEBUG] Actually sending apiHistory to backend:', apiHistory);
    const payload: DialoguePayload = { history: apiHistory };
    if (activeConversationId !== undefined) payload.conversation_id = activeConversationId;
    if (currentPersona.id !== undefined) payload.persona_id = currentPersona.id as PersonaId;
    console.log('[DEBUG] POST /api/dialogue payload:', JSON.stringify(payload));

    try {
      const dialogueApiResponse = await apiClientInstance.postDialogue(apiHistory, activeConversationId, currentPersona.id as PersonaId);
      if (dialogueApiResponse && dialogueApiResponse.response) {
        const responseText = dialogueApiResponse.response;
        const returnedConversationId = dialogueApiResponse.conversation_id;
        if (returnedConversationId && (!activeConversationId || activeConversationId !== returnedConversationId) ) {
          setActiveConversationId(returnedConversationId);
        }
        const aiResponse: IMessage = {
          _id: `assistant-${Date.now()}`,
          text: String(responseText || ''),
          createdAt: new Date(),
          user: ASSISTANT_CHAT_USER,
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
  }, [user, isLoading, isGuest, activeConversationId, messages, currentPersona]);

  const initialSuggestionSentRef = useRef(false);

  useEffect(() => {
    // This effect handles the scenario where the chat is initiated from a persona suggestion.
    // It ensures the persona's greeting appears first, followed by the user's suggested message.
    if (initialUserMessage && !params.conversationId) { // Check for initial message AND no existing conversation ID
      console.log('[DEBUG] initialUserMessage effect for NEW CHAT. initialUserMessage:', initialUserMessage);

      // Determine the persona (either from params or default)
      const selectedPersonaId = params.personaId || getDefaultPersona().id;
      const personaToUse = personas.find(p => p.id === selectedPersonaId) || getDefaultPersona();

      // Create the persona's greeting message
      const greetingMessage: IMessage = {
        _id: `assistant-greeting-${Date.now()}`,
        text: personaToUse.initialGreeting,
        createdAt: new Date(),
        user: { _id: 2, name: personaToUse.name, avatar: personaToUse.image }, // ASSISTANT user with persona details
      };

      // Create the user's initial suggested message
      const userSuggestedMessage: IMessage = {
        _id: `user-initial-${Date.now()}`,
        text: initialUserMessage,
        createdAt: new Date(),
        user: USER, // Your defined USER object
      };

      // Set the messages state with user's suggestion first (newest), then the greeting
      // For Gifted Chat with inverted=true, oldest messages go at the higher indices
      setMessages([userSuggestedMessage, greetingMessage]);

      console.log('[DEBUG] Messages set with greeting and initial user message:', [userSuggestedMessage, greetingMessage]);

      // Clear initialUserMessage as it has been processed
      setInitialUserMessage(undefined); 

      // Reset the ref to allow the next effect to send these messages
      initialSuggestionSentRef.current = false;   
    }
  }, [initialUserMessage, params.conversationId, params.personaId, currentPersona]);

  // This effect automatically sends the initial conversation (greeting + user's first message)
  // to the backend once they are both set in the messages state for a new suggested chat.
  useEffect(() => {
    if (
      !params.conversationId && // IMPORTANT: Only for new chats, not loaded history
      messages.length === 2 &&
      messages[0].user._id === USER._id && // Newest message (user's suggestion)
      messages[1].user._id === 2 && // Older message (assistant's greeting)
      !initialSuggestionSentRef.current // Ensure it only runs once per suggestion
    ) {
      console.log('[DEBUG] Detected NEW chat with greeting + user suggestion. Calling onSend([]) to send history.');
      initialSuggestionSentRef.current = true; // Mark as sent
      onSend([]); // onSend will use the current `messages` state
    }
  }, [messages, onSend, params.conversationId]);

  // Reset the ref when persona or conversation changes
  useEffect(() => {
    initialSuggestionSentRef.current = false;
  }, [currentPersona, activeConversationId]);

  const mapToApiHistory = (msgs: IMessage[]): ApiHistoryMessage[] => {
      return msgs
          .map(msg => ({
              role: (msg.user._id === USER._id ? 'user' : 'assistant') as 'user' | 'assistant',
              content: String(msg.text || ''), // Ensure content is string
          }))
          .reverse();
  };

  const ASSISTANT_CHAT_USER: User = {
    _id: 2,
    name: currentPersona.name,
    avatar: currentPersona.image,
  };

  const handleClearChat = useCallback(() => {
      setMessages([initialGreetingMessage]);
      setActiveConversationId(undefined);
      router.setParams({ conversationId: undefined, conversationTitle: undefined });
  }, [initialGreetingMessage, router]);

  const handleNewChatPress = useCallback(() => {
    setMessages([]);
    setActiveConversationId(undefined);
    setCurrentPersona(getDefaultPersona());
    router.setParams({ conversationId: undefined, conversationTitle: undefined, personaId: undefined, initialUserMessage: undefined });
    router.push('/persona-selection');
  }, [router]);

  // --- Minimal Bubble Renderer ---
  // This passes all props through to GiftedChat's default Bubble,
  // only adding our desired margin.
  const renderCustomBubble = (props: BubbleProps<IMessage>) => {
    const isUser = props.currentMessage?.user._id === USER._id;
    return (
      <ThemedView
        style={[
          {
            alignSelf: isUser ? 'flex-end' : 'flex-start',
            backgroundColor: isUser ? themeColors.tint : '#EFE3C7',
            borderRadius: 18,
            paddingVertical: spacing.s,
            paddingHorizontal: spacing.m,
            marginBottom: spacing.s,
            maxWidth: '80%',
            ...shadows.low,
          },
        ]}
        accessibilityLabel={isUser ? 'Your message' : 'Assistant message'}
      >
        <ThemedText
          style={{
            color: isUser ? '#fff' : themeColors.text,
            fontSize: 16,
            fontWeight: isUser ? '600' : '400',
          }}
        >
          {props.currentMessage?.text}
        </ThemedText>
      </ThemedView>
    );
  };

  const renderCustomInputToolbar = (props: InputToolbarProps<IMessage>) => (
    <InputToolbar
      {...props}
      containerStyle={{
        backgroundColor: '#F5E9D7', // Parchment-like input bar
        padding: spacing.s,
        flexDirection: 'row',
        alignItems: 'center',
        // No border, no shadow
      }}
    />
  );

  const renderCustomComposer = (props: ComposerProps) => (
    <Composer
      {...props}
      textInputStyle={{
        color: themeColors.text,
        fontSize: 16,
        backgroundColor: '#FAF3E0', // Subtle contrast with input bar
        borderRadius: 20,
        paddingHorizontal: spacing.m,
        minHeight: 40,
        flex: 1,
        textAlignVertical: 'center',
        borderWidth: 0,
        borderColor: 'transparent',
        shadowColor: 'transparent',
      }}
    />
  );

  const renderCustomSend = (props: SendProps<IMessage>) => (
    <Send {...props}>
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: themeColors.tint,
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: 8,
          marginRight: spacing.s,
          marginBottom: 5,
        }}
        accessibilityRole="button"
        accessibilityLabel="Send message"
      >
        <Ionicons name="send" size={24} color="#fff" />
      </View>
    </Send>
  );

  // --- End Minimal Bubble Renderer ---
  if (isLoadingHistory) {
    return (
      <ThemedView
        style={{
          flex: 1,
          backgroundColor: themeColors.background,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color={themeColors.tint} />
        <ThemedText style={{ color: themeColors.text, marginTop: spacing.m, fontSize: 16 }}>
          Loading conversation...
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <SwipeableScreen currentTab="index">
        <ChatHeader 
          onNewChatPress={handleNewChatPress} 
          personaName={currentPersona.name} 
          currentMessages={messages}
          conversationTitle={params.conversationTitle || `Chat with ${currentPersona.name}`}
        />
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
      </SwipeableScreen>
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
