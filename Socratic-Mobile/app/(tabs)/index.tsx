// app/index.tsx (or app/(tabs)/index.tsx if that's your main screen)
import { Text, View, StyleSheet, Button, Platform, Alert } from 'react-native'; // Import Button, Platform, Alert
import React, { useEffect, useState } from 'react';
import { Colors } from '@/src/constants/Colors'; // Adjust path if needed
import { useColorScheme } from '@/src/hooks/useColorScheme'; // Adjust path if needed
import { checkBackendConnection } from '@/src/services/api'; // Adjust path if needed

// --- Import Firebase & Google Sign-In ---
import auth from '@react-native-firebase/auth';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth'; // Import User type

export default function IndexScreen() {
  const colorScheme = useColorScheme();
  const [connectionStatus, setConnectionStatus] = useState<string | null>(
    'Checking connection...'
  );
  // --- Add state for user info and loading ---
  const [initializing, setInitializing] = useState(true);
  // Use the correct Firebase User type
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [signInError, setSignInError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

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

  // --- Firebase Auth State Listener ---
  useEffect(() => {
    // Listener for Firebase auth state changes
    const subscriber = auth().onAuthStateChanged((user) => {
      console.log('[AUTH] Firebase Auth State Changed:', user ? user.uid : null); // Log auth changes
      setUser(user); // Update user state
      if (initializing) setInitializing(false); // Mark initialization complete
      setIsSigningIn(false); // Stop loading indicator on auth change
    });
    return subscriber; // unsubscribe on unmount
  }, [initializing]); // Dependency array

  // --- Google Sign-In Function ---
  const onGoogleButtonPress = async () => {
    setIsSigningIn(true); // Show loading indicator
    setSignInError(null); // Clear previous errors
    try {
      // Check if your device supports Google Play Services (Android only)
      console.log('[INFO] Checking Google Play Services...');
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      console.log('[INFO] Google Play Services OK.');

      // --- Step 1: Sign in with Google (confirms user identity) ---
      console.log('[INFO] Attempting GoogleSignin.signIn()...');
      await GoogleSignin.signIn(); // We don't necessarily need the userInfo here now
      console.log('[SUCCESS] Google Sign-In successful (User confirmed identity).');

      // --- Step 2: Get the ID token from Google Sign-In library ---
      // This token is needed *only* to create the Firebase credential
      console.log('[INFO] Getting Google ID Token via getTokens()...');
      const { idToken } = await GoogleSignin.getTokens();
      if (!idToken) {
        throw new Error("Google Sign-In getTokens() failed to return an ID token.");
      }
      console.log('[SUCCESS] Got Google ID Token via getTokens().');

      // --- Step 3: Create Firebase Google credential ---
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      // --- Step 4: Sign-in to Firebase with the credential ---
      console.log('[INFO] Signing in to Firebase with Google credential...');
      const userCredential = await auth().signInWithCredential(googleCredential);
      console.log('[SUCCESS] Firebase Sign-In successful.');

      // --- Step 5: Get Firebase ID Token from Firebase User ---
      // This is the token you'll usually send to your backend
      if (userCredential.user) {
        console.log('[INFO] Getting Firebase ID Token from Firebase user...');
        // Pass true to force refresh the token if needed
        const firebaseIdToken = await userCredential.user.getIdToken(true);
        console.log('[SUCCESS] Got Firebase ID Token:', firebaseIdToken.substring(0, 30) + '...'); // Log truncated token
        // TODO: Send firebaseIdToken to your backend here or store it securely
      } else {
         console.log('[WARN] userCredential.user is null after Firebase sign-in.');
      }

      // User state will also be updated by the onAuthStateChanged listener

    } catch (error: any) {
      setIsSigningIn(false); // Hide loading indicator on error
      console.error('[ERROR] Google Sign-In or Firebase Error:', error);
      // Handle specific error codes from Google Sign-In
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        setSignInError('Sign in cancelled.');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        setSignInError('Sign in is already in progress.');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setSignInError('Google Play Services not available or outdated.');
      } else {
        // Handle other errors (network, Firebase, etc.)
        setSignInError(`Sign in failed: ${error.message || error.code || 'Unknown error'}`);
      }
    }
  };

  // --- Sign Out Function ---
  const onSignOutPress = async () => {
    try {
      // --- Removed isSignedIn check, attempt Google Sign Out directly ---
      console.log('[INFO] Attempting Google Sign Out...');
      await GoogleSignin.signOut(); // Sign out from Google
      console.log('[SUCCESS] Google Sign Out successful.');
      // --- End Change ---

      console.log('[INFO] Attempting Firebase Sign Out...');
      await auth().signOut(); // Sign out from Firebase
      console.log('[SUCCESS] Firebase Sign Out successful.');
    } catch (error: any) {
      console.error('[ERROR] Sign Out Error:', error);
      // Check if the error is specifically because the user wasn't signed in with Google
      // (Error codes might vary, check library docs if needed)
      if (error.message?.includes('SIGN_IN_REQUIRED') || error.code === statusCodes.SIGN_IN_REQUIRED) {
         console.log('[INFO] Google Sign Out skipped (user was not signed in with Google).');
         // Still attempt Firebase sign out if Google sign out failed because user wasn't signed in
         try {
           console.log('[INFO] Attempting Firebase Sign Out after Google Sign Out skip...');
           await auth().signOut();
           console.log('[SUCCESS] Firebase Sign Out successful.');
         } catch (firebaseError) {
            console.error('[ERROR] Firebase Sign Out Error after Google skip:', firebaseError);
            Alert.alert('Sign Out Failed', 'An error occurred during Firebase sign out.');
         }
      } else {
        // Handle other sign out errors
        Alert.alert('Sign Out Failed', `An error occurred during sign out: ${error.message}`);
      }
    }
  };


  // Show loading indicator while Firebase is initializing
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

      {/* Conditional rendering based on user state */}
      {user ? (
        // Show user info and Sign Out button if logged in
        <View style={styles.userInfoContainer}>
          <Text style={{ color: Colors[colorScheme ?? 'light'].text }}>
            Welcome, {user.displayName || user.email}!
          </Text>
          <Button title="Sign Out" onPress={onSignOutPress} />
        </View>
      ) : (
        // Show Sign In button if logged out
        <View style={styles.signInContainer}>
          <Button
            title="Sign in with Google"
            onPress={onGoogleButtonPress}
            disabled={isSigningIn} // Disable button while signing in
          />
          {/* Show signing in indicator */}
          {isSigningIn && <Text style={{marginTop: 10}}>Signing in...</Text>}
          {/* Show error message if sign-in failed */}
          {signInError && (
            <Text style={styles.errorText}>Error: {signInError}</Text>
          )}
        </View>
      )}
    </View>
  );
}

// Styles definition
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
