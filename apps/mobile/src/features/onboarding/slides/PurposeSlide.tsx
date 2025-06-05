import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { ThemedView } from '@shared/components/ThemedView';
import { ThemedText } from '@shared/components/ThemedText';
import { ThemedButton } from '@shared/components/ThemedButton';
import { ThemedCard } from '@shared/components/ThemedCard';
import { Colors } from '@shared/constants/Colors';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface PurposeSlideProps {
  onNext: () => void;
}

export default function PurposeSlide({ onNext }: PurposeSlideProps) {
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedCard style={styles.textCard}>
          <ThemedText style={styles.title} type="title">
            Your philosophical companion
          </ThemedText>
          
          <ThemedText style={styles.subtitle} type="default">
            Cogito allows you to explore the great questions that have fascinated 
            humanity for centuries. Whether you're curious about ethics, meaning, 
            consciousness, or existence itself, we're here to guide your journey.
          </ThemedText>
          
          <ThemedView style={styles.featuresContainer}>
            <ThemedView style={styles.feature}>
              <ThemedText style={styles.featureTitle}>💭 Deep Conversations</ThemedText>
              <ThemedText style={styles.featureDescription}>
                Engage with different philosophical perspectives through thoughtful dialogue
              </ThemedText>
            </ThemedView>
            
            <ThemedView style={styles.feature}>
              <ThemedText style={styles.featureTitle}>🎭 Multiple Personas</ThemedText>
              <ThemedText style={styles.featureDescription}>
                Chat with AI philosophers representing various schools of thought
              </ThemedText>
            </ThemedView>
            
            <ThemedView style={styles.feature}>
              <ThemedText style={styles.featureTitle}>🌱 Personal Growth</ThemedText>
              <ThemedText style={styles.featureDescription}>
                Develop your critical thinking and expand your worldview
              </ThemedText>
            </ThemedView>
          </ThemedView>
          
          <ThemedText style={styles.callToAction} type="default">
            Ready to embark on your philosophical adventure?
          </ThemedText>
        </ThemedCard>
      </ThemedView>
      
      <ThemedView style={styles.buttonContainer}>
        <ThemedButton
          title="I'm Ready"
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
    paddingTop: 40,
    paddingBottom: 100,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  textCard: {
    padding: 24,
    borderRadius: 16,
  },
  title: {
    fontFamily: 'Lora-SemiBold',
    fontSize: 26,
    textAlign: 'center',
    marginBottom: 20,
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
  },
  feature: {
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    color: Colors.text,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.text,
    opacity: 0.8,
  },
  callToAction: {
    fontFamily: 'Lora-SemiBold',
    fontSize: 16,
    textAlign: 'center',
    color: Colors.tint,
    fontStyle: 'italic',
  },
  buttonContainer: {
    paddingHorizontal: 20,
  },
  nextButton: {
    borderRadius: 12,
    paddingVertical: 16,
  },
}); 