// app/(tabs)/profile.tsx
import React from 'react';
import { View, Text, StyleSheet, Button, Alert, Platform, Pressable } from 'react-native';
import { useAuth } from '@/src/context/AuthContext'; // Adjust path if needed
import { Colors } from '@/src/constants/Colors'; // Adjust path if needed
import { useColorScheme } from '@/src/hooks/useColorScheme'; // Adjust path if needed
import { SafeAreaView } from 'react-native-safe-area-context';
// import { useRouter } from 'expo-router'; // Not needed

export default function ProfileScreen() {
  const { user, signOut, isGuest, exitGuestMode } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const handleLogout = () => {
      Alert.alert(
          "Confirm Logout",
          "Are you sure you want to log out?",
          [
              { text: "Cancel", style: "cancel" },
              { text: "Logout", style: "destructive", onPress: signOut }
          ]
      );
  };

  const navigateToLogin = () => {
      console.log("[ProfileScreen] Calling exitGuestMode to trigger login redirect...");
      exitGuestMode();
  };

  // Determine text color for action buttons
  const actionButtonTextColor = colorScheme === 'dark' ? '#0a7ea4' : '#FFFFFF'; // Blueish in dark, White in light
  // Determine background color for the info card
  const infoContainerBackgroundColor = colorScheme === 'light' ? '#FFFFFF' : '#2C2C2E'; // White in light, Dark Gray in dark

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: themeColors.text }]}>Profile</Text>

        {user ? (
          // --- Logged-in User View ---
          // --- Apply dynamic background to infoContainer ---
          <View style={[styles.infoContainer, { backgroundColor: infoContainerBackgroundColor }]}>
          {/* --- End Change --- */}
            <Text style={[styles.label, { color: themeColors.text }]}>Email:</Text>
            <Text style={[styles.infoText, { color: themeColors.text }]}>{user.email || 'N/A'}</Text>

            <Text style={[styles.label, { color: themeColors.text }]}>Display Name:</Text>
            <Text style={[styles.infoText, { color: themeColors.text }]}>{user.displayName || '(Not Set)'}</Text>

            {/* Logout Button */}
            <View style={styles.buttonContainer}>
               <Pressable
                 onPress={handleLogout}
                 style={({ pressed }) => [
                   styles.actionButton, // Style includes shadow/elevation now
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
           // --- Apply dynamic background to infoContainer ---
           <View style={[styles.infoContainer, { backgroundColor: infoContainerBackgroundColor }]}>
           {/* --- End Change --- */}
             <Text style={[styles.guestMessage, { color: themeColors.text }]}>
                 You are currently using the app as a guest.
             </Text>
             <Text style={[styles.guestMessage, { color: themeColors.text, marginBottom: 30 }]}>
                 Log in or sign up to save history and access all features.
             </Text>
             {/* Login/Sign Up Button */}
             <View style={styles.buttonContainer}>
                 <Pressable
                   onPress={navigateToLogin}
                   style={({ pressed }) => [
                     styles.actionButton, // Style includes shadow/elevation now
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

// --- Updated Styles ---
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
      // backgroundColor set dynamically now
      borderRadius: 10,
      // Shadow for iOS
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 }, // Adjusted shadow offset
      shadowOpacity: 0.15, // Slightly increased opacity
      shadowRadius: 4, // Increased radius
      // Elevation for Android
      elevation: 4, // Increased elevation
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
      // --- Add Shadow/Elevation ---
      shadowColor: "#000",
      shadowOffset: {
          width: 0,
          height: 2,
      },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
      elevation: 4,
      // --- End Shadow/Elevation ---
  },
  actionButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
  },
  buttonPressed: {
      opacity: 0.8,
  }
});
