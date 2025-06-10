import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Pressable, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { PanGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withDelay,
  interpolate,
  Extrapolate,
  runOnJS,
  interpolateColor,
  withSequence,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { personas } from '@shared/constants/personas';
import { ThemedView } from '@shared/components/ThemedView';
import { ThemedText } from '@shared/components/ThemedText';
import { Colors } from '@shared/constants/Colors';
import { ThemedCard } from '@shared/components/ThemedCard';
import { AnimatedButton } from '@shared/components/AnimatedButton';
import { analyticsService } from '@shared/api/analytics';
import { useAuth } from '@features/auth/AuthContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PERSONA_COUNT = personas.length;

const PersonaSelectionScreen: React.FC = () => {
  const router = useRouter();
  const { isGuest, user, continueAsGuest } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Refs for gesture handlers
  const panGestureRef = useRef<any>();

  // Animated values for swiper
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  // Animation values for entrance effects
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-30);
  const cardScale = useSharedValue(0.8);
  const cardOpacity = useSharedValue(0);



  // Entrance animation on mount
  useEffect(() => {
    headerOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
    headerTranslateY.value = withDelay(200, withSpring(0));
    cardOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
    cardScale.value = withDelay(400, withSpring(1, { damping: 15, stiffness: 100 }));
  }, []);



  // Gesture handler for swipe navigation
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context: any) => {
      context.startX = translateX.value;
    },
    onActive: (event, context) => {
      const newTranslateX = context.startX + event.translationX;
      const maxTranslateX = 0;
      const minTranslateX = -(PERSONA_COUNT - 1) * SCREEN_WIDTH;
      
      translateX.value = Math.max(minTranslateX, Math.min(maxTranslateX, newTranslateX));
      
      // Add subtle scale and opacity effects during swipe
      const progress = Math.abs(event.translationX) / SCREEN_WIDTH;
      scale.value = 1 - progress * 0.03;
      opacity.value = 1 - progress * 0.1;
    },
    onEnd: (event) => {
      const shouldGoToNext = event.translationX < -SCREEN_WIDTH * 0.3 && currentIndex < PERSONA_COUNT - 1;
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

  const handleSelectPersona = async (personaId: string, initialUserMessage?: string) => {
    // If user is not authenticated, automatically continue as guest
    if (!user && !isGuest) {
      console.log('[PERSONA_SELECTION] User not authenticated, setting guest mode before navigation');
      continueAsGuest();
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Track persona selection
    const persona = personas.find(p => p.id === personaId);
    if (persona) {
      await analyticsService.trackPersonaSelection({
        persona_id: personaId,
        persona_name: persona.name,
        selection_method: initialUserMessage ? 'suggestion_prompt' : 'direct_chat',
        suggestion_text: initialUserMessage,
        is_guest_user: !user,
      });
    }
    
    router.push({
      pathname: '/(tabs)',
      params: { personaId, ...(initialUserMessage ? { initialUserMessage } : {}) },
    });
  };

  // Track screen view
  useEffect(() => {
    analyticsService.trackScreenView({
      screen_name: 'persona_selection',
      is_guest_user: isGuest,
    });
  }, [isGuest]);

  // Animated styles
  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const cardContainerStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  // Background gradient animation
  const backgroundStyle = useAnimatedStyle(() => {
    const progress = -translateX.value / SCREEN_WIDTH;
    const backgroundColor = interpolateColor(
      progress,
      Array.from({ length: PERSONA_COUNT }, (_, i) => i),
      [
        Colors.background,
        Colors.tint + '08',
        Colors.background,
        Colors.tint + '05',
        Colors.background,
      ].slice(0, PERSONA_COUNT)
    );
    
    return { backgroundColor };
  });

  return (
    <GestureHandlerRootView style={styles.container}>
      <Animated.View style={[styles.background, backgroundStyle]} />
      
      <Animated.View style={headerStyle}>
        <ThemedText type="title" style={styles.header}>Choose a Philosopher</ThemedText>
      </Animated.View>

      <PanGestureHandler 
        ref={panGestureRef}
        onGestureEvent={gestureHandler}
        activeOffsetX={[-10, 10]}
        failOffsetY={[-50, 50]}
        minPointers={1}
        maxPointers={1}
        shouldCancelWhenOutside={true}
      >
        <Animated.View style={[styles.slidesContainer, containerStyle]}>
          {personas.map((persona, index) => {
            return (
              <Animated.View key={persona.id} style={styles.slide}>
                <SlideWrapper index={index} currentIndex={currentIndex} translateX={translateX}>
                  <Animated.View style={cardContainerStyle}>
                    <ThemedCard style={styles.card} shadowVariant="medium">
                      <PersonaContent
                        persona={persona}
                        onSelectPersona={handleSelectPersona}
                      />
                    </ThemedCard>
                  </Animated.View>
                </SlideWrapper>
              </Animated.View>
            );
          })}
        </Animated.View>
      </PanGestureHandler>

      {/* Modern Progress Indicator */}
      <ModernProgressIndicator 
        currentIndex={currentIndex}
        totalSlides={PERSONA_COUNT}
        translateX={translateX}
      />
    </GestureHandlerRootView>
  );
};

// Slide wrapper with parallax effects
interface SlideWrapperProps {
  children: React.ReactNode;
  index: number;
  currentIndex: number;
  translateX: Animated.SharedValue<number>;
}

const SlideWrapper: React.FC<SlideWrapperProps> = ({ children, index, translateX }) => {
  const slideStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ];
    
    const opacity = interpolate(
      -translateX.value,
      inputRange,
      [0.4, 1, 0.4],
      Extrapolate.CLAMP
    );
    
    const scale = interpolate(
      -translateX.value,
      inputRange,
      [0.85, 1, 0.85],
      Extrapolate.CLAMP
    );
    
    const rotateY = interpolate(
      -translateX.value,
      inputRange,
      [15, 0, -15],
      Extrapolate.CLAMP
    );
    
    return {
      opacity,
      transform: [
        { scale },
        { perspective: 1000 },
        { rotateY: `${rotateY}deg` },
      ],
    };
  });

  return (
    <Animated.View style={[styles.slideContent, slideStyle]}>
      {children}
    </Animated.View>
  );
};

