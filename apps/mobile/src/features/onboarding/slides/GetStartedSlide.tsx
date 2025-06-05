import React from 'react';
import { StyleSheet, Dimensions, Image } from 'react-native';
import { ThemedView } from '@shared/components/ThemedView';
import { ThemedText } from '@shared/components/ThemedText';
import { ThemedButton } from '@shared/components/ThemedButton';
import { ThemedCard } from '@shared/components/ThemedCard';
import { Colors } from '@shared/constants/Colors';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface GetStartedSlideProps {
  onGetStarted: () => void;
  isLoading?: boolean;
}

export default function GetStartedSlide({ onGetStarted, isLoading = false }: GetStartedSlideProps) {
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedView style={styles.logoContainer}>
          <Image
            source={require('@shared/assets/images/owl-logo-prod.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </ThemedView>
        
        <ThemedCard style={styles.textCard}>
          <ThemedText style={styles.title} type="title">
            You're all set!
          </ThemedText>
          
          <ThemedText style={styles.subtitle} type="default">
            You can now choose a philosopher and start chatting, enjoy!
          </ThemedText>
        </ThemedCard>
      </ThemedView>
      
      <ThemedView style={styles.buttonContainer}>
        <ThemedButton
          title="Choose a Philosopher"
          onPress={onGetStarted}
          variant="primary"
          size="large"
          style={styles.getStartedButton}
          isLoading={isLoading}
          disabled={isLoading}
        />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 100,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textCard: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
  },
  logoContainer: {
    backgroundColor: Colors.background,
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    opacity: 0.8,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 20,
  },
  title: {
    fontFamily: 'Lora-SemiBold',
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 16,
    color: Colors.text,
  },
  subtitle: {
    fontFamily: 'Lora-SemiBold',
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 24,
    color: Colors.text,
    opacity: 0.9,
  },
  featuresContainer: {
    marginBottom: 24,
    width: '100%',
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 28,
  },
  featureText: {
    fontSize: 16,
    color: Colors.text,
    opacity: 0.8,
    flex: 1,
  },
  encouragement: {
    fontFamily: 'Lora-SemiBold',
    fontSize: 16,
    textAlign: 'center',
    color: Colors.tint,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  buttonContainer: {
    paddingHorizontal: 20,
  },
  getStartedButton: {
    borderRadius: 12,
    paddingVertical: 18,
  },
}); 