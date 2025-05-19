// app/(tabs)/history.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, RefreshControl, Platform, Alert } from 'react-native';
import { useAuth } from '@/src/context/AuthContext';
import apiClientInstance from '@/src/services/api';
import { ConversationSummary } from '@socratic/common-types';
import { Colors } from '@/src/constants/Colors';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { personas, PersonaUI } from '@/src/personas';
import { ThemedCard } from '@/src/components/ThemedCard';
import { ThemedView } from '@/src/components/ThemedView';
import { ThemedText } from '@/src/components/ThemedText';
import { ThemedButton } from '@/src/components/ThemedButton';
import { spacing, shadows } from '@/src/constants/spacingAndShadows';

export default function HistoryScreen() {
  const { user, isGuest, exitGuestMode } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const router = useRouter();

  const [history, setHistory] = useState<ConversationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!user || isGuest) {
      setHistory([]);
      setError("Please log in to view your conversation history.");
      setRefreshing(false);
      return;
    }
    // This guard prevents re-entry if already loading and not a manual refresh
    if (isLoading && !refreshing) {
        console.log("[HistoryScreen] Fetch skipped, already loading and not a refresh.");
        return;
    }

    console.log("[HistoryScreen] Fetching conversation history...");
    setIsLoading(true);
    if (!refreshing) setError(null); // Clear previous error only if not a refresh action

    try {
      const fetchedHistory = await apiClientInstance.getHistoryList();
      if (fetchedHistory && Array.isArray(fetchedHistory)) {
        setHistory(fetchedHistory);
        if (fetchedHistory.length === 0 && !error) {
            setError(null); // Clear error if successfully fetched empty history
        }
      } else {
        console.warn("[HistoryScreen] getHistoryList returned null or invalid format.");
        setError("Failed to load history.");
        setHistory([]); // Ensure history is an empty array on failure
      }
    } catch (err: any) {
      console.error("[HistoryScreen] Error fetching history:", err);
      if (err.response?.status === 403) {
          setError(err.response?.data?.error || "Email verification required to access history.");
      } else {
          setError("An error occurred while fetching your history.");
      }
      setHistory([]); // Ensure history is an empty array on error
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  // --- Removed isLoading from dependency array ---
  }, [user, isGuest, refreshing]); // Only user, isGuest, and refreshing should cause re-creation of fetchHistory
  // --- End Change ---

  useFocusEffect(
    useCallback(() => {
      // The fetchHistory function itself now contains the isLoading guard.
      console.log("[HistoryScreen] Focus effect triggered. Calling fetchHistory.");
      fetchHistory();
      setIsEditMode(false); // Reset edit mode when screen comes into focus
    }, [fetchHistory]) // fetchHistory will only change if user, isGuest, or refreshing changes
  );

  const onRefresh = useCallback(() => {
    console.log("[HistoryScreen] Refresh triggered");
    setRefreshing(true); // This will cause fetchHistory to re-run
  }, []);

  const handlePressConversation = (conversationId: number, title: string, personaId: string) => {
    if (isEditMode) return;
    console.log(`[HistoryScreen] Navigating to conversation ID: ${conversationId}`);
    router.push({
      pathname: '/(tabs)',
      params: { conversationId: conversationId.toString(), conversationTitle: title, personaId },
    });
  };

  const handleGuestGoToLogin = () => {
      console.log("[HistoryScreen] Guest navigating to login, calling exitGuestMode.");
      exitGuestMode();
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  const handleDeleteConversation = useCallback(async (conversationId: number) => {
    Alert.alert(
      "Delete Conversation",
      "Are you sure you want to permanently delete this conversation?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            console.log(`[HistoryScreen] Deleting conversation ID: ${conversationId}`);
            try {
              const success = await apiClientInstance.deleteConversation(conversationId);
              if (success) {
                setHistory((prevHistory) => {
                    const updatedHistory = prevHistory.filter(conv => conv.id !== conversationId);
                    if (updatedHistory.length === 0) {
                        setIsEditMode(false);
                    }
                    return updatedHistory;
                });
                Alert.alert("Success", "Conversation deleted.");
              } else {
                Alert.alert("Error", "Failed to delete conversation. Please try again.");
              }
            } catch (error: any) {
              console.error("[HistoryScreen] Error deleting conversation:", error);
              Alert.alert("Error", error.response?.data?.error || "An error occurred while deleting.");
            }
          },
        },
      ]
    );
  }, [history]);

  const renderHistoryItem = ({ item }: { item: ConversationSummary }) => {
    const personaDetail = personas.find(p => p.id === item.persona_id);
    const personaDisplayName = personaDetail?.name || item.persona_id;
    return (
      <Pressable
        onPress={() => handlePressConversation(item.id, item.title, item.persona_id)}
        onLongPress={toggleEditMode}
        accessibilityLabel={`Conversation: ${item.title || 'Untitled Conversation'}`}
        style={({ pressed }) => [
          {
            marginVertical: spacing.s / 2,
            backgroundColor: pressed && !isEditMode ? '#e7dbc2' : '#F5E9D7',
            borderRadius: 12,
            ...shadows.low,
            padding: spacing.m,
            flexDirection: 'row',
            alignItems: 'center',
          },
        ]}
      >
        <ThemedText type="defaultSemiBold" style={{ marginBottom: 2, flex: 1 }}>{item.title || "Untitled Conversation"}</ThemedText>
        <ThemedText style={{ color: themeColors.tabIconDefault, fontStyle: 'italic', fontSize: 13, flex: 1 }}>Chat with: {personaDisplayName}</ThemedText>
        <ThemedText style={{ color: themeColors.tabIconDefault, fontSize: 12, marginTop: 2, flex: 1 }}>Last updated: {new Date(item.updated_at).toLocaleDateString()} {new Date(item.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</ThemedText>
        {isEditMode ? (
          <Pressable onPress={() => handleDeleteConversation(item.id)} style={{ padding: 8, marginLeft: 10 }} accessibilityLabel="Delete conversation">
            <Ionicons name="trash-bin-outline" size={24} color={themeColors.tint} />
          </Pressable>
        ) : (
          <Ionicons name="chevron-forward-outline" size={22} color={themeColors.tabIconDefault} />
        )}
      </Pressable>
    );
  };

  if (isLoading && history.length === 0 && !refreshing && !error) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: themeColors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={themeColors.tint} />
        <ThemedText style={{ color: themeColors.text, marginTop: spacing.m }}>Loading history...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: '#FAF3E0' }]}>
      <ThemedView style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.m,
        paddingTop: Platform.OS === 'android' ? 25 : 15,
        paddingBottom: 15,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: themeColors.tabIconDefault,
      }}>
        <ThemedView style={{ width: 60 }} />
        <ThemedText type="title" style={{ fontSize: 20, textAlign: 'center' }}>Conversation History</ThemedText>
        {(history.length > 0 || isEditMode) && user && !isGuest ? (
          <Pressable onPress={toggleEditMode} style={{ paddingVertical: 5, paddingHorizontal: 10, minWidth: 60, alignItems: 'flex-end' }}>
            <ThemedText style={{ color: themeColors.tint, fontWeight: '500', fontSize: 16 }}>{isEditMode ? "Done" : "Edit"}</ThemedText>
          </Pressable>
        ) : (
          <ThemedView style={{ width: 60 }} />
        )}
      </ThemedView>

      {error && !isLoading ? (
        <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <ThemedText style={{ color: themeColors.text, opacity: 0.7, fontSize: 16, textAlign: 'center' }}>{error}</ThemedText>
          {(!user || isGuest) ? (
            <ThemedButton title="Go to Login" onPress={handleGuestGoToLogin} variant="outline" style={{ marginTop: 20 }} />
          ) : null}
        </ThemedView>
      ) : null}

      {!error && history.length === 0 && !isLoading ? (
         <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <ThemedText style={{ color: themeColors.text, opacity: 0.7, fontSize: 16, textAlign: 'center' }}>No conversation history found.</ThemedText>
         </ThemedView>
      ) : null}

      {history.length > 0 ? (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderHistoryItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={themeColors.tint} colors={[themeColors.tint]} progressBackgroundColor={'#FAF3E0'} />
          }
          contentContainerStyle={{ paddingHorizontal: spacing.m, paddingVertical: spacing.s, backgroundColor: '#FAF3E0' }}
        />
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'android' ? 25 : 15,
    paddingBottom: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerSidePlaceholder: {
    width: 60,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  editButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    minWidth: 60,
    alignItems: 'flex-end',
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  listContentContainer: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginVertical: 6,
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1.5,
    elevation: 2,
  },
  itemTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  itemPersona: {
    fontSize: 12,
    marginTop: 3,
  },
  itemDate: {
    fontSize: 13,
    opacity: 0.8,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 10,
  },
  centeredMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  loginButton: {
      marginTop: 20,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
      borderWidth: 1,
  },
  loginButtonText: {
      fontSize: 16,
      fontWeight: '600',
  }
});
