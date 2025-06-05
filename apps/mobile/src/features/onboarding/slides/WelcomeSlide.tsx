import React from 'react';
import { StyleSheet, Image, Dimensions } from 'react-native';
import { ThemedView } from '@shared/components/ThemedView';
import { ThemedText } from '@shared/components/ThemedText';
import { ThemedButton } from '@shared/components/ThemedButton';
import { ThemedCard } from '@shared/components/ThemedCard';
import { Colors } from '@shared/constants/Colors';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface WelcomeSlideProps {
  onNext: () => void;
}

export default function WelcomeSlide({ onNext }: WelcomeSlideProps) {
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
            Welcome explorer
          </ThemedText>
          
          <ThemedText style={styles.subtitle} type="default">
            We're thrilled to have you join us on this journey of philosophical discovery. 
            Cogito is your personal guide to exploring the depths of human thought and wisdom.
          </ThemedText>
          
          <ThemedText style={styles.description} type="default">
            Let's take a moment to set up your experience and help you get the most out of 
            your philosophical explorations.
          </ThemedText>
        </ThemedCard>
      </ThemedView>
      
      <ThemedView style={styles.buttonContainer}>
        <ThemedButton
          title="Let's Begin"
          onPress={onNext}
          variant="primary"
          size="large"
          style={styles.nextButton}
        />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 100,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    opacity: 0.8,
  },
  textCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Lora-SemiBold',
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 16,
    color: Colors.text,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 16,
    color: Colors.text,
    opacity: 0.9,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    color: Colors.text,
    opacity: 0.8,
  },
  buttonContainer: {
    paddingHorizontal: 20,
  },
  nextButton: {
    borderRadius: 12,
    paddingVertical: 16,
  },
}); 