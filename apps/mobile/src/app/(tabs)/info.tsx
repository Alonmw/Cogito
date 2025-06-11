// app/(tabs)/info.tsx
import React from 'react';
import { ScrollView, Linking, StyleSheet, View } from 'react-native';
import { ThemedView } from '@shared/components/ThemedView';
import { ThemedText } from '@shared/components/ThemedText';
import { ThemedButton } from '@shared/components/ThemedButton';
import { Colors } from '@shared/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol, IconSymbolName } from '@shared/components/ui/IconSymbol';

type InfoSectionProps = {
  title: string;
  iconName: IconSymbolName;
  children: React.ReactNode;
};

const InfoSection = ({ title, iconName, children }: InfoSectionProps) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <IconSymbol name={iconName} size={22} color={Colors.text} />
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        {title}
      </ThemedText>
    </View>
    <View style={styles.sectionContent}>{children}</View>
  </View>
);

export default function InfoScreen() {
  const handleContactPress = () => {
    const email = 'alonmor123@gmail.com';
    const subject = 'Cogito App Feedback';
    Linking.openURL(`mailto:${email}?subject=${subject}`);
  };

  const handleBuyMeACoffeePress = () => {
    Linking.openURL('https://coff.ee/alonmor013e');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <ThemedText type="title" style={styles.headerTitle}>
          About Cogito
        </ThemedText>

        <InfoSection title="Our Mission" iconName="info.circle">
          <ThemedText>
            Cogito is designed to be your personal AI companion for exploring thoughts, ideas, and
            complex topics through the art of questioning. We believe that by engaging in
            thoughtful dialogue, users can achieve deeper understanding and clarity.
          </ThemedText>
        </InfoSection>

        <InfoSection title="Tips for Effective Sessions" iconName="lightbulb">
          <ThemedText style={styles.listItem}>
            • Be specific with your initial prompts or questions.
          </ThemedText>
          <ThemedText style={styles.listItem}>
            • Reflect on the questions asked before responding.
          </ThemedText>
          <ThemedText style={styles.listItem}>
            • Don't hesitate to say "I don't know" or to ask for clarification.
          </ThemedText>
          <ThemedText style={styles.listItem}>
            • The goal is exploration, not necessarily finding a single "right" answer.
          </ThemedText>
          <ThemedText style={styles.listItem}>
            • Use the "+" button to start a fresh line of inquiry with a chosen persona.
          </ThemedText>
        </InfoSection>

        <InfoSection title="Support Cogito" iconName="heart.circle">
          <ThemedText style={{ marginBottom: 16 }}>
          Thanks for using the app!
          </ThemedText>
          <ThemedText style={{ marginBottom: 16 }}>
          I built this app in my free time to share something useful—completely free and without any ads. If it’s brought value to you and you’d like to show a little support, you can do so by buying me a coffee.
          </ThemedText>
          <ThemedButton
            title="Buy Me a Coffee"
            onPress={handleBuyMeACoffeePress}
            variant="primary"
            rightIcon={<IconSymbol name="cup.and.saucer.fill" size={18} color={Colors.background} />}
            style={{ alignSelf: 'flex-start' }}
          />
        </InfoSection>

        <InfoSection title="Contact Us" iconName="envelope.circle">
          <ThemedText style={{ marginBottom: 16 }}>
            Have feedback, a bug report, a feature request, or just a question? We'd love to hear
            from you!
          </ThemedText>
          <ThemedButton
            title="Contact Developer"
            onPress={handleContactPress}
            variant="primary"
            style={{ alignSelf: 'flex-start' }}
          />
        </InfoSection>

        <ThemedView style={styles.footer}>
          <ThemedText type="default" style={{ opacity: 0.7 }}>
            Cogito v1.0.0
          </ThemedText>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    padding: 24,
    paddingBottom: 40,
  },
  headerTitle: {
    textAlign: 'center',
    marginBottom: 32,
    fontSize: 28,
  },
  section: {
    marginBottom: 28,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    marginLeft: 10,
    fontSize: 20,
  },
  sectionContent: {
    // No specific styles needed here for now
  },
  listItem: {
    marginBottom: 8,
    lineHeight: 22,
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
});
