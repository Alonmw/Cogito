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
            Chat with history's greatest minds
          </ThemedText>
          
          <ThemedText style={styles.subtitle} type="default">
            Ever wanted to debate with Socrates? Challenge Kant's ideas? 
            Or explore Nietzsche's philosophy? Now you can! 
            Jump into conversations with the philosophers who shaped the world we live in.
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
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: '65%',
  },
  textCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
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