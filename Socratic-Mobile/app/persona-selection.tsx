import React from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { personas, PersonaUI } from '../src/personas';

const PersonaSelectionScreen: React.FC = () => {
  const router = useRouter();

  const handleSelectPersona = (personaId: string, initialUserMessage?: string) => {
    router.push({
      pathname: '/(tabs)',
      params: { personaId, ...(initialUserMessage ? { initialUserMessage } : {}) },
    });
  };

  const renderPromptSuggestion = (persona: PersonaUI, suggestion: string) => (
    <Pressable
      key={suggestion}
      style={styles.suggestionButton}
      onPress={() => handleSelectPersona(persona.id, suggestion)}
    >
      <Text style={styles.suggestionText}>{suggestion}</Text>
    </Pressable>
  );

  const renderPersonaCard = ({ item }: { item: PersonaUI }) => (
    <View style={styles.card}>
      <Text style={styles.personaName}>{item.name}</Text>
      <Text style={styles.personaDescription}>{item.description}</Text>
      <Text style={styles.sectionTitle}>Try asking:</Text>
      <View style={styles.suggestionsRow}>
        {item.promptSuggestions.map(suggestion => renderPromptSuggestion(item, suggestion))}
      </View>
      <Pressable style={styles.selectButton} onPress={() => handleSelectPersona(item.id)}>
        <Text style={styles.selectButtonText}>Chat as {item.name}</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Choose a Persona</Text>
      <FlatList
        data={personas}
        renderItem={renderPersonaCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 40 },
  header: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  listContent: { paddingHorizontal: 16, paddingBottom: 32 },
  card: { backgroundColor: '#f5f5f5', borderRadius: 12, padding: 20, marginBottom: 24, elevation: 2 },
  personaName: { fontSize: 22, fontWeight: 'bold', marginBottom: 6 },
  personaDescription: { fontSize: 16, color: '#555', marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  suggestionsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  suggestionButton: { backgroundColor: '#e0e7ff', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12, marginRight: 8, marginBottom: 8 },
  suggestionText: { color: '#3730a3', fontSize: 14 },
  selectButton: { backgroundColor: '#6366f1', borderRadius: 8, paddingVertical: 10, marginTop: 8, alignItems: 'center' },
  selectButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default PersonaSelectionScreen; 