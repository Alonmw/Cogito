// app/(tabs)/info.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Linking, Platform } from 'react-native';
import { Colors } from '@/src/constants/Colors'; // Adjust path if needed
import { useColorScheme } from '@/src/hooks/useColorScheme'; // Adjust path if needed
import { SafeAreaView } from 'react-native-safe-area-context'; // Use SafeAreaView

export default function InfoScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const handleContactPress = () => {
    // Replace with your actual contact email
    const email = 'alonmor123@gmail.com';
    const subject = 'Socratic Partner App Feedback';
    Linking.openURL(`mailto:${email}?subject=${subject}`);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContentContainer}>
        <Text style={[styles.mainTitle, { color: themeColors.text }]}>About Socratic Partner</Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Our Mission</Text>
          <Text style={[styles.paragraph, { color: themeColors.text }]}>
            Socratic Partner is designed to be your personal AI companion for exploring thoughts, ideas, and complex topics through the art of questioning. We believe that by engaging in thoughtful dialogue, users can achieve deeper understanding and clarity.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Tips for Effective Sessions</Text>
          <Text style={[styles.listItem, { color: themeColors.text }]}>• Be specific with your initial prompts or questions.</Text>
          <Text style={[styles.listItem, { color: themeColors.text }]}>• Reflect on the questions asked before responding.</Text>
          <Text style={[styles.listItem, { color: themeColors.text }]}>• Don't be afraid to say "I don't know" or to ask for clarification.</Text>
          <Text style={[styles.listItem, { color: themeColors.text }]}>• The goal is exploration, not necessarily finding a single "right" answer.</Text>
          <Text style={[styles.listItem, { color: themeColors.text }]}>• Use the "Clear Chat" button to start a fresh line of inquiry.</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Contact Us</Text>
          <Text style={[styles.paragraph, { color: themeColors.text }]}>
            Have feedback, a bug report, a feature request, or just a question? We'd love to hear from you!
          </Text>
          {/* Apply styles similar to ChatHeader buttons */}
          <Pressable
            onPress={handleContactPress}
            style={({ pressed }) => [
              styles.styledButton, // New style for consistency
              { borderColor: themeColors.tint },
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={[styles.styledButtonText, { color: themeColors.tint }]}>Contact Developer</Text>
          </Pressable>
        </View>

        {/* Add more sections as needed, e.g., Privacy Policy, Terms of Service links */}
        <View style={styles.footer}>
            <Text style={[styles.footerText, {color: themeColors.tabIconDefault}]}>Socratic Partner v1.0.0</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 20,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 25,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 10,
  },
  listItem: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 5,
    marginLeft: 10, // Indent list items
  },
  // --- New/Updated Styles for Contact Button ---
  styledButton: { // Style similar to ChatHeader buttons
    marginTop: 15,
    paddingVertical: 8, // Adjusted padding
    paddingHorizontal: 12, // Adjusted padding
    borderWidth: 1,
    // borderColor will be set dynamically
    borderRadius: 5,
    alignSelf: 'flex-start', // Align button left or center as preferred
    // Removed backgroundColor to make it a bordered button
  },
  styledButtonText: { // Style for the text inside the styled button
    fontSize: 14, // Match ChatHeader button text
    fontWeight: '500', // Match ChatHeader button text
    // Color will be set dynamically
  },
  // --- End New/Updated Styles ---
  buttonPressed: {
    opacity: 0.7, // Consistent pressed opacity
  },
  footer: {
      marginTop: 30,
      alignItems: 'center',
  },
  footerText: {
      fontSize: 12,
  }
});
