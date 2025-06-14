// app/(tabs)/index.tsx - Using Gifted Chat & Header
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { StyleSheet, View, Platform, Alert, Text, ActivityIndicator, KeyboardAvoidingView, Animated } from 'react-native';
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
import { useAuth } from '@features/auth/AuthContext';
import apiClientInstance from '@shared/api/api';
import { analyticsService } from '@shared/api/analytics';
import { Colors } from '@shared/constants/Colors';
import ChatHeader from '@features/chat/components/ChatHeader';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ApiHistoryMessage, DialogueResponse, PersonaId, DialoguePayload } from '@socratic/common-types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {Ionicons} from "@expo/vector-icons";
import { personas, getDefaultPersona, PersonaUI } from '@shared/constants/personas';
import { ThemedView } from '@shared/components/ThemedView';
import { ThemedText } from '@shared/components/ThemedText';
import { spacing, shadows } from '@shared/constants/spacingAndShadows';
import { ActivityIndicator as RNActivityIndicator } from 'react-native';
import VoiceMessageInput from '@features/chat/components/VoiceMessageInput';

// Define user objects for Gifted Chat
const USER: User = { _id: 1, name: 'User' };
const ASSISTANT: User = { _id: 2, name: 'Cogito' };

export default function ChatScreen() {
  const { user, isGuest } = useAuth();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const router = useRouter();
  const [loadingDots, setLoadingDots] = useState('');
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const inputOpacity = useRef(new Animated.Value(1)).current;

  const params = useLocalSearchParams<{ conversationId?: string; conversationTitle?: string; personaId?: string; initialUserMessage?: string }>();
  const conversationIdParam = params.conversationId ? parseInt(params.conversationId, 10) : undefined;
  const [activeConversationId, setActiveConversationId] = useState<number | undefined>(conversationIdParam);
  const [currentPersona, setCurrentPersona] = useState<PersonaUI>(getDefaultPersona());
  const [initialUserMessage, setInitialUserMessage] = useState<string | undefined>(undefined);

  // Define ASSISTANT_CHAT_USER with current persona info
  const ASSISTANT_CHAT_USER: User = useMemo(() => ({
    _id: 2,
    name: currentPersona.name,
    avatar: currentPersona.image,
  }), [currentPersona]);

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

  const messagesRef = useRef<IMessage[]>([]);
  const activeConversationIdRef = useRef<number | undefined>(undefined);

  // Update refs when state changes
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  // Track conversation started with first message
  const trackConversationStarted = useCallback(async (
    firstMessage: string, 
    conversationType: 'new_chat' | 'persona_suggestion' | 'voice_initiated'
  ) => {
    const metadata = analyticsService.getMessageMetadata(firstMessage);
    
    await analyticsService.trackConversationStarted({
      persona_id: currentPersona.id,
      persona_name: currentPersona.name,
      first_message: firstMessage,
      first_message_length: metadata.length,
      first_message_word_count: metadata.word_count,
      conversation_type: conversationType,
      is_guest_user: isGuest,
      timestamp: Date.now(),
    });
  }, [currentPersona, isGuest]);

  const onSend = useCallback(async (newMessages: IMessage[] = []) => {
    if (!user && !isGuest) {
      Alert.alert("Login Required", "Please log in or continue as guest to use the chat.");
      return;
    }
    if (isLoading) return;

    setIsLoading(true);
    setInputText(''); // Clear input text when sending

    let historyToSend: IMessage[] = [];
    let isFirstMessage = false;
    
    if (newMessages.length > 0) {
      // Called from GiftedChat: append new messages to current state
      const updatedMessages = GiftedChat.append(messagesRef.current, newMessages);
      setMessages(updatedMessages);
      historyToSend = updatedMessages;
      console.log('[DEBUG] onSend called with newMessages. updatedMessages:', updatedMessages);
      
      // Check if this is the first user message in a new conversation
      const userMessages = updatedMessages.filter(msg => msg.user._id === USER._id);
      isFirstMessage = userMessages.length === 1 && !activeConversationIdRef.current;
      
      // Track individual message
      const sentMessage = newMessages[0];
      const metadata = analyticsService.getMessageMetadata(sentMessage.text || '');
      
      await analyticsService.trackMessageSent({
        message_type: 'text',
        message_length: metadata.length,
        word_count: metadata.word_count,
        persona_id: currentPersona.id,
        conversation_position: userMessages.length,
        is_guest_user: isGuest,
        has_active_conversation_id: !!activeConversationIdRef.current,
      });

      // Track conversation started if this is the first message
      if (isFirstMessage) {
        await trackConversationStarted(sentMessage.text || '', 'new_chat');
      }
    } else {
      // Called for initial suggestion: use current messages state
      historyToSend = messagesRef.current;
      console.log('[DEBUG] onSend called with no newMessages. using messages:', messagesRef.current);
      
      // Handle initial suggestion auto-send
      const userMessages = historyToSend.filter(msg => msg.user._id === USER._id);
      if (userMessages.length > 0) {
        const firstUserMessage = userMessages[userMessages.length - 1]; // Last in array = first chronologically
        await trackConversationStarted(firstUserMessage.text || '', 'persona_suggestion');
      }
    }

    const currentConversationId = activeConversationIdRef.current;
    const apiHistory = mapToApiHistory(historyToSend);
    console.log('[DEBUG] Actually sending apiHistory to backend:', apiHistory);
    console.log('[DEBUG] historyToSend length:', historyToSend.length);
    console.log('[DEBUG] activeConversationId at send time:', currentConversationId);
    const payload: DialoguePayload = { history: apiHistory };
    if (currentConversationId !== undefined) payload.conversation_id = currentConversationId;
    if (currentPersona.id !== undefined) payload.persona_id = currentPersona.id as PersonaId;
    console.log('[DEBUG] POST /api/dialogue payload:', JSON.stringify(payload));

    try {
      const dialogueApiResponse = await apiClientInstance.postDialogue(apiHistory, currentConversationId, currentPersona.id as PersonaId);
      if (dialogueApiResponse && dialogueApiResponse.response) {
        const responseText = dialogueApiResponse.response;
        const returnedConversationId = dialogueApiResponse.conversation_id;
        if (returnedConversationId && (!currentConversationId || currentConversationId !== returnedConversationId) ) {
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
  }, [user, isLoading, isGuest, currentPersona, trackConversationStarted]);

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
            backgroundColor: isUser ? Colors.tint : Colors.card,
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
            color: isUser ? '#fff' : Colors.text,
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
        backgroundColor: Colors.background, // Parchment-like input bar
        paddingHorizontal: spacing.m, // Use horizontal padding for symmetrical margins
        paddingVertical: spacing.s,
        flexDirection: 'row',
        alignItems: 'center',
        // No border, no shadow
      }}
    />
  );

  const renderCustomComposer = (props: ComposerProps) => (
    <Animated.View style={{ opacity: inputOpacity, flex: 1 }}>
      <Composer
        {...props}
        text={inputText}
        onTextChanged={setInputText}
        textInputStyle={{
          color: Colors.text,
          fontSize: 16,
          backgroundColor: Colors.card, // Subtle contrast with input bar
          borderRadius: 20,
          paddingHorizontal: spacing.m,
          minHeight: 40,
          textAlignVertical: 'center',
          borderWidth: 0,
          borderColor: 'transparent',
          shadowColor: 'transparent',
        }}
      />
    </Animated.View>
  );

  const handleVoiceMessageReady = async (transcript: string) => {
    console.log('[DEBUG] Voice message ready with transcript:', transcript);
    console.log('[DEBUG] Current messages before voice message:', messages.length);
    console.log('[DEBUG] Current activeConversationId:', activeConversationId);
    
    // Track voice message specifically
    const metadata = analyticsService.getMessageMetadata(transcript);
    const userMessages = messages.filter(msg => msg.user._id === USER._id);
    const isFirstMessage = userMessages.length === 0 && !activeConversationId;

    await analyticsService.trackMessageSent({
      message_type: 'voice',
      message_length: metadata.length,
      word_count: metadata.word_count,
      persona_id: currentPersona.id,
      conversation_position: userMessages.length + 1,
      is_guest_user: isGuest,
      has_active_conversation_id: !!activeConversationId,
    });

    // Track conversation started if this is the first message
    if (isFirstMessage) {
      await trackConversationStarted(transcript, 'voice_initiated');
    }
    
    // Set the transcript in the input and trigger send
    const userMessage: IMessage = {
      _id: `user-${Date.now()}`,
      text: transcript,
      createdAt: new Date(),
      user: USER,
    };
    onSend([userMessage]);
  };

  const handleSendPress = () => {
    if (inputText.trim()) {
      const userMessage: IMessage = {
        _id: `user-${Date.now()}`,
        text: inputText.trim(),
        createdAt: new Date(),
        user: USER,
      };
      setInputText('');
      onSend([userMessage]);
    }
  };

  const handleRecordingStateChange = (recordingState: boolean) => {
    setIsRecording(recordingState);
    
    // Animate input opacity based on recording state
    Animated.timing(inputOpacity, {
      toValue: recordingState ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  // Track screen view
  useEffect(() => {
    analyticsService.trackScreenView({
      screen_name: 'chat_screen',
      is_guest_user: isGuest,
    });
  }, [isGuest]);

  const renderCustomSend = (props: SendProps<IMessage>) => (
    <VoiceMessageInput
      onVoiceMessageReady={handleVoiceMessageReady}
      isDisabled={isLoading}
      hasText={inputText.trim().length > 0}
      onSendPress={handleSendPress}
      onRecordingStateChange={handleRecordingStateChange}
      personaId={currentPersona.id}
      isGuestUser={isGuest}
    />
  );

  // --- End Minimal Bubble Renderer ---

  // Simple dots animation for the loading indicator
  useEffect(() => {
    let dotsTimer: NodeJS.Timeout;
    
    if (isLoading) {
      const animateDots = () => {
        setLoadingDots(prev => {
          if (prev === '') return '.';
          if (prev === '.') return '..';
          if (prev === '..') return '...';
          return '';
        });
        dotsTimer = setTimeout(animateDots, 350); // Change dots every 350ms
      };
      
      dotsTimer = setTimeout(animateDots, 350);
    } else {
      setLoadingDots('');
    }
    
    return () => {
      if (dotsTimer) clearTimeout(dotsTimer);
    };
  }, [isLoading]);

  // --- Custom Footer for Typing Indicator ---
  const renderFooter = () => {
    if (!isLoading) return null;
    
    return (
      <ThemedView
        style={{
          alignSelf: 'flex-start',
          backgroundColor: Colors.card,
          borderRadius: 18,
          paddingVertical: spacing.s,
          paddingHorizontal: spacing.m,
          marginBottom: spacing.s,
          marginLeft: spacing.m,
          maxWidth: '80%',
          flexDirection: 'row',
          alignItems: 'center',
          ...shadows.low,
        }}
        accessibilityLabel="Assistant is thinking"
      >
        <ThemedText
          style={{
            color: Colors.text,
            fontSize: 16,
            fontWeight: '400',
          }}
        >
          {`Reasoning${loadingDots}`}
        </ThemedText>
      </ThemedView>
    );
  };

  if (isLoadingHistory) {
    return (
      <ThemedView
        style={{
          flex: 1,
          backgroundColor: Colors.background,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color={Colors.tint} />
        <ThemedText style={{ color: Colors.text, marginTop: spacing.m, fontSize: 16 }}>
          Loading conversation...
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]}> 
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
        renderFooter={renderFooter}
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
