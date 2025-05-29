// src/components/MessageList.tsx
import React, { useRef } from 'react'; // Removed useEffect
import { FlatList, StyleSheet, View } from 'react-native'; // Removed Text import
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
  // Ref is kept in case needed for other interactions later
  const flatListRef = useRef<FlatList>(null);

  // Removed useEffect for scrolling - inverted prop handles this

  const renderItem = ({ item }: { item: Message }) => (
    // --- Removed transform View wrapper ---
    <MessageBubble message={item} />
    // --- End Removed transform ---
  );

  // Ensure data passed to FlatList is always an array
  const safeMessages = Array.isArray(messages) ? messages : [];

  return (
    <FlatList
      ref={flatListRef}
      data={safeMessages} // Pass the original array
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      // --- Removed transform style from FlatList ---
      style={styles.list}
      // --- End Removed transform ---
      contentContainerStyle={styles.listContentContainer}
      inverted // <-- Keep the inverted prop!
      keyboardShouldPersistTaps="handled"
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
    // When inverted, list grows from bottom up, padding might need adjustment if header exists
  },
});

export default MessageList;
