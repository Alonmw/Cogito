import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
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
        <ThemedCard style={styles.textCard}>
          <ThemedText style={styles.emoji}>🎯</ThemedText>
          
          <ThemedText style={styles.title} type="title">
            You're all set!
          </ThemedText>
          
          <ThemedText style={styles.subtitle} type="default">
            Your philosophical adventure begins now. Dive in and start exploring 
            the great questions that have captivated thinkers throughout history.
          </ThemedText>
          
          <ThemedView style={styles.featuresContainer}>
            <ThemedView style={styles.feature}>
              <ThemedText style={styles.featureIcon}>💭</ThemedText>
              <ThemedText style={styles.featureText}>
                Engage in thoughtful conversations
              </ThemedText>
            </ThemedView>
            
            <ThemedView style={styles.feature}>
              <ThemedText style={styles.featureIcon}>🎭</ThemedText>
              <ThemedText style={styles.featureText}>
                Choose from different philosophical personas
              </ThemedText>
            </ThemedView>
            
            <ThemedView style={styles.feature}>
              <ThemedText style={styles.featureIcon}>🌱</ThemedText>
              <ThemedText style={styles.featureText}>
                Grow your understanding and perspective
              </ThemedText>
            </ThemedView>
          </ThemedView>
          
          <ThemedText style={styles.encouragement} type="default">
            The unexamined life is not worth living - let's examine it together.
          </ThemedText>
        </ThemedCard>
      </ThemedView>
      
      <ThemedView style={styles.buttonContainer}>
        <ThemedButton
          title="Start Exploring"
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
  },
  textCard: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
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