// src/components/ChatInput.tsx
import React from 'react';
import { View, TextInput, Button, StyleSheet, Platform } from 'react-native';
import { Colors } from '@/src/constants/Colors'; // Adjust path if needed

interface ChatInputProps {
  inputText: string;
  setInputText: (text: string) => void;
  onSend: () => void; // Function to call when send is pressed
  isLoading: boolean; // To disable input/button while processing
}

const ChatInput: React.FC<ChatInputProps> = ({
  inputText,
  setInputText,
  onSend,
  isLoading,
}) => {
  return (
    <View style={[styles.inputContainer, { borderTopColor: Colors.tabIconDefault }]}>
      <TextInput
        style={[
          styles.input,
          {
            color: Colors.text,
            borderColor: Colors.tabIconDefault,
            // Removed background color setting that used '.card'
            // backgroundColor: Colors.card,
          },
        ]}
        value={inputText}
        onChangeText={setInputText}
        placeholder="Type your message..."
        placeholderTextColor={Colors.tabIconDefault}
        editable={!isLoading} // Disable input while loading
        multiline // Allow multiple lines
        // Add other props like autoFocus, keyboardType etc. if needed
      />
      <Button
        title="Send"
        onPress={onSend}
        disabled={isLoading || inputText.trim().length === 0}
        color={Platform.OS === 'ios' ? Colors.tint : undefined} // iOS uses color prop
      />
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: StyleSheet.hairlineWidth, // Use hairline width for subtle border
    alignItems: 'center',
    // backgroundColor: Colors.background, // Apply background later
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20, // Rounded corners
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8, // Adjust padding per platform
    marginRight: 10,
    maxHeight: 100, // Limit input height if multiline
    fontSize: 16,
  },
});

export default ChatInput;
