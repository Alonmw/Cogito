// app/(tabs)/history.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, RefreshControl, Platform } from 'react-native';
import { useAuth } from '@/src/context/AuthContext'; // Adjust path if needed
import apiClientInstance from '@/src/services/api'; // Import shared API client
import { ConversationSummary } from '@socratic/common-types'; // Import shared types
import { Colors } from '@/src/constants/Colors'; // Adjust path if needed
import { useColorScheme } from '@/src/hooks/useColorScheme'; // Adjust path if needed
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';

interface ConversationSummaryItem {
  id: number;
  title: string;
  updated_at: string; // ISO string
}

export default function HistoryScreen() {
  const { user, isGuest, exitGuestMode } = useAuth(); // Added exitGuestMode
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const router = useRouter();

  const [history, setHistory] = useState<ConversationSummaryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!user || isGuest) {
      setHistory([]);
      setError("Please log in to view your conversation history.");
      setRefreshing(false); // Ensure refreshing stops
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
      // --- Use the real API call ---
      const fetchedHistory = await apiClientInstance.getHistoryList();
      // --- End API call ---

      if (fetchedHistory && Array.isArray(fetchedHistory)) {
        setHistory(fetchedHistory);
        if (fetchedHistory.length === 0 && !error) { // Clear error if history is empty but no explicit fetch error
            setError(null); // Clear error if successfully fetched empty history
        }
      } else {
        console.warn("[HistoryScreen] getHistoryList returned null or invalid format.");
        setError("Failed to load history.");
        setHistory([]);
      }

    } catch (err: any) { // Catch errors, including the re-thrown 403
      console.error("[HistoryScreen] Error fetching history:", err);
      if (err.response?.status === 403) {
          setError(err.response?.data?.error || "Email verification required to access history.");
      } else {
          setError("An error occurred while fetching your history.");
      }
      setHistory([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  // isLoading removed from here, refreshing is kept
  }, [user, isGuest, refreshing]);

  // Fetch history when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // The fetchHistory function now has its own guard against re-entry if already loading.
      console.log("[HistoryScreen] Focus effect triggered. Calling fetchHistory.");
      fetchHistory();
    // --- Removed isLoading from this dependency array ---
    }, [fetchHistory]) // Only depend on fetchHistory. fetchHistory changes if user/isGuest/refreshing changes.
    // --- End Change ---
  );

  const onRefresh = useCallback(() => {
    console.log("[HistoryScreen] Refresh triggered");
    setRefreshing(true); // This will cause fetchHistory to run due to dependency change
  }, []);

  const handlePressConversation = (conversationId: number, title: string) => {
    console.log(`[HistoryScreen] Navigating to conversation ID: ${conversationId}`);
    router.push({
      pathname: '/(tabs)', // Navigate to the index (ChatScreen) of the (tabs) group
      params: { conversationId: conversationId, conversationTitle: title },
    });
  };

  const handleGuestGoToLogin = () => {
      console.log("[HistoryScreen] Guest navigating to login, calling exitGuestMode.");
      exitGuestMode();
  };

  // Initial loading state (only show if not refreshing and no error)
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
        <Text style={[styles.title, { color: themeColors.text }]}>Conversation History</Text>
      </View>

      {/* Error Message or Login Prompt */}
      {error && !isLoading && ( // Only show error if not loading
        <View style={styles.centeredMessageContainer}>
          <Text style={[styles.errorText, { color: themeColors.text, opacity: 0.7 }]}>{error}</Text>
          {(!user || isGuest) && (
             <Pressable onPress={handleGuestGoToLogin} style={[styles.loginButton, {borderColor: themeColors.tint}]}>
                <Text style={[styles.loginButtonText, {color: themeColors.tint}]}>Go to Login</Text>
             </Pressable>
          )}
        </View>
      )}

      {/* Empty State (No error, not loading, no history) */}
      {!error && history.length === 0 && !isLoading && (
         <View style={styles.centeredMessageContainer}>
            <Text style={[styles.emptyText, { color: themeColors.text, opacity: 0.7 }]}>No conversation history found.</Text>
         </View>
      )}

      {/* History List */}
      {history.length > 0 && ( // Only render FlatList if there's history and no error blocking it
        <FlatList
          data={history}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [
                styles.itemContainer,
                { backgroundColor: themeColors.background, borderBottomColor: themeColors.tabIconDefault },
                pressed && { backgroundColor: colorScheme === 'light' ? '#f0f0f0' : '#333333' }
              ]}
              onPress={() => handlePressConversation(item.id, item.title)}
            >
              <Text style={[styles.itemTitle, { color: themeColors.text }]}>{item.title || "Untitled Conversation"}</Text>
              <Text style={[styles.itemDate, { color: themeColors.tabIconDefault }]}>
                Last updated: {new Date(item.updated_at).toLocaleDateString()} {new Date(item.updated_at).toLocaleTimeString()}
              </Text>
            </Pressable>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={themeColors.tint} colors={[themeColors.tint]} progressBackgroundColor={themeColors.background} />
          }
          contentContainerStyle={styles.listContentContainer}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 25 : 15,
    paddingBottom: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    // borderBottomColor: themeColors.tabIconDefault, // Apply dynamically or ensure parent has it
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  listContentContainer: {
    paddingBottom: 20,
  },
  itemContainer: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  itemDate: {
    fontSize: 12,
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
