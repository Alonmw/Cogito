// app/(tabs)/history.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, RefreshControl, Platform} from 'react-native';
import { useAuth } from '@/src/context/AuthContext'; // Adjust path if needed
import apiClientInstance from '@/src/services/api'; // Import shared API client
import { ApiHistoryMessage, ConversationSummary } from '@socratic/common-types'; // Import shared types
import { Colors } from '@/src/constants/Colors'; // Adjust path if needed
import { useColorScheme } from '@/src/hooks/useColorScheme'; // Adjust path if needed
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router'; // Import useRouter and useFocusEffect

// Define a type for the conversation summaries expected from the backend
// This might already exist in common-types, if so, import it.
interface ConversationSummaryItem {
  id: number;
  title: string;
  updated_at: string; // ISO string
}

export default function HistoryScreen() {
  const { user, isGuest } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const router = useRouter();

  const [history, setHistory] = useState<ConversationSummaryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!user || isGuest) { // History is only for logged-in, non-guest users
      setHistory([]); // Clear history if not eligible
      setError("Please log in to view your conversation history.");
      return;
    }
    if (isLoading) return; // Prevent multiple fetches

    console.log("[HistoryScreen] Fetching conversation history...");
    setIsLoading(true);
    setError(null);
    try {
      // Assuming your apiClientInstance has a method like getHistoryList()
      // We need to add this method to the shared @socratic/api-client package first.
      // For now, let's assume it returns a structure like { history: ConversationSummaryItem[] }
      // const response = await apiClientInstance.getHistoryList(); // Placeholder

      // --- TEMPORARY MOCK API CALL ---
      // Replace this with the actual API call once getHistoryList is implemented
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
      const mockResponse = {
          history: [
              // { id: 1, title: "First thoughts on philosophy...", updated_at: new Date(Date.now() - 3600000).toISOString() },
              // { id: 2, title: "Exploring the nature of reality...", updated_at: new Date().toISOString() },
          ]
      };
      // --- END TEMPORARY MOCK ---

      // TODO: Replace mockResponse with actual API call:
      // const response = await apiClientInstance.getHistoryList();
      // if (response && Array.isArray(response.history)) {
      //   setHistory(response.history);
      // } else {
      //   console.warn("[HistoryScreen] Invalid history response:", response);
      //   setError("Failed to load history or history is empty.");
      //   setHistory([]); // Ensure history is an empty array on failure
      // }

      // Using mock for now
      if (mockResponse && Array.isArray(mockResponse.history)) {
        setHistory(mockResponse.history);
      } else {
        setError("Failed to load history or history is empty.");
        setHistory([]);
      }

    } catch (err) {
      console.error("[HistoryScreen] Error fetching history:", err);
      setError("An error occurred while fetching your history.");
      setHistory([]); // Ensure history is an empty array on error
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user, isGuest, isLoading]); // Added isLoading to dependencies

  // Fetch history when the screen comes into focus or when user/guest status changes
  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [fetchHistory]) // fetchHistory is memoized with useCallback
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHistory();
  }, [fetchHistory]);

  const handlePressConversation = (conversationId: number, title: string) => {
    console.log(`[HistoryScreen] Navigating to conversation ID: ${conversationId}`);
    // Navigate to the dialogue screen, passing conversation ID and title
    router.push({
      pathname: '/(tabs)', // Navigate to the index (ChatScreen) of the (tabs) group
      params: { conversationId: conversationId, conversationTitle: title },
    });
  };

  if (isLoading && history.length === 0 && !refreshing) {
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

      {error && !isLoading && (
        <View style={styles.centeredMessageContainer}>
          <Text style={[styles.errorText, { color: themeColors.text, opacity: 0.7 }]}>{error}</Text>
          {(!user || isGuest) && (
             <Pressable onPress={() => router.replace('/login')} style={styles.loginButton}>
                <Text style={[styles.loginButtonText, {color: themeColors.tint}]}>Go to Login</Text>
             </Pressable>
          )}
        </View>
      )}

      {!error && history.length === 0 && !isLoading && (
         <View style={styles.centeredMessageContainer}>
            <Text style={[styles.emptyText, { color: themeColors.text, opacity: 0.7 }]}>No conversation history found.</Text>
         </View>
      )}

      {!error && history.length > 0 && (
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
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={themeColors.tint} />
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
    paddingTop: Platform.OS === 'android' ? 25 : 15, // Adjust for status bar
    paddingBottom: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    // borderBottomColor will be set by themeColors.tabIconDefault in parent ChatScreen
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
