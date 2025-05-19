# Step-by-Step Guide: Implementing Swipe Actions in History Tab

This guide outlines the steps to add swipe-to-edit and swipe-to-delete functionalities to the conversation cards in the History tab of your Socratic Mobile app.

**User Stories:**
* As a user, I want to swipe left on a conversation card to reveal a "Delete" option, so I can remove unwanted conversations.
* As a user, I want to swipe right on a conversation card to reveal an "Edit Title" option, so I can rename conversations for better organization.

**Overall Approach:**
We will use the `react-native-swipe-list-view` library to handle the swipe gestures and reveal hidden action buttons. We'll also integrate `expo-haptics` for tactile feedback and use React Native's `Alert` for confirmations and `Modal` for editing titles.

---

## 1. Prerequisites & Setup

### 1.1. Install Required Packages
If you haven't already, you'll need `react-native-swipe-list-view` for the swipe functionality and `expo-haptics` for tactile feedback.

```bash
npx expo install react-native-swipe-list-view expo-haptics
1.2. Backend API Endpoints (Important Note)This guide focuses on the frontend implementation. For the "Delete" and "Edit Title" functionalities to persist, corresponding backend API endpoints are required.The developer will need to ensure the following (or create them if they don't exist):In Socratic-Web/backend/app/dialogue/routes.py (or similar):A DELETE endpoint: e.g., DELETE /conversations/<conversation_id> to delete a conversation.A PUT or PATCH endpoint: e.g., PUT /conversations/<conversation_id> to update a conversation's title.In Socratic-Mobile/src/services/api.ts:A function deleteConversation(token: string, conversationId: string) that calls the DELETE backend endpoint.A function updateConversationTitle(token: string, conversationId: string, newTitle: string) that calls the PUT/PATCH backend endpoint.Example stubs for api.ts (to be fully implemented):// In Socratic-Mobile/src/services/api.ts

// ... other imports and functions

export const deleteConversation = async (token: string, conversationId: string): Promise<void> => {
  // const response = await apiClient.delete(`/conversations/${conversationId}`, {
  //   headers: { Authorization: `Bearer ${token}` },
  // });
  // if (response.status !== 200 && response.status !== 204) { // Or whatever your API returns on success
  //   throw new Error('Failed to delete conversation');
  // }
  console.log(`API call to delete conversation ${conversationId} (to be implemented)`);
  // Replace with actual API call
  return Promise.resolve();
};

export const updateConversationTitle = async (token: string, conversationId: string, title: string): Promise<void> => {
  // const response = await apiClient.put(`/conversations/${conversationId}`, 
  //   { title },
  //   { headers: { Authorization: `Bearer ${token}` } }
  // );
  // if (response.status !== 200) { // Or whatever your API returns on success
  //   throw new Error('Failed to update conversation title');
  // }
  console.log(`API call to update title for conversation ${conversationId} to "${title}" (to be implemented)`);
  // Replace with actual API call
  return Promise.resolve();
};
The backend developer would need to implement the corresponding routes in Socratic-Web/backend/app/dialogue/routes.py and update the database models in Socratic-Web/backend/app/models.py if necessary.2. Modifying history.tsxOpen Socratic-Mobile/app/(tabs)/history.tsx.2.1. Import Necessary Components and Hooksimport React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, TouchableOpacity, Alert, Modal, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view'; // Import SwipeListView
import * as Haptics from 'expo-haptics'; // Import Haptics
import { useRouter } from 'expo-router';
import { ThemedView } from '@/src/components/ThemedView';
import { ThemedText } from '@/src/components/ThemedText';
import { ThemedCard } from '@/src/components/ThemedCard';
import { ThemedButton } from '@/src/components/ThemedButton'; // For the modal
import { useAuth } from '@/src/context/AuthContext';
import { getConversations, deleteConversation, updateConversationTitle } from '@/src/services/api'; // Import new API functions
import { Conversation } from '@/packages/common-types/src/index'; // Assuming Conversation type is here
import Colors from '@/src/constants/Colors'; // Import Colors
import { spacing } from '@/src/constants/spacingAndShadows'; // Import spacing
import { FontAwesome } from '@expo/vector-icons'; // For icons
2.2. Update State for Modal and Editing// ... inside HistoryScreen component
const [conversations, setConversations] = useState<Conversation[]>([]);
const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);
const [error, setError] = useState<string | null>(null);

// New state for modal and editing
const [isModalVisible, setIsModalVisible] = useState(false);
const [editingConversation, setEditingConversation] = useState<Conversation | null>(null);
const [newTitle, setNewTitle] = useState('');
// ...
2.3. Implement Swipe Action Handlers// ... inside HistoryScreen component

const handleDeleteConversation = useCallback(async (conversationId: string) => {
    if (!auth?.token) return;

    Alert.alert(
        "Delete Conversation",
        "Are you sure you want to delete this conversation? This action cannot be undone.",
        [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        await deleteConversation(auth.token, conversationId);
                        setConversations(prev => prev.filter(conv => conv.id !== conversationId));
                        // Optionally show a success toast/message
                    } catch (err) {
                        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                        setError('Failed to delete conversation. Please try again.');
                        console.error("Delete error:", err);
                        // Optionally show an error toast/message
                    }
                },
            },
        ]
    );
}, [auth?.token]);

const openEditModal = useCallback((conversation: Conversation) => {
    setEditingConversation(conversation);
    setNewTitle(conversation.title || ''); // Pre-fill with current title
    setIsModalVisible(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}, []);

const handleUpdateTitle = useCallback(async () => {
    if (!auth?.token || !editingConversation || !newTitle.trim()) {
        setError("Title cannot be empty."); // Basic validation
        return;
    }

    try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await updateConversationTitle(auth.token, editingConversation.id, newTitle.trim());
        setConversations(prev =>
            prev.map(conv =>
                conv.id === editingConversation.id ? { ...conv, title: newTitle.trim() } : conv
            )
        );
        setIsModalVisible(false);
        setEditingConversation(null);
        setNewTitle('');
        // Optionally show a success toast/message
    } catch (err) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setError('Failed to update title. Please try again.');
        console.error("Update title error:", err);
        // Optionally show an error toast/message
    }
}, [auth?.token, editingConversation, newTitle]);
2.4. Modify renderItem for SwipeListViewThis will be the visible part of your list item.const renderItem = useCallback(({ item }: { item: Conversation }) => (
    <ThemedCard
        style={styles.card}
        onPress={() => router.push({ pathname: `/chat/${item.id}`, params: { title: item.title || `Conversation ${item.id}` } })}
    >
        <ThemedText type="subtitle" style={styles.cardTitle}>{item.title || `Conversation ${item.id}`}</ThemedText>
        <ThemedText type="caption" style={styles.cardPersona}>{item.persona_name || 'Unknown Persona'}</ThemedText>
        <ThemedText type="caption" style={styles.cardTimestamp}>
            {new Date(item.timestamp).toLocaleDateString()} - {new Date(item.timestamp).toLocaleTimeString()}
        </ThemedText>
    </ThemedCard>
), [router, theme]); // Add theme if you use useThemeColor for dynamic styling inside renderItem
2.5. Implement renderHiddenItem for SwipeListViewThis function defines what appears when you swipe the row.const renderHiddenItem = useCallback((data: { item: Conversation }, rowMap: any) => (
    <View style={styles.rowBack}>
        <TouchableOpacity
            style={[styles.backRightBtn, styles.backRightBtnLeft]}
            onPress={() => {
                openEditModal(data.item);
                // Optionally close the row
                // if (rowMap[data.item.id]) {
                //   rowMap[data.item.id].closeRow();
                // }
            }}
        >
            <FontAwesome name="pencil" size={24} color={Colors[theme].text} style={styles.icon} />
            <ThemedText style={styles.backTextWhite}>Edit</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
            style={[styles.backRightBtn, styles.backRightBtnRight]}
            onPress={() => handleDeleteConversation(data.item.id)}
        >
            <FontAwesome name="trash" size={24} color={Colors[theme].text} style={styles.icon} />
            <ThemedText style={styles.backTextWhite}>Delete</ThemedText>
        </TouchableOpacity>
    </View>
), [handleDeleteConversation, openEditModal, theme]); // Add theme
2.6. Replace FlatList with SwipeListView// ...
if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={Colors[theme].tint} /></View>;
}

if (error && conversations.length === 0) { // Show error prominently if no data and error
    return (
        <ThemedView style={styles.centered}>
            <ThemedText type="defaultSemiBold" style={{ color: Colors.light.errorText }}>Error: {error}</ThemedText>
            <ThemedButton title="Retry" onPress={fetchConversationsData} style={{marginTop: spacing.medium}}/>
        </ThemedView>
    );
}


return (
    <ThemedView style={styles.container}>
        <SwipeListView
            data={conversations}
            renderItem={renderItem}
            renderHiddenItem={renderHiddenItem}
            rightOpenValue={-75} // Width of the delete button
            leftOpenValue={75} // Width of the edit button
            previewRowKey={'0'} // Optional: Animate a row on first load
            previewOpenValue={-40} // Optional
            previewOpenDelay={3000} // Optional
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={conversations.length === 0 ? styles.emptyContainer : styles.listContentContainer}
            disableRightSwipe={false} // Allows right swipe for "Edit"
            disableLeftSwipe={false}  // Allows left swipe for "Delete"
            stopLeftSwipe={100} // How far the "Edit" button can be swiped
            stopRightSwipe={-100} // How far the "Delete" button can be swiped
            onSwipeValueChange={(swipeData) => {
                // You can add haptic feedback here based on swipeData.value
                // For example, a light impact when an action is about to be revealed
                // if (Math.abs(swipeData.value) > 50 && Math.abs(swipeData.value) < 70) {
                // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                // }
            }}
            ListEmptyComponent={
                !loading && !error ? ( // Only show "No conversations" if not loading and no initial error
                    <View style={styles.emptyContainer}>
                        <ThemedText type="defaultSemiBold">No conversations yet.</ThemedText>
                        <ThemedText type="default">Start a new chat to see it here!</ThemedText>
                    </View>
                ) : null
            }
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={[Colors[theme].tint]}
                    tintColor={Colors[theme].tint}
                />
            }
        />
        {/* Modal for Editing Title */}
        <Modal
            animationType="slide"
            transparent={true}
            visible={isModalVisible}
            onRequestClose={() => {
                setIsModalVisible(false);
                setEditingConversation(null);
            }}
        >
            <View style={styles.modalOverlay}>
                <ThemedCard style={styles.modalView}>
                    <ThemedText type="title" style={styles.modalTitle}>Edit Conversation Title</ThemedText>
                    <TextInput
                        style={[styles.input, { borderColor: Colors[theme].border, color: Colors[theme].text, backgroundColor: Colors[theme].card }]}
                        onChangeText={setNewTitle}
                        value={newTitle}
                        placeholder="Enter new title"
                        placeholderTextColor={Colors[theme].tabIconDefault}
                    />
                     {error && <ThemedText style={{color: Colors.light.errorText, marginBottom: spacing.medium}}>{error}</ThemedText>}
                    <View style={styles.modalButtons}>
                        <ThemedButton
                            title="Cancel"
                            onPress={() => {
                                setIsModalVisible(false);
                                setEditingConversation(null);
                                setError(null); // Clear error on cancel
                            }}
                            style={[styles.modalButton, { backgroundColor: Colors[theme].secondaryButtonBackground }]}
                            textStyle={{ color: Colors[theme].text }}
                        />
                        <ThemedButton
                            title="Save"
                            onPress={handleUpdateTitle}
                            style={styles.modalButton}
                        />
                    </View>
                </ThemedCard>
            </View>
        </Modal>
    </ThemedView>
);
// ...
2.7. Add StylesAdd these to your StyleSheet.create at the bottom of history.tsx. Adjust colors and spacing to match your app's theme using Colors.ts and spacingAndShadows.ts.// ... existing styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContentContainer: {
        paddingHorizontal: spacing.medium,
        paddingTop: spacing.medium,
        paddingBottom: spacing.large, // Ensure space for last card and potential tab bar
    },
    card: {
        marginBottom: spacing.medium,
        // Add any specific styles for the card if needed, ThemedCard already has base styling
        // backgroundColor is handled by ThemedCard based on theme
    },
    cardTitle: {
        marginBottom: spacing.small,
        // color is handled by ThemedText
    },
    cardPersona: {
        marginBottom: spacing.extraSmall,
        // color is handled by ThemedText
    },
    cardTimestamp: {
        // color is handled by ThemedText
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.large,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50, // Or adjust as needed
    },
    // Styles for swipe actions
    rowBack: {
        alignItems: 'center',
        backgroundColor: Colors.light.background, // Or a neutral color, will be overridden by buttons
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 0, // Edit button will be on the left
        paddingRight: 0, // Delete button will be on the right
        marginBottom: spacing.medium, // Match card's margin
        borderRadius: spacing.cardBorderRadius, // Match card's border radius
        overflow: 'hidden', // Important for rounded corners on swipe actions
    },
    backRightBtn: {
        alignItems: 'center',
        bottom: 0,
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
        width: 75, // Width of the action button
    },
    backRightBtnLeft: { // Edit button
        backgroundColor: Colors.light.tint, // A less destructive color, e.g., blue or green
        left: 0, // Position on the left
        // borderRadius: spacing.cardBorderRadius, // Keep if you want individual button rounding
    },
    backRightBtnRight: { // Delete button
        backgroundColor: Colors.light.errorBackground, // Red for delete
        right: 0,
        // borderRadius: spacing.cardBorderRadius,
    },
    backTextWhite: {
        // color: '#FFF', // Handled by ThemedText, but ensure contrast
        marginTop: spacing.extraSmall,
    },
    icon: {
        // No specific style needed if color is passed directly
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    },
    modalView: {
        margin: spacing.large,
        // backgroundColor is handled by ThemedCard
        borderRadius: spacing.cardBorderRadius,
        padding: spacing.large,
        alignItems: 'center',
        width: '85%', // Adjust width as needed
        // shadowColor, shadowOffset, etc., are handled by ThemedCard
    },
    modalTitle: {
        marginBottom: spacing.large,
        textAlign: 'center',
    },
    input: {
        width: '100%',
        padding: spacing.medium,
        borderWidth: 1,
        borderRadius: spacing.inputBorderRadius,
        marginBottom: spacing.large,
        fontSize: 16,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButton: {
        flex: 1, // Make buttons take equal space
        marginHorizontal: spacing.small, // Add some space between buttons
    },
});

// Remember to adapt Colors for dark mode if your Themed components don't handle it automatically for these specific styles.
// For example, for styles.rowBack:
// backgroundColor: Colors[theme].background, (if you want it to match the screen bg)
// Or for buttons:
// backgroundColor: theme === 'dark' ? Colors.dark.tint : Colors.light.tint,
// For text on buttons, ensure ThemedText handles the theme or set color explicitly:
// color: theme === 'dark' ? Colors.dark.text : Colors.light.text, (or a fixed color like '#FFF' if background is always dark)
// The FontAwesome icons should also have their color themed:
// color={Colors[theme].text} or color={Colors[theme].primary}
Note on Theming:The Colors[theme].<property> pattern is used assuming your Colors.ts is set up for light/dark modes and your theme variable (from useColorScheme or similar) is available in the scope of renderHiddenItem and styles. If theme is not directly available in StyleSheet.create, you might need to pass it down or create styles dynamically within the component. For renderHiddenItem, ensure theme is in its dependency array if it's created with useCallback.The ThemedCard, ThemedText, and ThemedButton should ideally handle their own theming based on the current theme. The styles provided above for rowBack, backRightBtnLeft, backRightBtnRight might need explicit theme handling if Colors.light.* is used directly and you support dark mode.Example for dynamic styling in renderHiddenItem if theme is available:const renderHiddenItem = useCallback((data: { item: Conversation }, rowMap: any) => {
    const currentTheme = theme; // Assuming 'theme' is from useColorScheme()

    return (
        <View style={[styles.rowBack, { backgroundColor: Colors[currentTheme].background }]}>
            <TouchableOpacity
                style={[styles.backRightBtn, styles.backRightBtnLeft, { backgroundColor: Colors[currentTheme].tint }]}
                // ... onPress
            >
                <FontAwesome name="pencil" size={24} color={Colors[currentTheme].card} /* or text for better contrast */ />
                <ThemedText style={[styles.backTextWhite, { color: Colors[currentTheme].card }]}>Edit</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.backRightBtn, styles.backRightBtnRight, { backgroundColor: Colors[currentTheme].errorBackground }]}
                // ... onPress
            >
                <FontAwesome name="trash" size={24} color={Colors[currentTheme].onError /* or a fixed white/black for contrast */} />
                <ThemedText style={[styles.backTextWhite, { color: Colors[currentTheme].onError }]}>Delete</ThemedText>
            </TouchableOpacity>
        </View>
    );
}, [handleDeleteConversation, openEditModal, theme]);
And update styles.backTextWhite to not have a fixed color if ThemedText handles it, or adjust as needed.3. UI/UX EnhancementsHaptic Feedback: Already integrated with expo-haptics for actions. You can add more subtle haptics on swipe initiation or when an action is fully revealed.Animations: react-native-swipe-list-view handles the basic swipe animations.Icons: FontAwesome icons are used. Ensure they are visually clear.Confirmation Modals: Alert.alert is used for delete confirmation. A custom modal is used for editing the title.Loading/Empty States: The SwipeListView includes ListEmptyComponent and RefreshControl.Error Handling: Basic error messages are set to the error state. Consider using a more user-friendly toast/snackbar system for non-critical errors. The modal also shows an error message if title update fails or input is invalid.Styling Consistency: Use Colors.ts and spacingAndShadows.ts for all styling to maintain consistency with the app's overall look and feel. Pay attention to text contrast on colored backgrounds in the swipe actions for both light and dark themes.4. TestingFunctionality:Test left swipe: Does the "Delete" button appear? Does it trigger the confirmation? Does it delete the item from the list and (conceptually) the backend?Test right swipe: Does the "Edit" button appear? Does it open the modal? Can you change the title? Does it update in the list and (conceptually) the backend?UI/UX:Are animations smooth?Is haptic feedback appropriate?Are icons and text clear and legible in both light and dark modes?Do the swipe action backgrounds and icons match the app's theme?Edge Cases:Swiping on an empty list.Rapid swipes.Network errors during API calls (how are they handled?).Canceling the delete/edit actions.Entering an empty title in the edit modal.Platform Consistency: Test on both iOS and Android emulators/devices.This guide provides a solid foundation for implementing the swipe functionality. Remember to adapt the code and styles to perfectly fit