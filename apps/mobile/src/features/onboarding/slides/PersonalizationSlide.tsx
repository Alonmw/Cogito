import React, { useState } from 'react';
import { StyleSheet, Pressable, Dimensions, ScrollView } from 'react-native';
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
            title="Skip for now"
            onPress={onSkip}
            variant="secondary"
            size="medium"
            style={styles.skipButton}
          />
          <ThemedButton
            title={selectedTopics.length > 0 ? "Continue" : "Continue anyway"}
            onPress={handleContinue}
            variant="primary"
            size="medium"
            style={styles.continueButton}
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
  topicsScrollContainer: {
    maxHeight: 300,
    marginBottom: 16,
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
    borderRadius: 1,
    paddingVertical: 14,
    
  },
  continueButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
  },
}); 