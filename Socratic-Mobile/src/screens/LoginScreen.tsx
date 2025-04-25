// src/screens/LoginScreen.tsx
import React from 'react';
// --- Import Pressable, ActivityIndicator, Image ---
import { View, Text, StyleSheet, ActivityIndicator, Pressable, Platform, Image } from 'react-native'; // Added Image
// --- End Import ---
import { useAuth } from '@/src/context/AuthContext'; // Adjust path if needed
import { Colors } from '@/src/constants/Colors'; // Adjust path if needed
import { useColorScheme } from '@/src/hooks/useColorScheme'; // Adjust path if needed

// --- Google Logo URI (Replace with your actual logo asset path or URI) ---
// Option 1: Local asset (place google_logo.png in src/assets/images)
// const googleLogo = require('@/src/assets/images/google_logo.png');
// Option 2: Remote URI (ensure it's reliable)
const googleLogoUri = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png';
// --- End Google Logo ---


export default function LoginScreen() {
  const { googleSignIn, isSigningIn, signInError, continueAsGuest } = useAuth();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light']; // Get theme colors

  // --- Updated Button Colors ---
  // --- Set specific text color based on theme ---
  const googleButtonTextColor = colorScheme === 'dark' ? '#0a7ea4' : themeColors.tint; // Use light tint blue in dark mode
  // --- End Change ---
  // Background color is now light gray for both themes
  const googleButtonBackgroundColor = colorScheme === 'light' ? '#F0F0F0' : '#F2F2F7'; // Lighter gray for light, existing light gray for dark
  // Border color to make button visible on light background
  const googleButtonBorderColor = themeColors.tabIconDefault;
  // --- End Updated Button Colors ---


  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Text style={[styles.title, { color: themeColors.text }]}>
        Welcome to Socratic Partner
      </Text>
      <Text style={[styles.subtitle, { color: themeColors.text }]}>
        Please sign in or continue as a guest
      </Text>

      {/* --- Updated Google Sign-In Button --- */}
      <Pressable
        onPress={googleSignIn}
        disabled={isSigningIn}
        style={({ pressed }) => [
          styles.googleButton,
          // Apply new background and border colors
          {
            backgroundColor: googleButtonBackgroundColor,
            borderColor: googleButtonBorderColor,
          },
          isSigningIn && styles.buttonDisabled,
          pressed && styles.buttonPressed, // Keep pressed style subtle
        ]}
      >
        <View style={styles.googleButtonContent}>
           {/* Add Google Logo Image */}
           <Image
             source={{ uri: googleLogoUri }} // Or use: source={googleLogo} for local asset
             style={styles.googleLogo} // Removed outline styles from here
             resizeMode="contain"
           />
           <Text style={[styles.googleButtonText, { color: googleButtonTextColor }]}>
             Sign in with Google
           </Text>
        </View>
      </Pressable>
      {/* --- End Updated Button --- */}


      {/* Loading Indicator */}
      {isSigningIn && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={themeColors.text} />
            <Text style={{ marginLeft: 10, color: themeColors.text }}>Signing in...</Text>
          </View>
      )}

      {/* Sign In Error Message */}
      {signInError && (
        <Text style={styles.errorText}>Error: {signInError}</Text>
      )}

      {/* Separator or Spacer */}
      <View style={styles.separator} />

      {/* Continue as Guest Button/Link */}
      <Pressable onPress={continueAsGuest} disabled={isSigningIn}>
        <Text style={[styles.guestText, { color: themeColors.tint }]}>
          Continue as Guest
        </Text>
      </Pressable>
    </View>
  );
}

// Updated Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
    textAlign: 'center',
    opacity: 0.8,
  },
  // --- Styles for Pressable Google Button ---
  googleButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 220,
    flexDirection: 'row',
    // Added border to make light button visible
    borderWidth: 1,
    // Removed shadow as it doesn't look great on light buttons usually
    // elevation: 3,
  },
  googleButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  googleLogo: {
      width: 20,
      height: 20,
      marginRight: 15,
      // --- Removed border styles ---
      // borderWidth: 0.5,
      // borderColor: '#FFFFFF',
      // borderRadius: 10,
      // --- End Removed border ---
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonPressed: {
    // Darken background slightly on press for light buttons
    opacity: 0.8,
  },
  // --- End Google Button Styles ---
  loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 20,
  },
  errorText: {
    color: 'red',
    marginTop: 15,
    textAlign: 'center',
    marginHorizontal: 20,
  },
  separator: {
    height: 30,
  },
  guestText: {
    fontSize: 16,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});
