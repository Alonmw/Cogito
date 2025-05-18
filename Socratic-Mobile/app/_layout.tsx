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
  // --- Get isGuest from context ---
  const { user, isGuest, initializing } = useAuth(); // Get user, isGuest, and initializing state
  // --- End Change ---
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

    const inAppGroup = segments.length > 0 && segments[0] === '(tabs)';
    const onLoginScreen = segments.length > 0 && segments[0] === 'login';
    const onPersonaSelectionScreen = segments.length > 0 && segments[0] === 'persona-selection';

    // --- Updated Routing Logic for Persona Selection ---
    const canAccessApp = user || isGuest; // User can access main app if logged in OR is guest

    if (canAccessApp) {
      if (!inAppGroup && !onPersonaSelectionScreen) {
        // If authenticated/guest but not in tabs or persona selection, go to persona selection
        console.log('[ROUTER] User/Guest authenticated, navigating to persona-selection');
        router.replace('/persona-selection');
      }
    } else if (!onLoginScreen) {
      // User is not logged in AND not a guest, and not on the login screen -> redirect to login
      console.log('[ROUTER] User signed out/not guest, redirecting to /login');
      router.replace('/login');
    }
    // --- End Updated Routing Logic ---

  }, [user, isGuest, initializing, segments, router]); // Add isGuest to dependencies


  // Show nothing while initializing (splash screen is visible)
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
        <Stack.Screen name="persona-selection" />
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
