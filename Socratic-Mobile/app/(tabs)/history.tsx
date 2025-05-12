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

  const handlePressConversation = (conversationId: number, title: string) => {
    if (isEditMode) return;
    console.log(`[HistoryScreen] Navigating to conversation ID: ${conversationId}`);
    router.push({
      pathname: '/(tabs)',
      params: { conversationId: conversationId.toString(), conversationTitle: title },
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

  const renderHistoryItem = ({ item }: { item: ConversationSummary }) => (
    <Pressable
      style={({ pressed }) => [
        styles.itemContainer,
        {
          backgroundColor: colorScheme === 'light' ? '#FFFFFF' : themeColors.background,
          borderColor: themeColors.tabIconDefault,
        },
        pressed && !isEditMode && { backgroundColor: colorScheme === 'light' ? '#f0f0f0' : '#333333' }
      ]}
      onPress={() => handlePressConversation(item.id, item.title)}
    >
      <View style={styles.itemTextContainer}>
        <Text style={[styles.itemTitle, { color: themeColors.text }]} numberOfLines={2} ellipsizeMode="tail">
          {item.title || "Untitled Conversation"}
        </Text>
        <Text style={[styles.itemDate, { color: themeColors.tabIconDefault }]}>
          Last updated: {new Date(item.updated_at).toLocaleDateString()} {new Date(item.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
      {isEditMode ? (
        <Pressable onPress={() => handleDeleteConversation(item.id)} style={styles.deleteButton}>
          <Ionicons name="trash-bin-outline" size={24} color={Colors.light.tint} />
        </Pressable>
      ) : (
        <Ionicons name="chevron-forward-outline" size={22} color={themeColors.tabIconDefault} />
      )}
    </Pressable>
  );


  if (isLoading && history.length === 0 && !refreshing && !error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={themeColors.tint} />
        <Text style={{ color: themeColors.text, marginTop: 10 }}>Loading history...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.headerContainer}>
        <View style={styles.headerSidePlaceholder} />
        <Text style={[styles.title, { color: themeColors.text }]}>Conversation History</Text>
        {(history.length > 0 || isEditMode) && user && !isGuest ? (
            <Pressable onPress={toggleEditMode} style={styles.editButton}>
                <Text style={[styles.editButtonText, { color: themeColors.tint }]}>
                    {isEditMode ? "Done" : "Edit"}
                </Text>
            </Pressable>
        ) : (
            <View style={styles.headerSidePlaceholder} />
        )}
      </View>

      {error && !isLoading ? (
        <View style={styles.centeredMessageContainer}>
          <Text style={[styles.errorText, { color: themeColors.text, opacity: 0.7 }]}>{error}</Text>
          {(!user || isGuest) ? (
             <Pressable onPress={handleGuestGoToLogin} style={[styles.loginButton, {borderColor: themeColors.tint}]}>
                <Text style={[styles.loginButtonText, {color: themeColors.tint}]}>Go to Login</Text>
             </Pressable>
          ) : null}
        </View>
      ) : null}

      {!error && history.length === 0 && !isLoading ? (
         <View style={styles.centeredMessageContainer}>
            <Text style={[styles.emptyText, { color: themeColors.text, opacity: 0.7 }]}>No conversation history found.</Text>
         </View>
      ) : null}

      {history.length > 0 ? (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderHistoryItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={themeColors.tint} colors={[themeColors.tint]} progressBackgroundColor={themeColors.background} />
          }
          contentContainerStyle={styles.listContentContainer}
        />
      ) : null}
    </SafeAreaView>
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
