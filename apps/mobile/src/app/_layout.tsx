// app/_layout.tsx
import { DefaultTheme } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments, useLocalSearchParams } from 'expo-router'; // Import useRouter, useSegments, useLocalSearchParams
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
  const params = useLocalSearchParams(); // Hook to get current route parameters
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

  useEffect(() => {
    const handleNavigation = async () => {
      if (initializing || introductionCompleted === null) return; // Do nothing until auth and introduction status are initialized

      const inAppGroup = segments.length > 0 && segments[0] === '(tabs)';
      const onLoginScreen = segments.length > 0 && segments[0] === 'login';
      const onPersonaSelectionScreen = segments.length > 0 && segments[0] === 'persona-selection';
      const onOnboardingScreen = segments.length > 0 && segments[0] === 'onboarding';

      // If we just navigated to persona-selection, refresh the introduction status first
      if (onPersonaSelectionScreen) {
        console.log('[ROUTER] On persona-selection, refreshing introduction status before navigation decisions...');
        const freshStatus = await refreshIntroductionStatus();
        console.log('[ROUTER] Fresh status after refresh:', freshStatus);
        
        // Use the fresh status for navigation decisions
        const currentIntroStatus = freshStatus;
        
        console.log('[ROUTER] Current segment:', segments[0], 'introductionCompleted:', introductionCompleted, 'introductionCompletedRef:', introductionCompletedRef.current, 'fresh status:', currentIntroStatus, 'user:', !!user, 'isGuest:', isGuest);

        // If the fresh status shows intro is NOT completed, redirect to onboarding
        if (!currentIntroStatus && !onOnboardingScreen) {
          console.log('[ROUTER] Fresh status shows intro not completed, navigating to onboarding');
          router.replace('/onboarding');
          return;
        }
        
        // If we're on persona-selection and intro is completed, stay here (no action needed)
        console.log('[ROUTER] Fresh status shows intro completed, staying on persona-selection');
        return;
      }

      // For all other cases, use ref value if available for more up-to-date status
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
        // Preserve any route params (like personaId, initialUserMessage) by passing them as redirect params
        const loginParams: any = {};
        
        if (params.personaId) loginParams.redirectPersonaId = params.personaId;
        if (params.initialUserMessage) loginParams.redirectInitialUserMessage = params.initialUserMessage;
        if (params.conversationId) loginParams.redirectConversationId = params.conversationId;
        
        console.log('[ROUTER] User trying to access main app without authentication, redirecting to /login with params:', loginParams);
        
        if (Object.keys(loginParams).length > 0) {
          router.replace({ pathname: '/login', params: loginParams });
        } else {
          router.replace('/login');
        }
        return;
      }
    };

    handleNavigation();
  }, [user, isGuest, initializing, segments, router, introductionCompleted, refreshIntroductionStatus]);

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
