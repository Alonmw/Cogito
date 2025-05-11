// app/(tabs)/history.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, RefreshControl, Platform } from 'react-native';
import { useAuth } from '@/src/context/AuthContext';
import apiClientInstance from '@/src/services/api';
import { ConversationSummary } from '@socratic/common-types';
import { Colors } from '@/src/constants/Colors';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // Import an icon library

export default function HistoryScreen() {
  const { user, isGuest, exitGuestMode } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const router = useRouter();

  const [history, setHistory] = useState<ConversationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!user || isGuest) {
      setHistory([]);
      setError("Please log in to view your conversation history.");
      setRefreshing(false);
      return;
    }
    if (isLoading && !refreshing) {
        return;
    }

    setIsLoading(true);
    if (!refreshing) setError(null);

    try {
      const fetchedHistory = await apiClientInstance.getHistoryList();
      if (fetchedHistory && Array.isArray(fetchedHistory)) {
        setHistory(fetchedHistory);
        if (fetchedHistory.length === 0 && !error) {
            setError(null);
        }
      } else {
        setError("Failed to load history.");
        setHistory([]);
      }
    } catch (err: any) {
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
  }, [user, isGuest, refreshing, isLoading]); // Added isLoading to prevent re-fetch if already loading

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [fetchHistory])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
  }, []);

  const handlePressConversation = (conversationId: number, title: string) => {
    router.push({
      pathname: '/(tabs)',
      params: { conversationId: conversationId.toString(), conversationTitle: title },
    });
  };

  const handleGuestGoToLogin = () => {
      exitGuestMode();
  };

  const renderHistoryItem = ({ item }: { item: ConversationSummary }) => (
    <Pressable
      style={({ pressed }) => [
        styles.itemContainer,
        {
          backgroundColor: colorScheme === 'light' ? '#FFFFFF' : Colors.dark.background, // Card background
          borderColor: themeColors.tabIconDefault, // Subtle border
        },
        pressed && { backgroundColor: colorScheme === 'light' ? '#f0f0f0' : '#333333' }
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
      <Ionicons name="chevron-forward-outline" size={22} color={themeColors.tabIconDefault} />
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
        <Text style={[styles.title, { color: themeColors.text }]}>Conversation History</Text>
      </View>

      {error && !isLoading && (
        <View style={styles.centeredMessageContainer}>
          <Text style={[styles.errorText, { color: themeColors.text, opacity: 0.7 }]}>{error}</Text>
          {(!user || isGuest) && (
             <Pressable onPress={handleGuestGoToLogin} style={[styles.loginButton, {borderColor: themeColors.tint}]}>
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

      {history.length > 0 && (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderHistoryItem} // Use the new render function
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={themeColors.tint} colors={[themeColors.tint]} progressBackgroundColor={themeColors.background} />
          }
          contentContainerStyle={styles.listContentContainer}
          ItemSeparatorComponent={() => <View style={styles.separator} />} // Add separator
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
    // borderBottomColor dynamically set by themeColors.background in parent or themeColors.tabIconDefault
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  listContentContainer: {
    paddingHorizontal: 10, // Add horizontal padding to the list itself
    paddingVertical: 10,
  },
  itemContainer: {
    flexDirection: 'row', // Align icon and text horizontally
    alignItems: 'center', // Center items vertically
    paddingVertical: 15,
    paddingHorizontal: 15, // Padding inside the card
    // Removed borderBottomWidth, using ItemSeparatorComponent now
    borderRadius: 8, // Rounded corners for card look
    marginVertical: 5, // Space between cards
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    // Elevation for Android
    elevation: 3,
  },
  itemTextContainer: { // Container for title and date
    flex: 1, // Allow text to take available space
    marginRight: 10, // Space before the chevron icon
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600', // Bolder title
    marginBottom: 5, // More space below title
  },
  itemDate: {
    fontSize: 13, // Slightly larger date
    opacity: 0.8, // Slightly dimmer date
  },
  separator: { // Style for the separator
    height: 0, // No visible separator if using marginVertical on items
    // If you want a line separator instead of space:
    // height: StyleSheet.hairlineWidth,
    // backgroundColor: Colors.light.tabIconDefault, // Or theme color
    // marginHorizontal: 15,
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
