// src/components/MessageList.tsx
import React, { useRef, useEffect } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import MessageBubble from './MessageBubble'; // Import the bubble component

// Define the structure for a message (can be shared in types/index.ts later)
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface MessageListProps {
  messages: Message[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const flatListRef = useRef<FlatList>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]); // Dependency on messages array

  const renderItem = ({ item }: { item: Message }) => (
    <MessageBubble message={item} />
  );

  return (
    <FlatList
      ref={flatListRef}
      data={messages}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      style={styles.list}
      contentContainerStyle={styles.listContentContainer}
      // inverted // Uncomment this later for typical chat bottom-up display
      // keyboardShouldPersistTaps="handled" // Good for handling taps while keyboard is open
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1, // Take up available space
    paddingHorizontal: 10,
  },
  listContentContainer: {
    paddingVertical: 10, // Add padding top and bottom inside the scroll view
  },
});

export default MessageList;
