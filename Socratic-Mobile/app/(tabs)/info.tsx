// app/(tabs)/info.tsx
import React from 'react';
import { ScrollView, Linking } from 'react-native';
import { ThemedView } from '@/src/components/ThemedView';
import { ThemedText } from '@/src/components/ThemedText';
import { ThemedButton } from '@/src/components/ThemedButton';
import { ThemedCard } from '@/src/components/ThemedCard';
import { Colors } from '@/src/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function InfoScreen() {
  const handleContactPress = () => {
    const email = 'alonmor123@gmail.com';
    const subject = 'Socratic Partner App Feedback';
    Linking.openURL(`mailto:${email}?subject=${subject}`);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <ThemedText type="title" style={{ textAlign: 'center', marginBottom: 24 }}>
          About Socratic Partner
        </ThemedText>
        <ThemedCard style={{ marginBottom: 20, padding: 18 }}>
          <ThemedText type="subtitle" style={{ marginBottom: 8 }}>
            Our Mission
          </ThemedText>
          <ThemedText>
            Socratic Partner is designed to be your personal AI companion for exploring thoughts, ideas, and complex topics through the art of questioning. We believe that by engaging in thoughtful dialogue, users can achieve deeper understanding and clarity.
          </ThemedText>
        </ThemedCard>
        <ThemedCard style={{ marginBottom: 20, padding: 18 }}>
          <ThemedText type="subtitle" style={{ marginBottom: 8 }}>
            Tips for Effective Sessions
          </ThemedText>
          <ThemedText style={{ marginBottom: 4 }}>• Be specific with your initial prompts or questions.</ThemedText>
          <ThemedText style={{ marginBottom: 4 }}>• Reflect on the questions asked before responding.</ThemedText>
          <ThemedText style={{ marginBottom: 4 }}>• Don\'t be afraid to say "I don\'t know" or to ask for clarification.</ThemedText>
          <ThemedText style={{ marginBottom: 4 }}>• The goal is exploration, not necessarily finding a single "right" answer.</ThemedText>
          <ThemedText style={{ marginBottom: 4 }}>• Use the "Clear Chat" button to start a fresh line of inquiry.</ThemedText>
        </ThemedCard>
        <ThemedCard style={{ marginBottom: 20, padding: 18 }}>
          <ThemedText type="subtitle" style={{ marginBottom: 8 }}>
            Contact Us
          </ThemedText>
          <ThemedText style={{ marginBottom: 12 }}>
            Have feedback, a bug report, a feature request, or just a question? We\'d love to hear from you!
          </ThemedText>
          <ThemedButton
            title="Contact Developer"
            onPress={handleContactPress}
            variant="outline"
            style={{ alignSelf: 'flex-start' }}
          />
        </ThemedCard>
        <ThemedView style={{ marginTop: 32, alignItems: 'center' }}>
          <ThemedText type="default" style={{ opacity: 0.7 }}>
            Socratic Partner v1.0.0
          </ThemedText>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}
