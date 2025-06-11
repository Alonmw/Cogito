import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
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

interface EnhancedPurposeSlideProps {
  onNext: () => void;
}

export default function EnhancedPurposeSlide({ onNext }: EnhancedPurposeSlideProps) {
  // Animation values
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(30);
  const subtitleOpacity = useSharedValue(0);
  const subtitleTranslateY = useSharedValue(30);
  const buttonScale = useSharedValue(0);

  useEffect(() => {
    // Orchestrated entrance animation
    titleOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
    titleTranslateY.value = withDelay(200, withSpring(0));
    
    subtitleOpacity.value = withDelay(500, withTiming(1, { duration: 600 }));
    subtitleTranslateY.value = withDelay(500, withSpring(0));
    
    buttonScale.value = withDelay(800, withSpring(1, { damping: 15, stiffness: 150 }));
  }, []);

  // Animated styles
  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: subtitleTranslateY.value }],
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
              Learn from the Greatest Minds
            </ThemedText>
          </Animated.View>
          
          <Animated.View style={subtitleStyle}>
            <ThemedText style={styles.subtitle} type="default">
              Discover wisdom, challenge ideas, and explore the depths of human thought through 
              conversations with history's most brilliant philosophers.
            </ThemedText>
          </Animated.View>
        </ThemedCard>
      </ThemedView>
      
      <Animated.View style={[styles.buttonContainer, buttonStyle]}>
        <AnimatedButton
          title="Continue"
          onPress={onNext}
          variant="primary"
          size="large"
          style={styles.nextButton}
        />
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  textCard: {
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: Colors.card,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
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
  buttonContainer: {
    paddingHorizontal: 20,
  },
  nextButton: {
    borderRadius: 12,
    paddingVertical: 16,
  },
}); 