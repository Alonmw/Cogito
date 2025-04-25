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
  isGuest: boolean; // <-- Add isGuest state
  initializing: boolean;
  isSigningIn: boolean;
  signInError: string | null;
  googleSignIn: () => Promise<void>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void; // <-- Add function for guest mode
}

const AuthContext = createContext<AuthContextType>(null!);

export const useAuth = () => {
  return useContext(AuthContext);
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [isGuest, setIsGuest] = useState(false); // <-- Initialize guest state
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);

  // Firebase Auth State Listener
  useEffect(() => {
    const subscriber = auth().onAuthStateChanged((user) => {
      console.log('[AUTH Context] Firebase Auth State Changed:', user ? user.uid : null);
      setUser(user);
      if (user) {
        setIsGuest(false); // If user logs in, they are not a guest
      }
      if (initializing) setInitializing(false);
      setIsSigningIn(false);
    });
    return subscriber;
  }, [initializing]);

  // Google Sign-In Function
  const googleSignIn = async () => {
    setIsSigningIn(true);
    setSignInError(null);
    setIsGuest(false); // Reset guest mode on sign-in attempt
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
    }
  };

  // Sign Out Function
  const signOut = async () => {
    try {
      console.log('[AUTH Context] Attempting Google Sign Out...');
      // Check if signed in with Google before signing out
      // Note: isSignedIn might still be problematic, but let's keep the try/catch
      try {
        await GoogleSignin.signOut();
        console.log('[AUTH Context] Google Sign Out successful.');
      } catch (googleSignOutError: any) {
         // Ignore errors like "SIGN_IN_REQUIRED" if user wasn't signed in with Google anyway
         if (googleSignOutError.code !== statusCodes.SIGN_IN_REQUIRED) {
            console.warn('[AUTH Context] Non-critical Google Sign Out error:', googleSignOutError);
         } else {
            console.log('[AUTH Context] Google Sign Out skipped (user was not signed in with Google).');
         }
      }

      console.log('[AUTH Context] Attempting Firebase Sign Out...');
      await auth().signOut();
      console.log('[AUTH Context] Firebase Sign Out successful.');
      setIsGuest(false); // Reset guest mode on sign out
    } catch (error: any) {
      console.error('[AUTH Context ERROR] Sign Out Error:', error);
      Alert.alert('Sign Out Failed', `An error occurred during sign out: ${error.message}`);
    }
  };

  // --- Function to set guest mode ---
  const continueAsGuest = () => {
      console.log('[AUTH Context] Continuing as Guest.');
      setUser(null); // Ensure no user object is set
      setIsGuest(true);
      setSignInError(null); // Clear any previous errors
      setInitializing(false); // Ensure app proceeds if initializing was stuck
  };
  // --- End Function ---

  // Value provided to consuming components
  const value = {
    user,
    isGuest, // <-- Provide guest state
    initializing,
    isSigningIn,
    signInError,
    googleSignIn,
    signOut,
    continueAsGuest, // <-- Provide guest function
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
