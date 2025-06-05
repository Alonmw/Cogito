// app/_layout.tsx
import { DefaultTheme } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router'; // Import useRouter, useSegments
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Colors } from '@shared/constants/Colors';
import { hasCompletedIntroduction } from '@shared/utils/onboardingUtils';
import { useFocusEffect } from '@react-navigation/native';

// --- Import AuthProvider and useAuth hook ---
import { AuthProvider, useAuth } from '@features/auth/AuthContext'; // Adjust path if needed

// --- Import Analytics ---
import { analyticsService } from '@shared/api/analytics';

// --- Import Google Sign-In (Keep configuration here) ---
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// --- Configure Google Sign-In ---
const YOUR_WEB_CLIENT_ID = '839078547891-73krf3ndqc67hp2d41ggpc12m84amduf.apps.googleusercontent.com'; // Verify this ID
console.log('[INFO] Configuring Google Sign-In with webClientId:', YOUR_WEB_CLIENT_ID);
GoogleSignin.configure({
  webClientId: YOUR_WEB_CLIENT_ID,
});
// --- End Google Sign-In Configuration ---

// Configure the navigation theme
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.tint,
    background: Colors.background,
    card: Colors.background,
    text: Colors.text,
    border: Colors.tabIconDefault,
  },
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// --- Main Layout Component ---
function MainLayout() {
  // --- Get isGuest from context ---
  const { user, isGuest, initializing } = useAuth(); // Get user, isGuest, and initializing state
  // --- End Change ---
  const router = useRouter(); // Hook for navigation
  const segments = useSegments(); // Hook to get current route segments
  const [introductionCompleted, setIntroductionCompleted] = useState<boolean | null>(null);
  const introductionCompletedRef = useRef<boolean | null>(null);

  // Function to refresh introduction status
  const refreshIntroductionStatus = useCallback(async () => {
    try {
      const completed = await hasCompletedIntroduction();
      console.log('[ROUTER] refreshIntroductionStatus() - AsyncStorage value:', completed, 'current state:', introductionCompleted);
      setIntroductionCompleted(completed);
      introductionCompletedRef.current = completed;
      return completed;
    } catch (error) {
      console.error('Error checking introduction status:', error);
      setIntroductionCompleted(false); // Default to false on error
      introductionCompletedRef.current = false;
      return false;
    }
  }, [introductionCompleted]);

  // Check if user has completed introduction
  useEffect(() => {
    if (!initializing) {
      refreshIntroductionStatus();
    }
  }, [initializing, refreshIntroductionStatus]);

  useEffect(() => {
    // Hide splash screen once fonts are loaded AND auth is initialized AND introduction status is checked
    if (!initializing && introductionCompleted !== null) {
      SplashScreen.hideAsync();
    }
  }, [initializing, introductionCompleted]);

  useEffect(() => {
    // Initialize analytics when app loads
    analyticsService.trackAppOpened();
  }, []);

  useEffect(() => {
    // Set user properties when auth state changes
    if (!initializing) {
      analyticsService.setUserProperties(isGuest, user?.uid);
    }
  }, [user, isGuest, initializing]);

  // Proactively refresh introduction status when segments change to persona-selection
  useEffect(() => {
    const currentSegment = segments[0];
    if (currentSegment === 'persona-selection') {
      console.log('[ROUTER] Navigated to persona-selection, proactively refreshing introduction status...');
      // Refresh immediately without delay
      const refreshAndLog = async () => {
        const newStatus = await refreshIntroductionStatus();
        console.log('[ROUTER] Proactive refresh completed, new status:', newStatus);
      };
      refreshAndLog();
    }
  }, [segments, refreshIntroductionStatus]);

  useEffect(() => {
    if (initializing || introductionCompleted === null) return; // Do nothing until auth and introduction status are initialized

    const inAppGroup = segments.length > 0 && segments[0] === '(tabs)';
    const onLoginScreen = segments.length > 0 && segments[0] === 'login';
    const onPersonaSelectionScreen = segments.length > 0 && segments[0] === 'persona-selection';
    const onOnboardingScreen = segments.length > 0 && segments[0] === 'onboarding';

    // Use ref value if available for more up-to-date status
    const currentIntroStatus = introductionCompletedRef.current !== null ? introductionCompletedRef.current : introductionCompleted;

    console.log('[ROUTER] Current segment:', segments[0], 'introductionCompleted:', introductionCompleted, 'introductionCompletedRef:', introductionCompletedRef.current, 'using:', currentIntroStatus, 'user:', !!user, 'isGuest:', isGuest);

    // --- PRIORITY 1: Onboarding for first-time users (regardless of auth status) ---
    if (!currentIntroStatus && !onOnboardingScreen) {
      console.log('[ROUTER] First time user, navigating to onboarding');
      router.replace('/onboarding');
      return;
    }

    // --- PRIORITY 2: Persona selection for users who completed onboarding (regardless of auth status) ---
    if (currentIntroStatus && !onPersonaSelectionScreen && !inAppGroup && !onLoginScreen && !onOnboardingScreen) {
      console.log('[ROUTER] User completed onboarding, navigating to persona-selection');
        router.replace('/persona-selection');
      return;
    }

    // --- PRIORITY 3: Authentication for users on persona-selection without auth (only if they try to access main app) ---
    const canAccessApp = user || isGuest;
    if (currentIntroStatus && inAppGroup && !canAccessApp) {
      // User completed onboarding, is trying to access main app, but not authenticated -> redirect to login
      console.log('[ROUTER] User trying to access main app without authentication, redirecting to /login');
      router.replace('/login');
      return;
    }

  }, [user, isGuest, initializing, segments, router, introductionCompleted]);

  // Show nothing while initializing (splash screen is visible)
  if (initializing || introductionCompleted === null) {
    return null;
  }

  // Always render the Stack navigator
  // The useEffect above handles the redirection
  return (
    <>
      <Stack 
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background }
        }}
      >
        {/* Define all possible screens/layouts */}
        <Stack.Screen name="login" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="persona-selection" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}
// --- End Main Layout Component ---


export default function RootLayout() {
  // Load fonts here
  const [loaded, error] = useFonts({
    SpaceMono: require('@shared/assets/fonts/SpaceMono-Regular.ttf'),
    'Lora-Bold': require('@shared/assets/fonts/Lora-Bold.ttf'),
    'Lora-SemiBold': require('@shared/assets/fonts/Lora-SemiBold.ttf'),
    'Inter-Regular': require('@shared/assets/fonts/Inter_24pt-Regular.ttf'),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // Return null while fonts are loading (splash screen is visible)
  if (!loaded) {
    return null;
  }

  // Wrap the main layout component with AuthProvider and GestureHandlerRootView
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
