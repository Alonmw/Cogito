import React from 'react';
import { FlatList, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { personas, PersonaUI } from '@/src/constants/personas';
import { ThemedView } from '@/src/components/ThemedView';
import { ThemedText } from '@/src/components/ThemedText';
import { useThemeColor } from '@/src/hooks/useThemeColor';
import { ThemedCard } from '@/src/components/ThemedCard';
import { ThemedButton } from '@/src/components/ThemedButton';

const PersonaSelectionScreen: React.FC = () => {
  const router = useRouter();
  const [selectedPersonaId, setSelectedPersonaId] = React.useState<string | null>(null);

  // Themed colors
  const cardBackground = useThemeColor({}, 'background');
  const cardBorder = useThemeColor({}, 'tabIconDefault');
  const suggestionBg = useThemeColor({ light: '#e8eaf6', dark: '#1a237e' }, 'background');
  const suggestionText = useThemeColor({ light: '#3730a3', dark: '#a5b4fc' }, 'text');
  const selectButtonBg = useThemeColor({ light: '#6366f1', dark: '#3730a3' }, 'tint');
  const selectButtonText = useThemeColor({ light: '#fff', dark: '#fff' }, 'tint');

  // Set the standard action color for all primary buttons on this screen
  const primaryActionColor = selectButtonBg;
  const primaryActionTextColor = selectButtonText;

  const handleSelectPersona = (personaId: string, initialUserMessage?: string) => {
    setSelectedPersonaId(personaId);
    router.push({
      pathname: '/(tabs)',
      params: { personaId, ...(initialUserMessage ? { initialUserMessage } : {}) },
    });
  };

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

  const renderPersonaCard = ({ item }: { item: PersonaUI }) => {
    const isSelected = selectedPersonaId === item.id;
    const cardStyle = StyleSheet.flatten([
      styles.card,
      isSelected ? { borderColor: primaryActionColor, borderWidth: 2, backgroundColor: '#f7f3e8' } : undefined,
    ]);
    return (
      <ThemedCard
        style={cardStyle}
        onPress={() => { setSelectedPersonaId(item.id); }}
        shadowVariant="medium"
      >
        <ThemedText type="title" style={styles.personaName}>{item.name}</ThemedText>
        <ThemedText type="subtitle" style={styles.personaDescription}>{item.description}</ThemedText>
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Try asking:</ThemedText>
        <ThemedView style={styles.suggestionsRow}>
          {item.promptSuggestions.map(suggestion => renderPromptSuggestion(item, suggestion))}
        </ThemedView>
        <ThemedButton
          title={`Chat as ${item.name}`}
          onPress={() => handleSelectPersona(item.id)}
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
        {isSelected && (
          <ThemedText style={styles.selectedLabel} accessibilityLabel="Selected persona">Selected</ThemedText>
        )}
      </ThemedCard>
    );
  };

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
  },
  personaName: { marginBottom: 6 },
  personaDescription: { marginBottom: 12 },
  sectionTitle: { marginBottom: 6 },
  suggestionsRow: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    marginHorizontal: -4,
    marginBottom: 12 
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
    paddingVertical: 8,
    paddingHorizontal: 10,
    height: 'auto',
    minHeight: 44,
    width: '100%',
  },
  suggestionText: {
    fontSize: 14,
    textAlign: 'center',
    flexWrap: 'wrap',
    lineHeight: 18,
  },
  selectButton: {
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 8,
    alignItems: 'center',
  },
  selectButtonText: { fontWeight: 'bold', fontSize: 16 },
  selectedLabel: {
    marginTop: 8,
    color: '#0a7ea4',
    fontWeight: 'bold',
    textAlign: 'right',
    fontSize: 13,
  },
});

export default PersonaSelectionScreen; 