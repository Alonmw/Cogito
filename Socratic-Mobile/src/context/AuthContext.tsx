// src/context/AuthContext.tsx (Mobile Version)
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from 'react';
// --- Import Alert from react-native ---
import { Alert } from 'react-native';
// --- End Import ---
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
// Note: If you still get "Cannot find module" errors for the 3 lines above after restarting IDE,
// ensure they are listed in Socratic-Mobile/package.json and run `pnpm install` from the root.
// You might also need `pnpm add -D @types/react-native --filter Socratic-Mobile`.

// Define the shape of the context value
interface AuthContextType {
  user: FirebaseAuthTypes.User | null;
  isGuest: boolean;
  initializing: boolean;
  isSigningIn: boolean;
  isRegistering: boolean;
  signInError: string | null;
  registrationError: string | null;
  googleSignIn: () => Promise<void>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
  exitGuestMode: () => void;
  registerWithEmail: (name: string, email: string, password: string) => Promise<void>;
  clearAuthErrors: () => void;
}

const AuthContext = createContext<AuthContextType>(null!);

export const useAuth = () => {
  return useContext(AuthContext);
};

interface AuthProviderProps {
  children: ReactNode;
}

// --- Updated Type Guard (Avoids 'any') ---
interface FirebaseErrorLike { code: string; message: string; }
function isFirebaseError(error: unknown): error is FirebaseErrorLike {
     return (
         typeof error === 'object' &&
         error !== null &&
         Object.prototype.hasOwnProperty.call(error, 'code') && // More robust check
         typeof (error as FirebaseErrorLike).code === 'string' &&
         Object.prototype.hasOwnProperty.call(error, 'message') &&
         typeof (error as FirebaseErrorLike).message === 'string'
     );
}
// --- End Updated Type Guard ---


