// src/components/ChatHeader.tsx
import React from 'react';
// --- Removed StatusBar import ---
import { View, Text, StyleSheet, Platform, Pressable } from 'react-native';
// --- End Removed Import ---
import { useAuth } from '@/src/context/AuthContext'; // Adjust path if needed
import { Colors } from '@/src/constants/Colors'; // Adjust path if needed
import { useColorScheme } from '@/src/hooks/useColorScheme'; // Adjust path if needed

interface ChatHeaderProps {
  onClearChat: () => void; // Function passed from parent to clear messages
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ onClearChat }) => {
  const { user, signOut } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const userDisplayText = user ? (user.displayName || user.email || 'Profile') : 'Guest';

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background, borderBottomColor: themeColors.tabIconDefault }]}>
      <Text style={[styles.title, { color: themeColors.text }]}>Socratic Questioner</Text>
      <View style={styles.buttonContainer}>
        <Pressable onPress={onClearChat} style={[styles.button, { borderColor: themeColors.tint }]}>
           <Text style={[styles.buttonText, { color: themeColors.tint }]}>New Chat</Text>
        </Pressable>
        {user ? (
          <Pressable onPress={signOut} style={[styles.button, { borderColor: themeColors.tint }]}>
            <Text style={[styles.buttonText, { color: themeColors.tint }]}>Logout</Text>
          </Pressable>
        ) : (
          <Text style={[styles.guestText, { color: themeColors.text }]}>Guest Mode</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10, // Keep vertical padding
    borderBottomWidth: StyleSheet.hairlineWidth,
    // --- Removed explicit paddingTop using StatusBar.currentHeight ---
    // paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 10 : 10,
    // --- End Removed Padding ---
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
      marginLeft: 15,
      paddingVertical: 5,
      paddingHorizontal: 8,
      borderWidth: 1,
      borderRadius: 5,
  },
  buttonText: {
      fontSize: 14,
      fontWeight: '500',
  },
  guestText: {
    fontSize: 14,
    marginLeft: 15,
    fontStyle: 'italic',
  },
});

export default ChatHeader;
