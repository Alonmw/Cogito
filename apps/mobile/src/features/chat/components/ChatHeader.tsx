// src/components/ChatHeader.tsx
import React from 'react';
// --- Removed StatusBar import ---
import { View, StyleSheet, Platform, Pressable, Share } from 'react-native';
// --- End Removed Import ---
import { useAuth } from '@features/auth/AuthContext'; // Adjust path if needed
import { Colors } from '@shared/constants/Colors'; // Adjust path if needed
import { ThemedView } from '@shared/components/ThemedView';
import { ThemedText } from '@shared/components/ThemedText';
import { spacing } from '@shared/constants/spacingAndShadows';
import { Ionicons } from '@expo/vector-icons';
import { IMessage } from 'react-native-gifted-chat';
import { useRouter } from 'expo-router';
import { PersonaUI } from '@shared/constants/personas';

interface ChatHeaderProps {
  onNewChatPress: () => void;
  personaName?: string;
  currentMessages?: IMessage[];
  conversationTitle?: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  onNewChatPress, 
  personaName, 
  currentMessages = [],
  conversationTitle = ''
}) => {
  const { user, signOut } = useAuth();
  const userDisplayText = user ? (user.displayName || user.email || 'Profile') : 'Guest';

  const handleShareChat = async () => {
    if (currentMessages && currentMessages.length > 0) {
      try {
        const title = conversationTitle || `Chat with ${personaName}`;
        const chatContent = currentMessages
          .map(msg => `${msg.user.name}: ${msg.text}`)
          .join('\n');
          
        const result = await Share.share({
          message: `${title}\n\n${chatContent}`,
          title: title,
        });
        
        if (result.action === Share.sharedAction) {
          console.log('Shared successfully');
        } else if (result.action === Share.dismissedAction) {
          console.log('Share dismissed');
        }
      } catch (error: any) {
        console.error('Error sharing chat:', error.message);
      }
    } else {
      console.log('No messages to share');
    }
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: Colors.background, borderBottomColor: Colors.tabIconDefault }]}>
      <ThemedText type="title" style={styles.title}>{personaName || 'Socratic Partner'}</ThemedText>
      
      <View style={styles.buttonsContainer}>
        <Pressable
          onPress={handleShareChat}
          style={styles.iconButton}
          accessibilityLabel="Share Conversation"
          disabled={currentMessages.length === 0}
        >
          <Ionicons 
            name="share-social-outline" 
            size={28} 
            color={currentMessages.length > 0 ? Colors.tint : Colors.tabIconDefault} 
          />
        </Pressable>
        
        <Pressable 
          onPress={onNewChatPress} 
          style={styles.iconButton}
          accessibilityLabel="New Chat"
        >
          <Ionicons name="add-circle-outline" size={28} color={Colors.tint} />
        </Pressable>
      </View>
      
      <ThemedView style={styles.divider} />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  divider: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E5EA',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'left',
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 10,
  },
});

export default ChatHeader;
