// src/components/ChatHeader.tsx
import React from 'react';
// --- Removed StatusBar import ---
import { View, StyleSheet, Platform, Pressable } from 'react-native';
// --- End Removed Import ---
import { useAuth } from '@/src/context/AuthContext'; // Adjust path if needed
import { Colors } from '@/src/constants/Colors'; // Adjust path if needed
import { useColorScheme } from '@/src/hooks/useColorScheme'; // Adjust path if needed
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { spacing } from '@/src/constants/spacingAndShadows';

interface ChatHeaderProps {
  onNewChatPress: () => void;
  personaName?: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ onNewChatPress, personaName }) => {
  const { user, signOut } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const userDisplayText = user ? (user.displayName || user.email || 'Profile') : 'Guest';

  return (
    <ThemedView style={[styles.container, { backgroundColor: themeColors.background, borderBottomColor: themeColors.tabIconDefault }]}>
      <ThemedText type="title" style={styles.title}>{personaName || 'Socratic Partner'}</ThemedText>
      <ThemedView style={styles.buttonContainer}>
        <Pressable onPress={onNewChatPress} style={[styles.button, { borderColor: themeColors.tint }]}>
          <ThemedText style={[styles.buttonText, { color: themeColors.tint }]}>New Chat</ThemedText>
        </Pressable>
        {user ? (
          <Pressable onPress={signOut} style={[styles.button, { borderColor: themeColors.tint }]}>
            <ThemedText style={[styles.buttonText, { color: themeColors.tint }]}>Logout</ThemedText>
          </Pressable>
        ) : (
          <ThemedText style={[styles.guestText, { color: themeColors.text }]}>Guest Mode</ThemedText>
        )}
      </ThemedView>
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
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    marginLeft: spacing.s,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderRadius: 6,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  guestText: {
    fontSize: 14,
    marginLeft: spacing.s,
    fontStyle: 'italic',
  },
});

export default ChatHeader;
