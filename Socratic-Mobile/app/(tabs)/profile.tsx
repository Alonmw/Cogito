// app/(tabs)/profile.tsx
import React from 'react';
// --- Import Platform ---
import { View, Text, StyleSheet, Button, Alert, Platform, Pressable } from 'react-native';
// --- End Import ---
import { useAuth } from '@/src/context/AuthContext'; // Adjust path if needed
import { Colors } from '@/src/constants/Colors'; // Adjust path if needed
import { useColorScheme } from '@/src/hooks/useColorScheme'; // Adjust path if needed
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router'; // Keep useRouter import, though not used directly here

export default function ProfileScreen() {
  // --- Use signOut from context ---
  const { user, signOut, isGuest } = useAuth(); // Correctly uses signOut
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  // const router = useRouter(); // Not needed for navigateToLogin anymore

  const handleLogout = () => {
      Alert.alert(
          "Confirm Logout",
          "Are you sure you want to log out?",
          [
              { text: "Cancel", style: "cancel" },
              // --- Call signOut ---
              { text: "Logout", style: "destructive", onPress: signOut } // Uses signOut
              // --- End Change ---
          ]
      );
  };

  // --- Function for guests to navigate to login ---
  const navigateToLogin = () => {
      // Call signOut from context. This will set user to null (if not already)
      // AND set isGuest to false. The useEffect in _layout.tsx
      // will detect this change and redirect to /login.
      console.log("[ProfileScreen] Calling signOut to exit guest mode and trigger login redirect...");
      signOut(); // Uses signOut
  };
  // --- End Function ---

  // --- Determine text color for action buttons ---
  const actionButtonTextColor = colorScheme === 'dark' ? '#0a7ea4' : '#FFFFFF'; // Blueish in dark, White in light
  // --- End Color Determination ---


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: themeColors.text }]}>Profile</Text>

        {user ? (
          // --- Logged-in User View ---
          <View style={styles.infoContainer}>
            <Text style={[styles.label, { color: themeColors.text }]}>Email:</Text>
            <Text style={[styles.infoText, { color: themeColors.text }]}>{user.email || 'N/A'}</Text>

            <Text style={[styles.label, { color: themeColors.text }]}>Display Name:</Text>
            <Text style={[styles.infoText, { color: themeColors.text }]}>{user.displayName || '(Not Set)'}</Text>

            {/* Logout Button */}
            <View style={styles.buttonContainer}>
               <Pressable
                 onPress={handleLogout} // Calls handleLogout which uses signOut
                 style={({ pressed }) => [
                   styles.actionButton,
                   { backgroundColor: themeColors.tint },
                   pressed && styles.buttonPressed,
                 ]}
               >
                 <Text style={[styles.actionButtonText, { color: actionButtonTextColor }]}>
                   Logout
                 </Text>
               </Pressable>
            </View>
          </View>
          // --- End Logged-in User View ---
        ) : isGuest ? (
           // --- Guest User View ---
           <View style={styles.infoContainer}>
             <Text style={[styles.guestMessage, { color: themeColors.text }]}>
                 You are currently using the app as a guest.
             </Text>
             <Text style={[styles.guestMessage, { color: themeColors.text, marginBottom: 30 }]}>
                 Log in or sign up to save history and access all features.
             </Text>
             {/* Login/Sign Up Button */}
             <View style={styles.buttonContainer}>
                 <Pressable
                   onPress={navigateToLogin} // Calls navigateToLogin which uses signOut
                   style={({ pressed }) => [
                     styles.actionButton,
                     { backgroundColor: themeColors.tint },
                     pressed && styles.buttonPressed,
                   ]}
                 >
                   <Text style={[styles.actionButtonText, { color: actionButtonTextColor }]}>
                     Log In / Sign Up
                   </Text>
                 </Pressable>
             </View>
           </View>
           // --- End Guest User View ---
        ) : (
            // Fallback
             <Text style={[styles.infoText, { color: themeColors.text }]}>
                 Not logged in.
             </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  infoContainer: {
      width: '100%',
      marginBottom: 30,
      padding: 20,
      backgroundColor: Colors.light.background, // Needs theme adjustment if Colors.ts doesn't have dark.card
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
      // Apply theme background color dynamically later if needed
  },
  label: {
      fontSize: 14,
      fontWeight: '600',
      opacity: 0.7,
      marginBottom: 4,
  },
  infoText: {
      fontSize: 16,
      marginBottom: 15,
  },
  guestMessage: {
      fontSize: 16,
      marginBottom: 10,
      textAlign: 'center',
      lineHeight: 22,
  },
  buttonContainer: {
      marginTop: 20,
      width: '100%',
      alignItems: 'center',
  },
  actionButton: {
      width: '80%',
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 10,
  },
  actionButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
  },
  buttonPressed: {
      opacity: 0.8,
  }
});
