import React, { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, ViewStyle, Dimensions, Animated, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Swiper from 'react-native-swiper';
import { personas, PersonaUI } from '@shared/constants/personas';
import { ThemedView } from '@shared/components/ThemedView';
import { ThemedText } from '@shared/components/ThemedText';
import { Colors } from '@shared/constants/Colors';
import { ThemedCard } from '@shared/components/ThemedCard';
import { ThemedButton } from '@shared/components/ThemedButton';
import { analyticsService } from '@shared/api/analytics';
import { useAuth } from '@features/auth/AuthContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const PersonaSelectionScreen: React.FC = () => {
  const router = useRouter();
  const { isGuest, user, continueAsGuest } = useAuth();
  const animatedValues = useRef<{ [key: string]: Animated.Value[] }>({});
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const scrollHintOpacity = useRef<{ [key: string]: Animated.Value }>({});

  // Themed colors
  const cardBackground = Colors.background;
  const cardBorder = Colors.tabIconDefault;
  const suggestionBg = '#e8eaf6';
  const suggestionText = '#3730a3';
  const selectButtonBg = '#6366f1';
  const selectButtonText = '#fff';

  // Set the standard action color for all primary buttons on this screen
  const primaryActionColor = selectButtonBg;
  const primaryActionTextColor = selectButtonText;

  const handleSelectPersona = async (personaId: string, initialUserMessage?: string) => {
    // If user is not authenticated, automatically continue as guest
    if (!user && !isGuest) {
      console.log('[PERSONA_SELECTION] User not authenticated, setting guest mode before navigation');
      continueAsGuest();
      // Small delay to ensure auth state is updated before navigation
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
        is_guest_user: !user, // Will be true after continueAsGuest() is called
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

  // Initialize animated values for each persona
  const initializeAnimations = (personaId: string, suggestionCount: number) => {
    if (!animatedValues.current[personaId]) {
      animatedValues.current[personaId] = Array(suggestionCount).fill(0).map(() => new Animated.Value(0));
    }
  };

  // Animate suggestions appearing one by one
  const animateSuggestions = (personaId: string) => {
    const animations = animatedValues.current[personaId];
    if (animations) {
      const staggeredAnimations = animations.map((anim, index) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 400,
          delay: index * 200, // 200ms delay between each button
          useNativeDriver: true,
        })
      );
      
      Animated.stagger(100, staggeredAnimations).start();
    }
  };

  // Initialize scroll hint opacity for each persona
  const initializeScrollHint = (personaId: string) => {
    if (!scrollHintOpacity.current[personaId]) {
      scrollHintOpacity.current[personaId] = new Animated.Value(1);
    }
  };

  // Hide scroll hint when user scrolls
  const handleScroll = (personaId: string) => {
    const hintOpacity = scrollHintOpacity.current[personaId];
    if (hintOpacity) {
      Animated.timing(hintOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.header}>Choose a Philosopher</ThemedText>
      <Swiper
        style={styles.wrapper}
        showsButtons={false}
        showsPagination={true}
        dot={<ThemedView style={styles.dot} />}
        activeDot={<ThemedView style={[styles.dot, styles.activeDot]} />}
        paginationStyle={styles.pagination}
        loop={false}
        index={0}
      >
        {personas.map((persona) => (
          <ThemedView key={persona.id} style={styles.slideContainer}>
            <ThemedCard
              style={styles.card}
              shadowVariant="medium"
            >
              <ThemedText type="title" style={styles.personaName}>{persona.name}</ThemedText>
              <ThemedText type="subtitle" style={styles.personaDescription}>{persona.description}</ThemedText>
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Try asking:</ThemedText>
              <ThemedView style={styles.suggestionsContainer}>
                <ScrollView 
                  style={styles.suggestionsScrollView}
                  contentContainerStyle={styles.suggestionsScrollContent}
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled={true}
                  onScroll={() => handleScroll(persona.id)}
                  scrollEventThrottle={16}
                >
                  {persona.promptSuggestions.map((suggestion, index) => {
                    // Initialize animations for this persona
                    initializeAnimations(persona.id, persona.promptSuggestions.length);
                    
                    // Start animation after a short delay
                    setTimeout(() => animateSuggestions(persona.id), 300);
                    
                    const animatedValue = animatedValues.current[persona.id]?.[index] || new Animated.Value(0);
                    
                    return (
                      <Animated.View 
                        key={suggestion} 
                        style={[
                          styles.suggestionButtonContainer,
                          {
                            opacity: animatedValue,
                            transform: [{
                              translateY: animatedValue.interpolate({
                                inputRange: [0, 1],
                                outputRange: [30, 0],
                              })
                            }]
                          }
                        ]}
                      >
                        <ThemedButton
                          title={suggestion}
                          onPress={() => handleSelectPersona(persona.id, suggestion)}
                          variant="outline"
                          size="medium"
                          style={{
                            ...styles.suggestionButton,
                            backgroundColor: suggestionBg,
                            borderColor: primaryActionColor,
                          }}
                          textStyle={{
                            ...styles.suggestionText,
                            color: primaryActionColor,
                          }}
                        />
                      </Animated.View>
                    );
                  })}
                </ScrollView>
                {persona.promptSuggestions.length > 3 && (() => {
                  // Initialize scroll hint opacity for this persona
                  initializeScrollHint(persona.id);
                  const hintOpacity = scrollHintOpacity.current[persona.id] || new Animated.Value(1);
                  
                  return (
                    <Animated.View style={[styles.scrollHint, { 
                      opacity: hintOpacity,
                      transform: [{ translateY: bounceAnim }] 
                    }]}>
                      <ThemedText style={styles.scrollIconText}>⌄</ThemedText>
                    </Animated.View>
                  );
                })()}
              </ThemedView>
              <ThemedButton
                title={`Chat as ${persona.name}`}
                onPress={() => handleSelectPersona(persona.id)}
                variant="primary"
                size="large"
                style={{
                  ...styles.selectButton,
                  backgroundColor: primaryActionColor,
                }}
                textStyle={{
                  ...styles.selectButtonText,
                  color: primaryActionTextColor,
                }}
              />
            </ThemedCard>
          </ThemedView>
        ))}
      </Swiper>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingTop: 40 
  },
  header: { 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  wrapper: {},
  slideContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  card: {
    borderRadius: 12,
    padding: 24,
    minHeight: screenHeight * 0.6,
    justifyContent: 'space-between',
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
  },
  sectionTitle: { 
    marginBottom: 12,
    textAlign: 'center',
    fontSize: 18,
  },
  suggestionsContainer: {
    height: 280, // Fixed height for unified size across personas
    marginBottom: 24,
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
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    height: 'auto',
    minHeight: 60,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  suggestionText: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    flexWrap: 'wrap',
    lineHeight: 24,
    fontFamily: 'Lora-SemiBold',
  },
  selectButton: {
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 20,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  selectButtonText: { 
    fontWeight: 'bold', 
    fontSize: 18,
  },
  pagination: {
    bottom: 30,
  },
  dot: {
    backgroundColor: Colors.tabIconDefault,
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
    marginTop: 3,
    marginBottom: 3,
  },
  activeDot: {
    backgroundColor: '#6366f1',
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

export default PersonaSelectionScreen; 