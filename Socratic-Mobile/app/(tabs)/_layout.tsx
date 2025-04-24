// app/_layout.tsx
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react'; // Import React
import 'react-native-reanimated';

import { useColorScheme } from '@/src/hooks/useColorScheme';

// --- Import AuthProvider ---
import { AuthProvider } from '@/src/context/AuthContext'; // Adjust path if needed

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

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('@/src/assets/fonts/SpaceMono-Regular.ttf'), // Adjust path if needed
  });

  useEffect(() => {
    // Hide splash screen once fonts are loaded
    // We will add auth initializing check later
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null; // Keep returning null while fonts load
  }

  // --- Wrap the entire navigation structure with AuthProvider ---
  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        {/* We'll add auth state handling inside a nested component or here later */}
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
