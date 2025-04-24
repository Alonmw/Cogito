// app/login.tsx
import React from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '@/src/context/AuthContext'; // Adjust path if needed
import { Colors } from '@/src/constants/Colors'; // Adjust path if needed
import { useColorScheme } from '@/src/hooks/useColorScheme'; // Adjust path if needed

export default function LoginScreen() {
  const { googleSignIn, isSigningIn, signInError } = useAuth();
  const colorScheme = useColorScheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
        Welcome to Socratic Partner
      </Text>
      <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].text }]}>
        Please sign in to continue
      </Text>

      {/* Use googleSignIn function from context */}
      <Button
        title="Sign in with Google"
        onPress={googleSignIn}
        disabled={isSigningIn} // Use isSigningIn state from context
      />

      {/* Show signing in indicator (from context) */}
      {isSigningIn && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" />
            <Text style={{ marginLeft: 10 }}>Signing in...</Text>
          </View>
      )}

      {/* Show error message if sign-in failed (from context) */}
      {signInError && (
        <Text style={styles.errorText}>Error: {signInError}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
  },
  loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 15,
  },
  errorText: {
    color: 'red',
    marginTop: 15,
    textAlign: 'center',
  },
});
