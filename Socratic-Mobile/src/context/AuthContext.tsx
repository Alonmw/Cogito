import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode, // Type for children prop
} from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { Alert } from 'react-native';

// Define the shape of the context value
interface AuthContextType {
  user: FirebaseAuthTypes.User | null;
  initializing: boolean; // Indicates if Firebase auth is still checking the initial state
  isSigningIn: boolean; // Indicates if a sign-in process is active
  signInError: string | null; // Stores sign-in errors
  googleSignIn: () => Promise<void>; // Function to trigger Google Sign-In
  signOut: () => Promise<void>; // Function to trigger Sign Out
}

// Create the context with a default value (can be null or undefined initially)
// Using '!' asserts that the context will be provided, handle with care or provide default functions.
const AuthContext = createContext<AuthContextType>(null!);

// Custom hook to use the AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};

// Define props for the provider component
interface AuthProviderProps {
  children: ReactNode; // Allow children components to be passed
}

// Create the provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);

  // Firebase Auth State Listener
  useEffect(() => {
    const subscriber = auth().onAuthStateChanged((user) => {
      console.log('[AUTH Context] Firebase Auth State Changed:', user ? user.uid : null);
      setUser(user);
      if (initializing) setInitializing(false);
      setIsSigningIn(false); // Ensure loading state is reset on auth change
    });
    return subscriber; // unsubscribe on unmount
  }, [initializing]); // Dependency array

  // Google Sign-In Function (Moved from index.tsx)
  const googleSignIn = async () => {
    setIsSigningIn(true);
    setSignInError(null);
    try {
      console.log('[AUTH Context] Checking Google Play Services...');
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      console.log('[AUTH Context] Google Play Services OK.');

      console.log('[AUTH Context] Attempting GoogleSignin.signIn()...');
      await GoogleSignin.signIn();
      console.log('[AUTH Context] Google Sign-In successful (User confirmed identity).');

      console.log('[AUTH Context] Getting Google ID Token via getTokens()...');
      const { idToken } = await GoogleSignin.getTokens();
      if (!idToken) {
        throw new Error("Google Sign-In getTokens() failed to return an ID token.");
      }
      console.log('[AUTH Context] Got Google ID Token via getTokens().');

      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      console.log('[AUTH Context] Signing in to Firebase with Google credential...');
      await auth().signInWithCredential(googleCredential);
      console.log('[AUTH Context] Firebase Sign-In successful.');
      // User state updated by listener

    } catch (error: any) {
      setIsSigningIn(false);
      console.error('[AUTH Context ERROR] Google Sign-In or Firebase Error:', error);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        setSignInError('Sign in cancelled.');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        setSignInError('Sign in is already in progress.');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setSignInError('Google Play Services not available or outdated.');
      } else {
        setSignInError(`Sign in failed: ${error.message || error.code || 'Unknown error'}`);
      }
      // Re-throw the error if needed elsewhere, or handle it fully here
    }
    // Note: setIsSigningIn(false) is handled by the onAuthStateChanged listener
  };

  // Sign Out Function (Moved from index.tsx - Fixed)
  const signOut = async () => {
    try {
      // --- Removed isSignedIn check, attempt Google Sign Out directly ---
      console.log('[AUTH Context] Attempting Google Sign Out...');
      await GoogleSignin.signOut(); // Sign out from Google
      console.log('[AUTH Context] Google Sign Out successful.');
      // --- End Change ---

      console.log('[AUTH Context] Attempting Firebase Sign Out...');
      await auth().signOut(); // Sign out from Firebase
      console.log('[AUTH Context] Firebase Sign Out successful.');
    } catch (error: any) {
      console.error('[AUTH Context ERROR] Sign Out Error:', error);
      // Check if the error is specifically because the user wasn't signed in with Google
      // (Error codes might vary, check library docs if needed)
       if (error.message?.includes('SIGN_IN_REQUIRED') || error.code === statusCodes.SIGN_IN_REQUIRED) {
         console.log('[AUTH Context] Google Sign Out skipped (user was not signed in with Google).');
         // Still attempt Firebase sign out if Google sign out failed because user wasn't signed in
         try {
           console.log('[AUTH Context] Attempting Firebase Sign Out after Google skip...');
           await auth().signOut();
           console.log('[AUTH Context] Firebase Sign Out successful.');
         } catch (firebaseError) {
            console.error('[AUTH Context ERROR] Firebase Sign Out Error after Google skip:', firebaseError);
            Alert.alert('Sign Out Failed', 'An error occurred during Firebase sign out.');
         }
      } else {
        // Handle other sign out errors
        Alert.alert('Sign Out Failed', `An error occurred during sign out: ${error.message}`);
      }
    }
  };

  // Value provided to consuming components
  const value = {
    user,
    initializing,
    isSigningIn,
    signInError,
    googleSignIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
