// app/(tabs)/history.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, RefreshControl, Platform, Alert, TextInput, FlatList, TouchableOpacity, Share } from 'react-native';
import { useAuth } from '@features/auth/AuthContext';
import apiClientInstance from '@shared/api/api';
import { ConversationSummary, ConversationMessagesResponse } from '@socratic/common-types';
import { Colors } from '@shared/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { personas, PersonaUI } from '@shared/constants/personas';
import { ThemedCard } from '@shared/components/ThemedCard';
import { ThemedView } from '@shared/components/ThemedView';
import { ThemedText } from '@shared/components/ThemedText';
import { ThemedButton } from '@shared/components/ThemedButton';
import { spacing, shadows } from '@shared/constants/spacingAndShadows';
import * as Haptics from 'expo-haptics';
import { SwipeListView, SwipeRow, RowMap } from 'react-native-swipe-list-view';

export default function HistoryScreen() {
  const { user, isGuest, exitGuestMode } = useAuth();
  const router = useRouter();

  const [history, setHistory] = useState<ConversationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [currentRenameId, setCurrentRenameId] = useState<number | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const hasInitialized = useRef(false);

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
      if (!hasInitialized.current) {
        fetchHistory();
        hasInitialized.current = true;
      }
      setIsEditMode(false); // Reset edit mode when screen comes into focus
    }, [fetchHistory])
  );

  useEffect(() => {
    if (refreshing) {
      fetchHistory();
    }
  }, [refreshing, fetchHistory]);

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

  const handleRenameConversation = (conversationId: number, title: string) => {
    setCurrentRenameId(conversationId);
    setNewTitle(title || 'Untitled Conversation');
    setIsRenaming(true);
  };

  const confirmRename = async () => {
    if (currentRenameId === null) return;
    
    try {
      setIsLoading(true);
      // This API call might need to be implemented
      const success = await apiClientInstance.updateConversationTitle(currentRenameId, newTitle);
      if (success) {
        // Update local state
        setHistory((prevHistory) => 
          prevHistory.map(conv => 
            conv.id === currentRenameId ? { ...conv, title: newTitle } : conv
          )
        );
        Alert.alert("Success", "Conversation renamed successfully.");
      } else {
        Alert.alert("Error", "Failed to rename conversation. Please try again.");
      }
    } catch (error: any) {
      console.error("[HistoryScreen] Error renaming conversation:", error);
      Alert.alert("Error", error.response?.data?.error || "An error occurred while renaming.");
    } finally {
      setIsLoading(false);
      setIsRenaming(false);
      setCurrentRenameId(null);
      setNewTitle('');
    }
  };

  const cancelRename = () => {
    setIsRenaming(false);
    setCurrentRenameId(null);
    setNewTitle('');
  };

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
            backgroundColor: pressed && !isEditMode ? Colors.border : Colors.card,
            borderRadius: 12,
            ...shadows.low,
            padding: spacing.m,
            flexDirection: 'row',
            alignItems: 'center',
          },
        ]}
      >
        <View style={{ flex: 1 }}>
          <ThemedText type="defaultSemiBold" style={{ marginBottom: 2 }}>{item.title || "Untitled Conversation"}</ThemedText>
          <ThemedText style={{ color: Colors.tabIconDefault, fontStyle: 'italic', fontSize: 13 }}>Chat with: {personaDisplayName}</ThemedText>
          <ThemedText style={{ color: Colors.tabIconDefault, fontSize: 12, marginTop: 2 }}>Last updated: {new Date(item.updated_at).toLocaleDateString()} {new Date(item.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</ThemedText>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {isEditMode ? (
            <Pressable onPress={() => handleDeleteConversation(item.id)} style={{ padding: 8 }} accessibilityLabel="Delete conversation">
              <Ionicons name="trash-bin-outline" size={24} color={Colors.tint} />
            </Pressable>
          ) : (
            <Pressable onPress={() => handleShareHistoryItem(item.id)} style={{ padding: 8 }} accessibilityLabel="Share conversation">
              <Ionicons name="share-social-outline" size={24} color={Colors.tint} />
            </Pressable>
          )}
        </View>
      </Pressable>
    );
  };

  const handleShareHistoryItem = async (conversationId: number) => {
    try {
      setIsLoading(true);
      const fetchedMessages = await apiClientInstance.getConversationMessages(conversationId);
      if (fetchedMessages && fetchedMessages.length > 0) {
        const conversation = history.find(conv => conv.id === conversationId);
        const title = conversation?.title || 'Untitled Conversation';
        const personaDetail = personas.find(p => p.id === conversation?.persona_id);
        const personaName = personaDetail?.name || 'Cogito';
        
        const chatContent = fetchedMessages
          .map(msg => `${msg.role === 'user' ? 'User' : personaName}: ${msg.content}`)
          .join('\n');
          
        const result = await Share.share({
          message: `${title}\n\n${chatContent}`,
          title: title,
        });
        
        if (result.action === Share.sharedAction) {
          console.log('Shared conversation successfully');
        } else if (result.action === Share.dismissedAction) {
          console.log('Share dismissed');
        }
      } else {
        Alert.alert('Empty Conversation', 'This conversation has no messages to share.');
      }
    } catch (error: any) {
      console.error('[HistoryScreen] Error sharing conversation:', error);
      Alert.alert('Error', 'Could not load messages for sharing.');
    } finally {
      setIsLoading(false);
    }
  };

  // Render rename modal/popup
  const renderRenameModal = () => {
    if (!isRenaming) return null;
    
    return (
      <ThemedView style={styles.modalOverlay}>
        <ThemedView style={styles.modalContent}>
          <ThemedText type="title" style={styles.modalTitle}>Rename Conversation</ThemedText>
          <TextInput
            style={styles.inputField}
            value={newTitle}
            onChangeText={setNewTitle}
            placeholder="Enter new title"
            placeholderTextColor="#999"
            autoFocus
          />
          <ThemedView style={styles.modalButtons}>
            <Pressable onPress={cancelRename} style={styles.modalButton}>
              <ThemedText style={{ color: Colors.tint }}>Cancel</ThemedText>
            </Pressable>
            <Pressable onPress={confirmRename} style={[styles.modalButton, styles.confirmButton]}>
              <ThemedText style={{ color: 'white' }}>Rename</ThemedText>
            </Pressable>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    );
  };

  // Modify renderHiddenItem for SwipeListView to include direct touch handlers
  const renderHiddenItem = ({ item }: { item: ConversationSummary }) => {
    // If in edit mode, don't allow swipe actions
    if (isEditMode) {
      return <View style={styles.rowBack}></View>;
    }
    
    return (
      <View style={styles.rowBack}>
        <TouchableOpacity
          style={[styles.backLeftBtn, styles.backLeftBtnLeft]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            handleRenameConversation(item.id, item.title);
          }}
        >
          <Ionicons name="pencil-outline" size={24} color="white" />
          <ThemedText style={styles.backTextWhite}>Edit</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.backRightBtn, styles.backRightBtnRight]}
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            handleDeleteConversation(item.id);
          }}
        >
          <Ionicons name="trash-bin-outline" size={24} color="white" />
          <ThemedText style={styles.backTextWhite}>Delete</ThemedText>
        </TouchableOpacity>
      </View>
    );
  };

  // Add onSwipeValueChange for haptic feedback
  const onSwipeValueChange = useCallback((swipeData: { key: string; value: number }) => {
    const { key, value } = swipeData;
    // Add haptic feedback when swipe reaches threshold
    if (Math.abs(value) > 50 && Math.abs(value) < 70) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  if (isLoading && history.length === 0 && !refreshing && !error) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.tint} />
        <ThemedText style={{ color: Colors.text, marginTop: spacing.m }}>Loading history...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: Colors.background }]}>
      <ThemedView style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.m,
        paddingTop: Platform.OS === 'android' ? 25 : 15,
        paddingBottom: 15,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.tabIconDefault,
      }}>
        <ThemedView style={{ width: 60 }} />
        <ThemedText type="title" style={{ fontSize: 20, textAlign: 'center' }}>Conversation History</ThemedText>
        {(history.length > 0 || isEditMode) && user && !isGuest ? (
          <Pressable onPress={toggleEditMode} style={{ paddingVertical: 5, paddingHorizontal: 10, minWidth: 60, alignItems: 'flex-end' }}>
            <Ionicons 
              name={isEditMode ? "checkmark-done-outline" : "pencil-outline"} 
              size={24} 
              color={Colors.tint} 
            />
          </Pressable>
        ) : (
          <ThemedView style={{ width: 60 }} />
        )}
      </ThemedView>

      {error && !isLoading ? (
        <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <ThemedText style={{ color: Colors.text, opacity: 0.7, fontSize: 16, textAlign: 'center' }}>{error}</ThemedText>
          {(!user || isGuest) ? (
            <ThemedButton title="Go to Login" onPress={handleGuestGoToLogin} variant="outline" style={{ marginTop: 20 }} />
          ) : null}
        </ThemedView>
      ) : null}

      {!error && history.length === 0 && !isLoading ? (
        <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <ThemedText style={{ color: Colors.text, opacity: 0.7, fontSize: 16, textAlign: 'center' }}>No conversation history found.</ThemedText>
        </ThemedView>
      ) : null}

      {history.length > 0 ? (
        <SwipeListView
          data={history}
          renderItem={renderHistoryItem}
          renderHiddenItem={renderHiddenItem}
          leftOpenValue={75} // Width of the left action (Edit)
          rightOpenValue={-75} // Width of the right action (Delete)
          onSwipeValueChange={onSwipeValueChange}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              tintColor={Colors.tint} 
              colors={[Colors.tint]} 
              progressBackgroundColor={Colors.background} 
            />
          }
          contentContainerStyle={{ paddingHorizontal: spacing.m, paddingVertical: spacing.s, backgroundColor: Colors.background }}
          disableRightSwipe={isEditMode} // Disable swipe when in edit mode
          disableLeftSwipe={isEditMode} // Disable swipe when in edit mode
          closeOnRowPress={true} // Close the row when pressing on the visible item
        />
      ) : null}

      {renderRenameModal()}
    </ThemedView>
  );
}

// Add styles for swipe functionality and modal
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
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    ...shadows.medium,
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 15,
    textAlign: 'center',
  },
  inputField: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 6,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    padding: 10,
  },
  confirmButton: {
    backgroundColor: Colors.tint,
    borderRadius: 6,
  },
  rowBack: {
    alignItems: 'center',
    backgroundColor: Colors.background,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 15,
    marginVertical: spacing.s / 2,
    borderRadius: 12,
    height: '100%',
  },
  backLeftBtn: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    width: 75,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  backLeftBtnLeft: {
    backgroundColor: Colors.tint, // Blue color for edit
    left: 0,
  },
  backRightBtn: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    width: 75,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  backRightBtnRight: {
    backgroundColor: Colors.destructive, // Red color for delete
    right: 0,
  },
  backTextWhite: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
});
