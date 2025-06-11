import React, { useEffect } from 'react';
import { StyleSheet, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
} from 'react-native-reanimated';
import { ThemedView } from '@shared/components/ThemedView';
import { ThemedText } from '@shared/components/ThemedText';
import { ThemedCard } from '@shared/components/ThemedCard';
import { AnimatedButton } from '@shared/components/AnimatedButton';
import { Colors } from '@shared/constants/Colors';

interface EnhancedGetStartedSlideProps {
  onGetStarted: () => void;
  isLoading?: boolean;
}

export default function EnhancedGetStartedSlide({ 
  onGetStarted, 
  isLoading = false 
}: EnhancedGetStartedSlideProps) {
  // Animation values
  const logoScale = useSharedValue(0);
  const logoRotation = useSharedValue(360);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(30);
  const subtitleOpacity = useSharedValue(0);
  const subtitleTranslateY = useSharedValue(30);
  const buttonScale = useSharedValue(0);
  const celebrationScale = useSharedValue(1);

  useEffect(() => {
    // Celebration entrance animation
    logoScale.value = withSpring(1, { damping: 15, stiffness: 150 });
    logoRotation.value = withSpring(0, { damping: 20, stiffness: 100 });
    
    titleOpacity.value = withDelay(300, withTiming(1, { duration: 600 }));
    titleTranslateY.value = withDelay(300, withSpring(0));
    
    subtitleOpacity.value = withDelay(500, withTiming(1, { duration: 600 }));
    subtitleTranslateY.value = withDelay(500, withSpring(0));
    
    buttonScale.value = withDelay(700, withSpring(1, { damping: 15, stiffness: 150 }));
    
    // Add a celebration pulse effect
    celebrationScale.value = withDelay(900, withSequence(
      withSpring(1.1, { damping: 15 }),
      withSpring(1, { damping: 15 })
    ));
  }, []);

  // Animated styles
  const logoStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotation.value}deg` },
    ],
  }));

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

  const celebrationStyle = useAnimatedStyle(() => ({
    transform: [{ scale: celebrationScale.value }],
  }));

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.content}>
        <Animated.View style={[styles.logoContainer, logoStyle]}>
          <Image
            source={require('@shared/assets/images/owl-logo-prod.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
        
        <Animated.View style={celebrationStyle}>
          <ThemedCard style={styles.textCard}>
            <Animated.View style={titleStyle}>
              <ThemedText style={styles.title} type="title">
                You're all set!
              </ThemedText>
            </Animated.View>
            
            <Animated.View style={subtitleStyle}>
              <ThemedText style={styles.subtitle} type="default">
              You can now choose a philosopher and start chatting, enjoy!
              </ThemedText>
            </Animated.View>
          </ThemedCard>
        </Animated.View>
      </ThemedView>
      
      <Animated.View style={[styles.buttonContainer, buttonStyle]}>
        <AnimatedButton
          title="Choose a Philosopher"
          onPress={onGetStarted}
          variant="primary"
          size="large"
          style={styles.getStartedButton}
          isLoading={isLoading}
          disabled={isLoading}
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
  logoContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    opacity: 0.8,
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
  buttonContainer: {
    paddingHorizontal: 20,
  },
  getStartedButton: {
    borderRadius: 12,
    paddingVertical: 18,
  },
}); 