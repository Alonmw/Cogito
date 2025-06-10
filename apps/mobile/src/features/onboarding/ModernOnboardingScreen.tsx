import React, { useState, useCallback } from 'react';
import { StyleSheet, Dimensions, StatusBar } from 'react-native';
import { PanGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
  runOnJS,
  interpolateColor,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { ThemedView } from '@shared/components/ThemedView';
import { ThemedText } from '@shared/components/ThemedText';
import { Colors } from '@shared/constants/Colors';
import { markIntroductionCompleted, saveSelectedTopics, debugOnboardingStorage } from '@shared/utils/onboardingUtils';

// Import your slides
import EnhancedWelcomeSlide from '@features/onboarding/slides/EnhancedWelcomeSlide';
import EnhancedPurposeSlide from '@features/onboarding/slides/EnhancedPurposeSlide';
import EnhancedPersonalizationSlide from '@features/onboarding/slides/EnhancedPersonalizationSlide';
import EnhancedAccountSlide from '@features/onboarding/slides/EnhancedAccountSlide';
import EnhancedGetStartedSlide from '@features/onboarding/slides/EnhancedGetStartedSlide';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDE_COUNT = 5;

const slides = [
  { component: EnhancedWelcomeSlide, key: 'welcome' },
  { component: EnhancedPurposeSlide, key: 'purpose' },
  { component: EnhancedPersonalizationSlide, key: 'personalization' },
  { component: EnhancedAccountSlide, key: 'account' },
  { component: EnhancedGetStartedSlide, key: 'getStarted' },
];

interface ModernOnboardingScreenProps {}

export default function ModernOnboardingScreen({}: ModernOnboardingScreenProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [isCompleting, setIsCompleting] = useState(false);

  // Debug: Log storage state when component mounts
  React.useEffect(() => {
    debugOnboardingStorage();
  }, []);

  // Animated values
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  // Gesture handler for swipe navigation
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context: any) => {
      context.startX = translateX.value;
    },
    onActive: (event, context) => {
      const newTranslateX = context.startX + event.translationX;
      const maxTranslateX = 0;
      const minTranslateX = -(SLIDE_COUNT - 1) * SCREEN_WIDTH;
      
      translateX.value = Math.max(minTranslateX, Math.min(maxTranslateX, newTranslateX));
      
      // Add subtle scale and opacity effects during swipe
      const progress = Math.abs(event.translationX) / SCREEN_WIDTH;
      scale.value = 1 - progress * 0.05;
      opacity.value = 1 - progress * 0.1;
    },
    onEnd: (event) => {
      const shouldGoToNext = event.translationX < -SCREEN_WIDTH * 0.3 && currentIndex < SLIDE_COUNT - 1;
      const shouldGoToPrev = event.translationX > SCREEN_WIDTH * 0.3 && currentIndex > 0;
      
      let targetIndex = currentIndex;
      
      if (shouldGoToNext) {
        targetIndex = currentIndex + 1;
      } else if (shouldGoToPrev) {
        targetIndex = currentIndex - 1;
      }
      
      // Smooth spring animation
      translateX.value = withSpring(-targetIndex * SCREEN_WIDTH, {
        damping: 20,
        stiffness: 90,
      });
      
      scale.value = withSpring(1);
      opacity.value = withSpring(1);
      
      if (targetIndex !== currentIndex) {
        runOnJS(setCurrentIndex)(targetIndex);
      }
    },
  });

  // Programmatic navigation functions
  const goToNext = useCallback(() => {
    if (currentIndex < SLIDE_COUNT - 1) {
      const nextIndex = currentIndex + 1;
      translateX.value = withSpring(-nextIndex * SCREEN_WIDTH, {
        damping: 20,
        stiffness: 90,
      });
      setCurrentIndex(nextIndex);
    }
  }, [currentIndex, translateX]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      translateX.value = withSpring(-prevIndex * SCREEN_WIDTH, {
        damping: 20,
        stiffness: 90,
      });
      setCurrentIndex(prevIndex);
    }
  }, [currentIndex, translateX]);

  // Handle topics selection
  const handleTopicsSelected = async (topics: string[]) => {
    setSelectedTopics(topics);
    await saveSelectedTopics(topics);
  };

  // Handle onboarding completion
  const handleIntroductionComplete = async () => {
    if (isCompleting) return;
    
    try {
      setIsCompleting(true);
      console.log('[ONBOARDING] Starting completion process...');
      
      await markIntroductionCompleted();
      console.log('[ONBOARDING] markIntroductionCompleted() finished');
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('[ONBOARDING] Navigating to persona selection...');
      router.replace('/persona-selection');
    } catch (error) {
      console.error('Error marking introduction as complete:', error);
      router.replace('/persona-selection');
    } finally {
      setIsCompleting(false);
    }
  };

  // Animated styles
  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  // Background gradient animation based on current slide
  const backgroundStyle = useAnimatedStyle(() => {
    const progress = -translateX.value / SCREEN_WIDTH;
    const backgroundColor = interpolateColor(
      progress,
      [0, 1, 2, 3, 4],
      [
        Colors.background,
        Colors.background,
        Colors.tint + '10',
        Colors.background,
        Colors.tint + '05',
      ]
    );
    
    return { backgroundColor };
  });

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Animated.View style={[styles.background, backgroundStyle]} />
      
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.slidesContainer, containerStyle]}>
          {slides.map((slide, index) => (
            <Animated.View key={slide.key} style={styles.slide}>
              <SlideWrapper
                index={index}
                currentIndex={currentIndex}
                translateX={translateX}
              >
                {(() => {
                  const Component = slide.component as any;
                  switch (slide.key) {
                    case 'welcome':
                      return <Component onNext={goToNext} />;
                    case 'purpose':
                      return <Component onNext={goToNext} />;
                    case 'personalization':
                      return <Component onNext={goToNext} onSkip={goToNext} onTopicsSelected={handleTopicsSelected} />;
                    case 'account':
                      return <Component onAccountCreated={goToNext} onSkip={goToNext} />;
                    case 'getStarted':
                      return <Component onGetStarted={handleIntroductionComplete} isLoading={isCompleting} />;
                    default:
                      return null;
                  }
                })()}
              </SlideWrapper>
            </Animated.View>
          ))}
        </Animated.View>
      </PanGestureHandler>

      {/* Modern Progress Indicator */}
      <ModernProgressIndicator 
        currentIndex={currentIndex}
        totalSlides={SLIDE_COUNT}
        translateX={translateX}
      />
    </GestureHandlerRootView>
  );
}

