// app/index.tsx (or app/(tabs)/index.tsx if that's your main screen)
import { Text, View, StyleSheet, Button, Platform, Alert } from 'react-native';
import React, { useEffect, useState } from 'react'; // Keep useEffect/useState for non-auth state
import { Colors } from '@/src/constants/Colors'; // Adjust path if needed
import { useColorScheme } from '@/src/hooks/useColorScheme'; // Adjust path if needed
import { checkBackendConnection } from '@/src/services/api'; // Adjust path if needed

// --- Import useAuth hook ---
import { useAuth } from '@/src/context/AuthContext'; // Adjust path if needed

export default function IndexScreen() {
  const colorScheme = useColorScheme();
  const [connectionStatus, setConnectionStatus] = useState<string | null>(
    'Checking connection...'
  );

  // --- Get auth state and functions from context ---
  const {
    user,
    initializing,
    isSigningIn,
    signInError,
    googleSignIn, // Use the function from context
    signOut,      // Use the function from context
  } = useAuth();

  // --- Backend Connection Check (Keep existing useEffect) ---
  useEffect(() => {
    const testConnection = async () => {
      const result = await checkBackendConnection();
      setConnectionStatus(
        result !== null
          ? `Backend says: ${result}`
          : 'Failed to connect to backend.'
      );
    };
    testConnection();
  }, []);

  // --- Removed Firebase Auth State Listener (Handled by AuthContext) ---
  // --- Removed onGoogleButtonPress Function (Handled by AuthContext) ---
  // --- Removed onSignOutPress Function (Handled by AuthContext) ---


  // Show loading indicator while Firebase is initializing (from context)
  if (initializing) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Main UI rendering
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
        Welcome!
      </Text>
      <Text style={{ color: Colors[colorScheme ?? 'light'].text, marginTop: 10 }}>
        Connection Status: {connectionStatus}
      </Text>

      {/* Conditional rendering based on user state (from context) */}
      {user ? (
        // Show user info and Sign Out button if logged in
        <View style={styles.userInfoContainer}>
          <Text style={{ color: Colors[colorScheme ?? 'light'].text }}>
            Welcome, {user.displayName || user.email}!
          </Text>
          {/* Use signOut function from context */}
          <Button title="Sign Out" onPress={signOut} />
        </View>
      ) : (
        // Show Sign In button if logged out
        <View style={styles.signInContainer}>
          {/* Use googleSignIn function from context */}
          <Button
            title="Sign in with Google"
            onPress={googleSignIn}
            disabled={isSigningIn} // Use isSigningIn state from context
          />
          {/* Show signing in indicator (from context) */}
          {isSigningIn && <Text style={{marginTop: 10}}>Signing in...</Text>}
          {/* Show error message if sign-in failed (from context) */}
          {signInError && (
            <Text style={styles.errorText}>Error: {signInError}</Text>
          )}
        </View>
      )}
    </View>
  );
}

// Styles definition (Keep existing styles)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  userInfoContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  signInContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
  },
});