// Suggestion item component to avoid hooks in loops
interface SuggestionItemProps {
  suggestion: string;
  onPress: () => void;
}

const SuggestionItem: React.FC<SuggestionItemProps> = ({ suggestion, onPress }) => {
  return (
    <ThemedView style={styles.suggestionButtonContainer}>
      <AnimatedButton
        title={suggestion}
        onPress={onPress}
        variant="outline"
        size="medium"
        style={styles.suggestionButton}
        textStyle={styles.suggestionText}
      />
    </ThemedView>
  );
};

// Persona content component
interface PersonaContentProps {
  persona: typeof personas[0];
  onSelectPersona: (personaId: string, initialUserMessage?: string) => void;
}

const PersonaContent: React.FC<PersonaContentProps> = ({ 
  persona, 
  onSelectPersona
}) => {
  // Animation values for scroll hint
  const scrollHintOpacity = useSharedValue(1);
  const scrollHintBounce = useSharedValue(0);
  const hasScrolled = useSharedValue(false);

  // Start bouncy animation on mount
  useEffect(() => {
    const startBounceAnimation = () => {
      scrollHintBounce.value = withRepeat(
        withSequence(
          withTiming(8, { duration: 800, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 800, easing: Easing.out(Easing.quad) })
        ),
        -1, // infinite repeat
        false
      );
    };

    const timer = setTimeout(startBounceAnimation, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleScroll = (event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    
    // Hide hint after minimal scroll
    if (scrollY > 10 && !hasScrolled.value) {
      hasScrolled.value = true;
      scrollHintOpacity.value = withTiming(0, { duration: 300 });
    }
  };

  return (
    <>
      <ThemedText type="title" style={styles.personaName}>{persona.name}</ThemedText>
      <ThemedText type="subtitle" style={styles.personaDescription}>{persona.description}</ThemedText>
      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Try asking:</ThemedText>
      
      <ThemedView style={styles.suggestionsContainer}>
        <ScrollView 
          style={styles.suggestionsScrollView}
          contentContainerStyle={styles.suggestionsScrollContent}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          nestedScrollEnabled={true}
        >
          {persona.promptSuggestions.map((suggestion, index) => (
            <SuggestionItem
              key={suggestion}
              suggestion={suggestion}
              onPress={() => onSelectPersona(persona.id, suggestion)}
            />
          ))}
        </ScrollView>
        
                 {persona.promptSuggestions.length > 3 && (
           <Animated.View style={[styles.scrollHint, {
             opacity: scrollHintOpacity,
             transform: [{ translateY: scrollHintBounce }]
           }]}>
             <ThemedText style={styles.scrollIconText}>⌄</ThemedText>
           </Animated.View>
         )}
      </ThemedView>
      
      <AnimatedButton
        title={`Chat as ${persona.name}`}
        onPress={() => onSelectPersona(persona.id)}
        variant="primary"
        size="large"
        style={styles.selectButton}
        textStyle={styles.selectButtonText}
      />
    </>
  );
};

// Modern progress indicator
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

  return (
    <ThemedView style={[styles.progressContainer, { backgroundColor: 'transparent' }]}>
      <ThemedView style={[styles.dotsContainer, { backgroundColor: 'transparent' }]}>
        {Array.from({ length: totalSlides }, (_, index) => {
          const dotStyle = useAnimatedStyle(() => {
            const currentSlide = Math.round(-translateX.value / SCREEN_WIDTH);
            const isActive = index === currentSlide;
            
            return {
              opacity: withTiming(isActive ? 1 : 0.3, { duration: 200 }),
              transform: [
                { scale: withSpring(isActive ? 1.2 : 1, { damping: 15 }) }
              ],
            };
          });
          
          return (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                index === currentIndex && styles.activeDot,
                dotStyle
              ]}
            />
          );
        })}
      </ThemedView>
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
  header: { 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginBottom: 20,
    marginTop: 45,
    paddingHorizontal: 16,
    fontSize: 32,
  },
  slidesContainer: {
    flex: 1,
    flexDirection: 'row',
    width: SCREEN_WIDTH * PERSONA_COUNT,
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  slideContent: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    borderRadius: 20,
    padding: 24,
    minHeight: SCREEN_HEIGHT * 0.6,
    justifyContent: 'center',
    backgroundColor: Colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
  },
  personaName: { 
    marginBottom: 12,
    textAlign: 'center',
    fontSize: 28,
    fontWeight: 'bold',
  },
  personaDescription: { 
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.8,
  },
  sectionTitle: { 
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 18,
    color: Colors.tint,
  },
  suggestionsContainer: {
    height: 280,
    marginBottom: 24,
    position: 'relative',
  },
  suggestionsScrollView: {
    flex: 1,
  },
  suggestionsScrollContent: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 12,
    paddingVertical: 8,
  },
  suggestionButtonContainer: {
    width: '100%',
  },
  suggestionButton: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.tint,
    backgroundColor: Colors.tint + '10',
    paddingVertical: 16,
    paddingHorizontal: 20,
    minHeight: 60,
  },
  suggestionText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
    color: Colors.tint,
  },
  selectButton: {
    borderRadius: 16,
    paddingVertical: 18,
    marginTop: 8,
    backgroundColor: Colors.tint,
  },
  selectButtonText: { 
    fontWeight: 'bold', 
    fontSize: 18,
    color: '#FFFFFF',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'transparent',
  },
  dot: {
    backgroundColor: Colors.tabIconDefault + '50',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    backgroundColor: Colors.tint,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  scrollHint: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    width: 32,
    height: 32,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollIconText: {
    fontSize: 18,
    color: Colors.tabIconDefault,
    fontWeight: 'bold',
  },
});

export default PersonaSelectionScreen; 