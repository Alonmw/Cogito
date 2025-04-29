// src/components/MessageBubble.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/src/constants/Colors'; // Adjust path if needed
import { useColorScheme } from '@/src/hooks/useColorScheme'; // Adjust path if needed

// Define the structure for a message (can be shared in types/index.ts later)
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const colorScheme = useColorScheme() ?? 'light'; // Default to light if undefined
  const isUser = message.sender === 'user';
  const themeColors = Colors[colorScheme]; // Get theme colors

  // Determine background and text colors based on sender and theme
  // Using tint for user, and a slightly different background/card for assistant
  const bubbleBackgroundColor = isUser
    ? themeColors.tint
    : (colorScheme === 'light' ? '#E5E5EA' : '#2C2C2E'); // Example: Specific grays for assistant

  const textColor = isUser
    ? (colorScheme === 'light' ? '#FFFFFF' : '#FFFFFF') // White text on tint background usually works
    : themeColors.text; // Default text color for assistant

  return (
    <View
      style={[
        styles.bubbleContainer,
        isUser ? styles.userBubbleContainer : styles.assistantBubbleContainer,
      ]}
    >
      <View
        style={[
          styles.bubble,
          { backgroundColor: bubbleBackgroundColor },
          // Add slightly different border radius for visual distinction (optional)
          isUser ? styles.userBubble : styles.assistantBubble,
        ]}
      >
        <Text style={[styles.messageText, { color: textColor }]}>
          {message.text}
        </Text>
        {/* Timestamps still hidden as per previous request */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bubbleContainer: {
    // --- Increased vertical margin further ---
    marginVertical: 15, // Increased from 10
    // --- End Increase ---
    maxWidth: '80%',
  },
  userBubbleContainer: {
    alignSelf: 'flex-end',
  },
  assistantBubbleContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    paddingVertical: 10, // Increased vertical padding
    paddingHorizontal: 14, // Increased horizontal padding
    // Add shadow or elevation for depth (optional)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5, // Slightly increased shadow radius
    elevation: 2,
  },
  userBubble: {
      // Example: Different rounding for user
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
      borderBottomLeftRadius: 18,
      borderBottomRightRadius: 5, // Slightly less round on one corner
  },
  assistantBubble: {
      // Example: Different rounding for assistant
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
      borderBottomLeftRadius: 5, // Slightly less round on one corner
      borderBottomRightRadius: 18,
  },
  messageText: {
    fontSize: 16,
  },
  // Timestamp styles (kept in case needed later)
  timestamp: {
      fontSize: 10,
      alignSelf: 'flex-end',
      marginTop: 2,
  }
});

export default MessageBubble;
