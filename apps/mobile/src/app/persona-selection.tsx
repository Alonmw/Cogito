import React, { useEffect } from 'react';
import { Pressable, StyleSheet, ViewStyle, Dimensions } from 'react-native';
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

  const renderPromptSuggestion = (persona: PersonaUI, suggestion: string) => (
    <ThemedView style={styles.suggestionButtonContainer} key={suggestion}>
      <ThemedButton
        title={suggestion}
        onPress={() => handleSelectPersona(persona.id, suggestion)}
        variant="outline"
        size="small"
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
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.header}>Choose a Persona</ThemedText>
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
              <ThemedView style={styles.suggestionsRow}>
                {persona.promptSuggestions.map(suggestion => renderPromptSuggestion(persona, suggestion))}
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
  suggestionsRow: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'center',
    marginHorizontal: -4,
    marginBottom: 24,
  },
  suggestionButtonContainer: {
    margin: 4,
    maxWidth: '47%',
    minWidth: '47%',
  },
  suggestionButton: {
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    height: 'auto',
    minHeight: 48,
    width: '100%',
  },
  suggestionText: {
    fontSize: 14,
    textAlign: 'center',
    flexWrap: 'wrap',
    lineHeight: 18,
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
});

export default PersonaSelectionScreen; 