export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [initializing, setInitializing] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null); // Google specific
  const [registrationError, setRegistrationError] = useState<string | null>(null);

  // Auth state listener
  useEffect(() => {
    // --- Add Type Annotation for user ---
    const subscriber = auth().onAuthStateChanged((user: FirebaseAuthTypes.User | null) => {
    // --- End Type Annotation ---
      console.log('[AUTH Context] Firebase Auth State Changed:', user ? user.uid : null);
      setUser(user);
      if (user) {
        setIsGuest(false);
      }
      setIsSigningIn(false);
      setIsRegistering(false);
      clearAuthErrors();
      if (initializing) setInitializing(false);
    });
    return subscriber;
  }, [initializing]);

  const clearAuthErrors = () => {
      setSignInError(null);
      setRegistrationError(null);
  };

  const googleSignIn = async () => {
    setIsSigningIn(true);
    clearAuthErrors();
    setIsGuest(false);
    try {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        await GoogleSignin.signIn();
        const { idToken } = await GoogleSignin.getTokens();
        if (!idToken) throw new Error("Google Sign-In getTokens() failed.");
        const googleCredential = auth.GoogleAuthProvider.credential(idToken);
        await auth().signInWithCredential(googleCredential);
    } catch (error: unknown) { // Catch as unknown
        setIsSigningIn(false);
        console.error('[AUTH Context ERROR] Google Sign-In Error:', error);
        let errorMsg = 'An unexpected error occurred during Google Sign in.';
         // Use updated type guard
         if (isFirebaseError(error)) {
             if (error.code === statusCodes.SIGN_IN_CANCELLED) { errorMsg = 'Sign in cancelled.'; }
             else if (error.code === statusCodes.IN_PROGRESS) { errorMsg = 'Sign in is already in progress.'; }
             else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) { errorMsg = 'Google Play Services not available or outdated.'; }
             else { errorMsg = error.message || 'Google Sign in failed.'; }
         } else if (error instanceof Error) { // Check for generic Error
             errorMsg = error.message;
         }
        setSignInError(errorMsg);
    }
  };

  const registerWithEmail = async (name: string, email: string, password: string) => {
      setIsRegistering(true);
      clearAuthErrors();
      setIsGuest(false);
      try {
          const userCredential = await auth().createUserWithEmailAndPassword(email, password);
          const newUser = userCredential.user;
          if (newUser) {
              try { await newUser.sendEmailVerification(); Alert.alert("Registration Successful", "Please check your email to verify your address."); }
              catch (verificationError: unknown) { console.error('[AUTH Context ERROR] Failed to send verification email:', verificationError); Alert.alert("Verification Email Failed", "Could not send verification email, but your account was created."); }
          }
          if (newUser && name.trim()) {
              try { await newUser.updateProfile({ displayName: name.trim() }); const updatedUser = auth().currentUser; if (updatedUser) { setUser(updatedUser); } }
              catch (profileError: unknown) { console.warn('[AUTH Context WARN] Could not update profile display name:', profileError); }
          }
      } catch (error: unknown) { // Catch as unknown
          setIsRegistering(false);
          console.error('[AUTH Context ERROR] Email Registration Error:', error);
          let errorMsg = 'An unexpected error occurred during registration.';
          // Use updated type guard
          if (isFirebaseError(error)) {
              if (error.code === 'auth/email-already-in-use') { errorMsg = 'Email already in use.'; }
              else if (error.code === 'auth/invalid-email') { errorMsg = 'Invalid email address.'; }
              else if (error.code === 'auth/weak-password') { errorMsg = 'Password too weak (min. 6 characters).'; }
              else { errorMsg = error.message || 'Registration failed.'; }
          } else if (error instanceof Error) { errorMsg = error.message; }
          setRegistrationError(errorMsg);
      }
  };

  // Updated Sign Out Function
  const signOut = async () => {
    clearAuthErrors();
    const userToSignOut = auth().currentUser;
    setIsGuest(false); // Always ensure guest mode is off after attempt

    if (!userToSignOut) {
        console.log('[AUTH Context] No user logged in, ensuring guest mode is off.');
        setUser(null);
        if (initializing) setInitializing(false);
        return;
    }

    try {
      console.log('[AUTH Context] Attempting Google Sign Out (if applicable)...');
      try { await GoogleSignin.signOut(); console.log('[AUTH Context] Google Sign Out successful.'); }
      catch (googleSignOutError: unknown) { /* ... error handling ... */
         if (isFirebaseError(googleSignOutError) && googleSignOutError.code !== statusCodes.SIGN_IN_REQUIRED) { console.warn('[AUTH Context] Non-critical Google Sign Out error:', googleSignOutError); }
         else if (!isFirebaseError(googleSignOutError)) { console.warn('[AUTH Context] Non-Firebase Google Sign Out error:', googleSignOutError); }
         else { console.log('[AUTH Context] Google Sign Out skipped.'); }
      }

      console.log('[AUTH Context] Attempting Firebase Sign Out...');
      await auth().signOut();
      console.log('[AUTH Context] Firebase Sign Out successful.');
      // Listener will set user to null
    } catch (error: unknown) { // Catch as unknown
      console.error('[AUTH Context ERROR] Sign Out Error:', error);
      Alert.alert('Sign Out Failed', `An unexpected error occurred during sign out.`);
    }
  };

  // Function to set guest mode
  const continueAsGuest = () => {
      console.log('[AUTH Context] Setting Guest Mode.');
      if (auth().currentUser) {
          signOut().then(() => {
             setUser(null);
             setIsGuest(true);
             clearAuthErrors();
             // --- Use setInitializing ---
             if (initializing) setInitializing(false);
             // --- End Change ---
          });
      } else {
          setUser(null);
          setIsGuest(true);
          clearAuthErrors();
          // --- Use setInitializing ---
          if (initializing) setInitializing(false);
          // --- End Change ---
      }
  };

  // Function to exit guest mode
  const exitGuestMode = () => {
      console.log('[AUTH Context] Exiting Guest Mode.');
      setIsGuest(false);
  };


  // Value provided to consuming components
  const value = {
    user,
    isGuest,
    initializing,
    isSigningIn,
    isRegistering,
    signInError,
    registrationError,
    googleSignIn,
    signOut,
    continueAsGuest,
    exitGuestMode,
    registerWithEmail,
    clearAuthErrors,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to easily consume the context
// export const useAuth = (): AuthContextType => { ... }; // Keep hook as is
