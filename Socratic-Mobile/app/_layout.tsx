// app/_layout.tsx
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react'; // Keep useEffect import
import 'react-native-reanimated';

import { useColorScheme } from '@/src/hooks/useColorScheme';

// --- Import Google Sign-In ---
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// --- Configure Google Sign-In ---
// Replace with your actual Web Client ID obtained from Google Cloud Console
// It should be the one with type: 3 in your google-services.json
const YOUR_WEB_CLIENT_ID = '839078547891-73krf3ndqc67hp2d41ggpc12m84amduf.apps.googleusercontent.com'; // Example based on your json

GoogleSignin.configure({
  webClientId: YOUR_WEB_CLIENT_ID,
  // You can add other options here if needed, like offlineAccess, scopes etc.
});
// --- End Google Sign-In Configuration ---


// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    // Ensure this path is correct relative to the _layout.tsx file
    SpaceMono: require('@/src/assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // --- Add Firebase Auth Listener (Example - we'll refine this later) ---
  // We'll add the actual auth state listener logic here later
  // when we build the authentication flow.
  // For now, just configuring Google Sign-In is the goal.
  // --- End Firebase Auth Listener ---

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

