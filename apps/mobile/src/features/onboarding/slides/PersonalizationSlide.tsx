import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Pressable, Dimensions, ScrollView, Animated } from 'react-native';
import { ThemedView } from '@shared/components/ThemedView';
import { ThemedText } from '@shared/components/ThemedText';
import { ThemedButton } from '@shared/components/ThemedButton';
import { ThemedCard } from '@shared/components/ThemedCard';
import { Colors } from '@shared/constants/Colors';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface PersonalizationSlideProps {
  onNext: () => void;
  onSkip: () => void;
  onTopicsSelected: (topics: string[]) => void;
}

const PHILOSOPHY_TOPICS = [
  'Stoicism',
  'Existentialism', 
  'Ethics',
  'Epistemology',
  'Metaphysics',
  'Political Philosophy',
  'Philosophy of Mind',
  'Eastern Philosophy',
  'Aesthetics',
  'Logic',
  'Philosophy of Science',
  'Phenomenology'
];

export default function PersonalizationSlide({ onNext, onSkip, onTopicsSelected }: PersonalizationSlideProps) {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const scrollHintOpacity = useRef(new Animated.Value(1)).current;

  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev => {
      const newTopics = prev.includes(topic)
        ? prev.filter(t => t !== topic)
        : [...prev, topic];
      
      onTopicsSelected(newTopics);
      return newTopics;
    });
  };

  const handleContinue = () => {
    onTopicsSelected(selectedTopics);
    onNext();
  };

  // Bounce animation for scroll hint
  useEffect(() => {
    const startBounceAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -6,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    const timer = setTimeout(startBounceAnimation, 1000); // Start after 1 second
    return () => clearTimeout(timer);
  }, [bounceAnim]);

  // Hide scroll hint when user scrolls
  const handleScroll = () => {
    Animated.timing(scrollHintOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedCard style={styles.textCard}>
          <ThemedText style={styles.title} type="title">
            What sparks your curiosity?
          </ThemedText>
          
          <ThemedText style={styles.subtitle} type="default">
            Help us personalize your journey. Select the philosophical topics that intrigue you most:
          </ThemedText>
          
          <ThemedView style={styles.scrollableContainer}>
            <ScrollView 
              style={styles.topicsScrollContainer}
              contentContainerStyle={styles.topicsContainer}
              showsVerticalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
            >
              {PHILOSOPHY_TOPICS.map((topic) => (
                <Pressable
                  key={topic}
                  style={[
                    styles.topicButton,
                    selectedTopics.includes(topic) && styles.selectedTopicButton
                  ]}
                  onPress={() => toggleTopic(topic)}
                >
                  <ThemedText
                    style={[
                      styles.topicText,
                      selectedTopics.includes(topic) && styles.selectedTopicText
                    ]}
                  >
                    {topic}
                  </ThemedText>
                </Pressable>
              ))}
            </ScrollView>
            {PHILOSOPHY_TOPICS.length > 6 && (
              <Animated.View style={[styles.scrollHint, { 
                opacity: scrollHintOpacity,
                transform: [{ translateY: bounceAnim }] 
              }]}>
                <ThemedText style={styles.scrollIconText}>⌄</ThemedText>
              </Animated.View>
            )}
          </ThemedView>
          
          {selectedTopics.length > 0 && (
            <ThemedText style={styles.selectedCount} type="default">
              {selectedTopics.length} topic{selectedTopics.length !== 1 ? 's' : ''} selected
            </ThemedText>
          )}
        </ThemedCard>
      </ThemedView>
      
      <ThemedView style={styles.buttonContainer}>
        <ThemedView style={styles.buttonRow}>
          <ThemedButton
            title="Skip"
            onPress={onSkip}
            variant="secondary"
            size="medium"
            style={styles.skipButton}
            textStyle={styles.buttonText}
          />
          <ThemedButton
            title={selectedTopics.length > 0 ? "Continue" : "Continue"}
            onPress={handleContinue}
            variant="primary"
            size="medium"
            style={styles.continueButton}
            textStyle={styles.buttonText}
          />
        </ThemedView>
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
    paddingTop: '10%',
  },
  textCard: {
    padding: 24,
    borderRadius: 16,
  },
  title: {
    fontFamily: 'Lora-SemiBold',
    fontSize: 26,
    textAlign: 'center',
    marginBottom: 16,
    color: Colors.text,
  },
  subtitle: {
    fontFamily: 'Lora-SemiBold',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    color: Colors.text,
    opacity: 0.9,
  },
  scrollableContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  topicsScrollContainer: {
    maxHeight: 300,
  },
  topicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    paddingBottom: 10,
  },
  topicButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.tabIconDefault,
    backgroundColor: 'transparent',
    margin: 4,
  },
  selectedTopicButton: {
    backgroundColor: Colors.tint,
    borderColor: Colors.tint,
  },
  topicText: {
    fontSize: 14,
    color: Colors.text,
    textAlign: 'center',
  },
  selectedTopicText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  selectedCount: {
    fontSize: 14,
    textAlign: 'center',
    color: Colors.tint,
    fontWeight: '500',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 12,
    minHeight: 58,
  },
  continueButton: {
    flex: 1,
    
    paddingVertical: 16,
    minHeight: 58,
  },
  buttonText: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: 'Lora-SemiBold',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  scrollHint: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    width: 28,
    height: 28,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  scrollIconText: {
    fontSize: 18,
    color: Colors.tabIconDefault,
    fontWeight: 'bold',
  },
}); 