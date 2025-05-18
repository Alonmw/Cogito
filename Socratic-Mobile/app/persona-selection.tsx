import React from 'react';
import { FlatList, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { personas, PersonaUI } from '../src/personas';
import { ThemedView } from '@/src/components/ThemedView';
import { ThemedText } from '@/src/components/ThemedText';
import { useThemeColor } from '@/src/hooks/useThemeColor';

const PersonaSelectionScreen: React.FC = () => {
  const router = useRouter();

  // Themed colors
  const cardBackground = useThemeColor({}, 'background');
  const cardBorder = useThemeColor({}, 'tabIconDefault');
  const suggestionBg = useThemeColor({ light: '#e0e7ff', dark: '#23264d' }, 'background');
  const suggestionText = useThemeColor({ light: '#3730a3', dark: '#a5b4fc' }, 'text');
  const selectButtonBg = useThemeColor({ light: '#6366f1', dark: '#3730a3' }, 'tint');
  const selectButtonText = useThemeColor({ light: '#fff', dark: '#fff' }, 'tint');

  const handleSelectPersona = (personaId: string, initialUserMessage?: string) => {
    router.push({
      pathname: '/(tabs)',
      params: { personaId, ...(initialUserMessage ? { initialUserMessage } : {}) },
    });
  };

  const renderPromptSuggestion = (persona: PersonaUI, suggestion: string) => (
    <Pressable
      key={suggestion}
      style={({ pressed }) => [
        styles.suggestionButton,
        { backgroundColor: suggestionBg },
        pressed && { opacity: 0.7 },
      ]}
      android_ripple={{ color: selectButtonBg }}
      onPress={() => handleSelectPersona(persona.id, suggestion)}
    >
      <ThemedText style={[styles.suggestionText, { color: suggestionText }]}>{suggestion}</ThemedText>
    </Pressable>
  );

  const renderPersonaCard = ({ item }: { item: PersonaUI }) => (
    <ThemedView style={[styles.card, { backgroundColor: cardBackground, borderColor: cardBorder }]}>
      <ThemedText type="title" style={styles.personaName}>{item.name}</ThemedText>
      <ThemedText type="subtitle" style={styles.personaDescription}>{item.description}</ThemedText>
      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Try asking:</ThemedText>
      <ThemedView style={styles.suggestionsRow}>
        {item.promptSuggestions.map(suggestion => renderPromptSuggestion(item, suggestion))}
      </ThemedView>
      <Pressable
        style={({ pressed }) => [
          styles.selectButton,
          { backgroundColor: selectButtonBg },
          pressed && { opacity: 0.85 },
        ]}
        android_ripple={{ color: suggestionBg }}
        onPress={() => handleSelectPersona(item.id)}
      >
        <ThemedText style={[styles.selectButtonText, { color: selectButtonText }]}>Chat as {item.name}</ThemedText>
      </Pressable>
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.header}>Choose a Persona</ThemedText>
      <FlatList
        data={personas}
        renderItem={renderPersonaCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40 },
  header: { fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  listContent: { paddingHorizontal: 16, paddingBottom: 32 },
  card: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: StyleSheet.hairlineWidth,
    // subtle shadow for iOS, elevation for Android
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  personaName: { marginBottom: 6 },
  personaDescription: { marginBottom: 12 },
  sectionTitle: { marginBottom: 6 },
  suggestionsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  suggestionButton: {
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  suggestionText: { fontSize: 14 },
  selectButton: {
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 8,
    alignItems: 'center',
  },
  selectButtonText: { fontWeight: 'bold', fontSize: 16 },
});

export default PersonaSelectionScreen; 