// Slide wrapper with entrance animations
interface SlideWrapperProps {
  children: React.ReactNode;
  index: number;
  currentIndex: number;
  translateX: Animated.SharedValue<number>;
}

const SlideWrapper: React.FC<SlideWrapperProps> = ({ children, index, currentIndex, translateX }) => {
  const slideStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ];
    
    const opacity = interpolate(
      -translateX.value,
      inputRange,
      [0.3, 1, 0.3],
      Extrapolate.CLAMP
    );
    
    const scale = interpolate(
      -translateX.value,
      inputRange,
      [0.8, 1, 0.8],
      Extrapolate.CLAMP
    );
    
    return {
      opacity,
      transform: [{ scale }],
    };
  });

  return (
    <Animated.View style={[styles.slideContent, slideStyle]}>
      {children}
    </Animated.View>
  );
};

// Modern progress indicator with smooth animations
interface ModernProgressIndicatorProps {
  currentIndex: number;
  totalSlides: number;
  translateX: Animated.SharedValue<number>;
}

const ModernProgressIndicator: React.FC<ModernProgressIndicatorProps> = ({ 
  currentIndex, 
  totalSlides, 
  translateX 
}) => {
  const progressStyle = useAnimatedStyle(() => {
    const progress = (-translateX.value / SCREEN_WIDTH) / (totalSlides - 1);
    const width = interpolate(progress, [0, 1], [20, 200], Extrapolate.CLAMP);
    
    return {
      width: withTiming(width, { duration: 300 }),
    };
  });

  return (
    <ThemedView style={styles.progressContainer}>
      <ThemedView style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, progressStyle]} />
      </ThemedView>
      <ThemedText style={styles.progressText}>
        {currentIndex + 1} of {totalSlides}
      </ThemedText>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  slidesContainer: {
    flex: 1,
    flexDirection: 'row',
    width: SCREEN_WIDTH * SLIDE_COUNT,
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
  slideContent: {
    flex: 1,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 60,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  progressTrack: {
    width: 200,
    height: 4,
    backgroundColor: Colors.tabIconDefault + '30',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: 4,
    backgroundColor: Colors.tint,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    opacity: 0.7,
  },
}); 