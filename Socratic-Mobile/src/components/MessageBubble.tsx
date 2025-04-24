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
  const colorScheme = useColorScheme();
  const isUser = message.sender === 'user';

  // Determine background and text colors based on sender and theme
  const bubbleBackgroundColor = isUser
    ? Colors[colorScheme ?? 'light'].tint // User message background (often primary color)
    : Colors[colorScheme ?? 'light'].tabIconDefault; // Assistant message background (use default tab icon color - often gray)

  const textColor = isUser
    ? Colors[colorScheme ?? 'light'].background // User message text (often light on tint)
    : Colors[colorScheme ?? 'light'].text; // Assistant message text (default text color)

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
        ]}
      >
        <Text style={[styles.messageText, { color: textColor }]}>
          {message.text}
        </Text>
        {/* Optional: Add timestamp display */}
        {/* <Text style={[styles.timestamp, { color: textColor, opacity: 0.7 }]}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bubbleContainer: {
    marginVertical: 5,
    maxWidth: '80%', // Prevent bubbles from taking full width
  },
  userBubbleContainer: {
    alignSelf: 'flex-end', // Align user messages to the right
  },
  assistantBubbleContainer: {
    alignSelf: 'flex-start', // Align assistant messages to the left
  },
  bubble: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 15, // Rounded corners
    // Add shadow or elevation for depth (optional)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
  },
  timestamp: {
      fontSize: 10,
      alignSelf: 'flex-end',
      marginTop: 2,
  }
});

export default MessageBubble;
