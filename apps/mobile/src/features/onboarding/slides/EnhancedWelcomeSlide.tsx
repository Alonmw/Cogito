import React, { useEffect } from 'react';
import { StyleSheet, Image } from 'react-native';
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

interface EnhancedWelcomeSlideProps {
  onNext: () => void;
}

export default function EnhancedWelcomeSlide({ onNext }: EnhancedWelcomeSlideProps) {
  // Animation values
  const logoScale = useSharedValue(0);
  const logoRotation = useSharedValue(-180);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(30);
  const subtitleOpacity = useSharedValue(0);
  const subtitleTranslateY = useSharedValue(30);
  const buttonScale = useSharedValue(0);

  useEffect(() => {
    // Orchestrated entrance animation
    logoScale.value = withSpring(1, { damping: 15, stiffness: 150 });
    logoRotation.value = withSpring(0, { damping: 20, stiffness: 100 });
    
    titleOpacity.value = withDelay(300, withTiming(1, { duration: 600 }));
    titleTranslateY.value = withDelay(300, withSpring(0));
    
    subtitleOpacity.value = withDelay(600, withTiming(1, { duration: 600 }));
    subtitleTranslateY.value = withDelay(600, withSpring(0));
    
    buttonScale.value = withDelay(900, withSpring(1, { damping: 15, stiffness: 150 }));
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
        
        <ThemedCard style={styles.textCard}>
          <Animated.View style={titleStyle}>
            <ThemedText style={styles.title} type="title">
              Welcome, Explorer!
            </ThemedText>
          </Animated.View>
          
          <Animated.View style={subtitleStyle}>
            <ThemedText style={styles.subtitle} type="default">
              Thank you for joining! You're about to chat with 
              some of history's most fascinating thinkers – from ancient Greeks to modern rebels.
            </ThemedText>
          </Animated.View>
        </ThemedCard>
      </ThemedView>
      
      <Animated.View style={[styles.buttonContainer, buttonStyle]}>
        <AnimatedButton
          title="Let's Begin"
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
    paddingTop: 60,
    paddingBottom: 120,
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
    width: 120,
    height: 120,
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
    fontFamily: 'Lora-SemiBold',
  },
  buttonContainer: {
    paddingHorizontal: 20,
  },
  nextButton: {
    borderRadius: 12,
    paddingVertical: 16,
  },
}); 