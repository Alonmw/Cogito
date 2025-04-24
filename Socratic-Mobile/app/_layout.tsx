// app/_layout.tsx
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router'; // Import useRouter, useSegments
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/src/hooks/useColorScheme';

// --- Import AuthProvider and useAuth hook ---
import { AuthProvider, useAuth } from '@/src/context/AuthContext'; // Adjust path if needed

// --- Import Google Sign-In (Keep configuration here) ---
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// --- Configure Google Sign-In ---
const YOUR_WEB_CLIENT_ID = '839078547891-73krf3ndqc67hp2d41ggpc12m84amduf.apps.googleusercontent.com'; // Verify this ID
console.log('[INFO] Configuring Google Sign-In with webClientId:', YOUR_WEB_CLIENT_ID);
GoogleSignin.configure({
  webClientId: YOUR_WEB_CLIENT_ID,
});
// --- End Google Sign-In Configuration ---


// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// --- Main Layout Component ---
function MainLayout() {
  const colorScheme = useColorScheme();
  const { user, initializing } = useAuth(); // Get user and initializing state
  const router = useRouter(); // Hook for navigation
  const segments = useSegments(); // Hook to get current route segments

  useEffect(() => {
    // Hide splash screen once fonts are loaded AND auth is initialized
    if (!initializing) {
      SplashScreen.hideAsync();
    }
  }, [initializing]);

  useEffect(() => {
    if (initializing) return; // Do nothing until auth is initialized

    // Check if the user is currently in the main app group (tabs)
    // Note: segments can be empty initially, so check length
    const inAppGroup = segments.length > 0 && segments[0] === '(tabs)';
    // Check if the user is currently on the login screen
    const onLoginScreen = segments.length > 0 && segments[0] === 'login';

    if (user && !inAppGroup) {
      // User is signed in but not in the main app area, redirect to tabs/home
      console.log('[ROUTER] User signed in, redirecting to (tabs)');
      router.replace('/(tabs)'); // Use replace to prevent going back to login
    } else if (!user && !onLoginScreen) {
      // User is signed out and not on the login screen, redirect to login
      console.log('[ROUTER] User signed out, redirecting to /login');
      router.replace('/login'); // Use replace to prevent going back
    }
    // If user state matches the current location (e.g., signed in and in '(tabs)', or signed out and on '/login'), do nothing.

  }, [user, initializing, segments, router]); // Rerun effect when these change


  // Show nothing while initializing (splash screen is visible)
  // Or return a global loading indicator if preferred
  if (initializing) {
    return null;
  }

  // Always render the Stack navigator
  // The useEffect above handles the redirection
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Define all possible screens/layouts */}
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
// --- End Main Layout Component ---


export default function RootLayout() {
  // Load fonts here
  const [loaded, error] = useFonts({
    SpaceMono: require('@/src/assets/fonts/SpaceMono-Regular.ttf'), // Adjust path if needed
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // Return null while fonts are loading (splash screen is visible)
  if (!loaded) {
    return null;
  }

  // Wrap the main layout component with AuthProvider
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
