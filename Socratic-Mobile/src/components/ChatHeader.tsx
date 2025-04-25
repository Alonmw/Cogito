// src/components/ChatHeader.tsx
import React from 'react';
// --- Import StatusBar and Platform ---
import { View, Text, StyleSheet, Platform, Pressable, StatusBar } from 'react-native';
// --- End Import ---
import { useAuth } from '@/src/context/AuthContext'; // Adjust path if needed
import { Colors } from '@/src/constants/Colors'; // Adjust path if needed
import { useColorScheme } from '@/src/hooks/useColorScheme'; // Adjust path if needed

interface ChatHeaderProps {
  onClearChat: () => void; // Function passed from parent to clear messages
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ onClearChat }) => {
  const { user, signOut } = useAuth();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  // Determine user display text (can be enhanced later)
  const userDisplayText = user ? (user.displayName || user.email || 'Profile') : 'Guest';

  return (
    // Ensure the header has a solid background color from the theme
    <View style={[styles.container, { backgroundColor: themeColors.background, borderBottomColor: themeColors.tabIconDefault }]}>
      <Text style={[styles.title, { color: themeColors.text }]}>Socratic Partner</Text>
      <View style={styles.buttonContainer}>
        <Pressable onPress={onClearChat} style={[styles.button, { borderColor: themeColors.tint }]}>
           <Text style={[styles.buttonText, { color: themeColors.tint }]}>Clear Chat</Text>
        </Pressable>
        {/* Conditionally render Logout button or Guest text */}
        {user ? (
          <Pressable onPress={signOut} style={[styles.button, { borderColor: themeColors.tint }]}>
            <Text style={[styles.buttonText, { color: themeColors.tint }]}>Logout</Text>
          </Pressable>
        ) : (
          // Keeping Guest Mode simple text for now
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
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    // --- Add Platform-specific Padding for Android Status Bar ---
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 10 : 10, // Add status bar height + base padding for Android
    // --- End Padding ---
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
      marginLeft: 15, // Space between buttons
      paddingVertical: 5,
      paddingHorizontal: 8,
      borderWidth: 1,
      // borderColor is now set dynamically using themeColors.tint
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
