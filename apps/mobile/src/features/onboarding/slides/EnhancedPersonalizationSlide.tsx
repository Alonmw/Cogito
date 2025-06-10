import React, { useState, useEffect } from 'react';
import { StyleSheet, Pressable, ScrollView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { ThemedView } from '@shared/components/ThemedView';
import { ThemedText } from '@shared/components/ThemedText';
import { ThemedCard } from '@shared/components/ThemedCard';
import { AnimatedButton } from '@shared/components/AnimatedButton';
import { Colors } from '@shared/constants/Colors';

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

interface EnhancedPersonalizationSlideProps {
  onNext: () => void;
  onSkip: () => void;
  onTopicsSelected: (topics: string[]) => void;
}

export default function EnhancedPersonalizationSlide({ 
  onNext, 
  onSkip, 
  onTopicsSelected 
}: EnhancedPersonalizationSlideProps) {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  // Animation values
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(30);
  const subtitleOpacity = useSharedValue(0);
  const subtitleTranslateY = useSharedValue(30);
  const topicsOpacity = useSharedValue(0);
  const topicsTranslateY = useSharedValue(30);
  const buttonScale = useSharedValue(0);

  useEffect(() => {
    // Orchestrated entrance animation
    titleOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
    titleTranslateY.value = withDelay(200, withSpring(0));
    
    subtitleOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
    subtitleTranslateY.value = withDelay(400, withSpring(0));
    
    topicsOpacity.value = withDelay(600, withTiming(1, { duration: 600 }));
    topicsTranslateY.value = withDelay(600, withSpring(0));
    
    buttonScale.value = withDelay(800, withSpring(1, { damping: 15, stiffness: 150 }));
  }, []);

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

  // Animated styles
  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: subtitleTranslateY.value }],
  }));

  const topicsStyle = useAnimatedStyle(() => ({
    opacity: topicsOpacity.value,
    transform: [{ translateY: topicsTranslateY.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedCard style={styles.textCard}>
          <Animated.View style={titleStyle}>
            <ThemedText style={styles.title} type="title">
              What sparks your curiosity?
            </ThemedText>
          </Animated.View>
          
          <Animated.View style={subtitleStyle}>
            <ThemedText style={styles.subtitle} type="default">
              Help us personalize your journey. Select the philosophical topics that intrigue you most:
            </ThemedText>
          </Animated.View>
          
          <Animated.View style={[styles.scrollableContainer, topicsStyle]}>
            <ScrollView 
              style={styles.topicsScrollContainer}
              contentContainerStyle={styles.topicsContainer}
              showsVerticalScrollIndicator={false}
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
          </Animated.View>
          
          {selectedTopics.length > 0 && (
            <ThemedText style={styles.selectedCount} type="default">
              {selectedTopics.length} topic{selectedTopics.length !== 1 ? 's' : ''} selected
            </ThemedText>
          )}
        </ThemedCard>
      </ThemedView>
      
      <Animated.View style={[styles.buttonContainer, buttonStyle]}>
        <ThemedView style={styles.buttonRow}>
          <AnimatedButton
            title="Skip"
            onPress={onSkip}
            variant="secondary"
            size="medium"
            style={styles.skipButton}
          />
          <AnimatedButton
            title="Continue"
            onPress={handleContinue}
            variant="primary"
            size="medium"
            style={styles.continueButton}
          />
        </ThemedView>
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 120,
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
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  skipButton: {
    flex: 1,
  },
  continueButton: {
    flex: 1,
  },
}); 