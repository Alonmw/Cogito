// src/context/AuthContext.tsx (Mobile Version)
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from 'react';
import { Alert } from 'react-native';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import apiClientInstance from '@shared/api/api';

// Define the shape of the context value
interface AuthContextType {
  user: FirebaseAuthTypes.User | null;
  isGuest: boolean;
  initializing: boolean;
  isSigningIn: boolean; // Google Sign-In loading
  isRegistering: boolean;
  isLoggingIn: boolean; // <-- Add email/password login loading state
  isSendingPasswordReset: boolean; // <-- Add reset loading state
  isDeletingAccount: boolean; // <-- Add account deletion loading state
  signInError: string | null; // Google Sign-In error
  registrationError: string | null;
  emailSignInError: string | null; // <-- Add email/password login error state
  passwordResetError: string | null; // <-- Add reset error state
  deleteAccountError: string | null; // <-- Add delete account error state
  passwordResetSent: boolean; // <-- Add reset success state
  googleSignIn: () => Promise<void>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
  exitGuestMode: () => void;
  registerWithEmail: (name: string, email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>; // <-- Add email sign-in function
  sendPasswordReset: (email: string) => Promise<void>; // <-- Add reset function
  deleteAccount: () => Promise<boolean>; // <-- Add delete account function
  clearAuthErrors: () => void;
}

const AuthContext = createContext<AuthContextType>(null!);

export const useAuth = () => {
  return useContext(AuthContext);
};

interface AuthProviderProps {
  children: ReactNode;
}

// Type guard for Firebase errors (can be shared or duplicated)
interface FirebaseErrorLike { code: string; message: string; }
function isFirebaseError(error: unknown): error is FirebaseErrorLike {
     return (
         typeof error === 'object' &&
         error !== null &&
         Object.prototype.hasOwnProperty.call(error, 'code') &&
         typeof (error as FirebaseErrorLike).code === 'string' &&
         Object.prototype.hasOwnProperty.call(error, 'message') &&
         typeof (error as FirebaseErrorLike).message === 'string'
     );
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [initializing, setInitializing] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false); // <-- Add state
  const [isSendingPasswordReset, setIsSendingPasswordReset] = useState(false); // <-- Add state
  const [isDeletingAccount, setIsDeletingAccount] = useState(false); // <-- Add state
  const [signInError, setSignInError] = useState<string | null>(null);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [emailSignInError, setEmailSignInError] = useState<string | null>(null); // <-- Add state
  const [passwordResetError, setPasswordResetError] = useState<string | null>(null); // <-- Add state
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(null); // <-- Add state
  const [passwordResetSent, setPasswordResetSent] = useState(false); // <-- Add state

  // Auth state listener
  useEffect(() => {
    const subscriber = auth().onAuthStateChanged((userAuth: FirebaseAuthTypes.User | null) => {
      console.log('[AUTH Context] Firebase Auth State Changed:', userAuth ? userAuth.uid : null);
      setUser(userAuth);
      if (userAuth) {
        setIsGuest(false);
      }
      setIsSigningIn(false);
      setIsRegistering(false);
      setIsLoggingIn(false); // <-- Reset state
      setIsSendingPasswordReset(false); // <-- Reset state
      setIsDeletingAccount(false); // <-- Reset delete account state
      clearAuthErrors();
      setPasswordResetSent(false); // <-- Reset state
      if (initializing) setInitializing(false);
    });
    return subscriber;
  }, [initializing]);

  const clearAuthErrors = () => {
      setSignInError(null);
      setRegistrationError(null);
      setEmailSignInError(null); // <-- Clear state
      setPasswordResetError(null); // <-- Clear state
      setDeleteAccountError(null); // <-- Clear state
  };

  const googleSignIn = async () => {
    setIsSigningIn(true);
    clearAuthErrors();
    setPasswordResetSent(false);
    setIsGuest(false);
    try {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        await GoogleSignin.signIn();
        const { idToken } = await GoogleSignin.getTokens();
        if (!idToken) throw new Error("Google Sign-In failed.");
        const googleCredential = auth.GoogleAuthProvider.credential(idToken);
        await auth().signInWithCredential(googleCredential);
    } catch (error: unknown) {
        setIsSigningIn(false);
        console.error('[AUTH Context ERROR] Google Sign-In Error:', error);
        let errorMsg = 'An unexpected error occurred during Google Sign in.';
         if (isFirebaseError(error)) {
             if (error.code === statusCodes.SIGN_IN_CANCELLED) { errorMsg = 'Sign in cancelled.'; }
             else if (error.code === statusCodes.IN_PROGRESS) { errorMsg = 'Sign in is already in progress.'; }
             else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) { errorMsg = 'Google Play Services not available or outdated.'; }
             else { errorMsg = error.message || 'Google Sign in failed.'; }
         } else if (error instanceof Error) { errorMsg = error.message; }
        setSignInError(errorMsg);
    }
  };

  const registerWithEmail = async (name: string, email: string, password: string) => {
      setIsRegistering(true);
      clearAuthErrors();
      setPasswordResetSent(false);
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
      } catch (error: unknown) {
          setIsRegistering(false);
          console.error('[AUTH Context ERROR] Email Registration Error:', error);
          let errorMsg = 'An unexpected error occurred during registration.';
          if (isFirebaseError(error)) {
              if (error.code === 'auth/email-already-in-use') { errorMsg = 'Email already in use.'; }
              else if (error.code === 'auth/invalid-email') { errorMsg = 'Invalid email address.'; }
              else if (error.code === 'auth/weak-password') { errorMsg = 'Password too weak (min. 6 characters).'; }
              else { errorMsg = error.message || 'Registration failed.'; }
          } else if (error instanceof Error) { errorMsg = error.message; }
          setRegistrationError(errorMsg);
      }
  };

  // --- Add Email/Password Sign-In Function for Mobile ---
  const signInWithEmail = async (email: string, password: string): Promise<void> => {
    setIsLoggingIn(true);
    clearAuthErrors();
    setPasswordResetSent(false);
    setIsGuest(false);
    try {
      console.log('[AUTH Context] Attempting Email/Password Sign In...');
      await auth().signInWithEmailAndPassword(email, password);
      console.log('[AUTH Context] Email/Password Sign In successful.');
      // User state will be updated by onAuthStateChanged listener
    } catch (error: unknown) {
      setIsLoggingIn(false); // Reset on error
      console.error('[AUTH Context ERROR] Email Sign In Error:', error);
      let errorMsg = 'An unexpected error occurred during login.';
      if (isFirebaseError(error)) {
          if (error.code === 'auth/invalid-email' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
              errorMsg = 'Invalid email or password.';
          } else if (error.code === 'auth/user-disabled') {
              errorMsg = 'This user account has been disabled.';
          } else {
              errorMsg = error.message || 'Login failed.';
          }
      } else if (error instanceof Error) { errorMsg = error.message; }
      setEmailSignInError(errorMsg);
    }
  };
  // --- End Email/Password Sign-In ---

  // --- Add Password Reset Function for Mobile ---
  const sendPasswordReset = async (email: string): Promise<void> => {
      setIsSendingPasswordReset(true);
      setPasswordResetError(null);
      setPasswordResetSent(false);
      try {
          console.log(`[AUTH Context] Sending password reset email to ${email}...`);
          await auth().sendPasswordResetEmail(email);
          console.log('[AUTH Context] Password reset email sent.');
          setPasswordResetSent(true);
      } catch (error: unknown) {
          console.error('[AUTH Context ERROR] Password Reset Error:', error);
          let errorMsg = 'An unexpected error occurred sending reset email.';
          if (isFirebaseError(error)) {
              if (error.code === 'auth/invalid-email') { errorMsg = 'Invalid email address.'; }
              else if (error.code === 'auth/user-not-found') { errorMsg = 'No user found with this email.'; }
              else { errorMsg = error.message || 'Failed to send reset email.'; }
          } else if (error instanceof Error) { errorMsg = error.message; }
          setPasswordResetError(errorMsg);
      } finally {
          setIsSendingPasswordReset(false);
      }
  };
  // --- End Password Reset ---

  // --- Add Delete Account Function for Mobile ---
  const deleteAccount = async (): Promise<boolean> => {
      setIsDeletingAccount(true);
      setDeleteAccountError(null);
      try {
          const currentUser = auth().currentUser;
          if (!currentUser) {
              throw new Error('No user is currently logged in.');
          }

          // Get Firebase ID token
          const idToken = await currentUser.getIdToken(true);
          
          // Determine base URL the same way as in api.ts
          const isDevelopment = __DEV__;
          const baseUrl = isDevelopment
              ? (process.env.EXPO_PUBLIC_STAGING_BACKEND_URL || 'https://socratic-questioner-dev.onrender.com')
              : (process.env.EXPO_PUBLIC_PRODUCTION_BACKEND_URL || 'https://socratic-questioner.onrender.com');
          
          // Call backend API to delete account
          const response = await fetch(`${baseUrl}/auth/delete_account`, {
              method: 'DELETE',
              headers: {
                  'Authorization': `Bearer ${idToken}`,
                  'Content-Type': 'application/json',
              },
          });

          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Failed to delete account');
          }

          console.log('[AUTH Context] Account deleted successfully from backend');
          
          // Sign out the user after successful deletion
          await signOut();
          
          return true;
      } catch (error: unknown) {
          console.error('[AUTH Context ERROR] Delete Account Error:', error);
          let errorMsg = 'An unexpected error occurred while deleting your account.';
          if (error instanceof Error) {
              errorMsg = error.message;
          }
          setDeleteAccountError(errorMsg);
          return false;
      } finally {
          setIsDeletingAccount(false);
      }
  };
  // --- End Delete Account ---

  // Updated Sign Out Function
  const signOut = async () => { /* ... (same as before) ... */
    clearAuthErrors();
    setPasswordResetSent(false);
    const userToSignOut = auth().currentUser;
    setIsGuest(false);
    if (!userToSignOut) { setUser(null); if (initializing) setInitializing(false); return; }
    try {
      try { await GoogleSignin.signOut(); }
      catch (googleSignOutError: unknown) { /* ... */ }
      await auth().signOut();
    } catch (error: unknown) { console.error('[AUTH Context ERROR] Sign Out Error:', error); Alert.alert('Sign Out Failed'); }
  };

  // Function to set guest mode
  const continueAsGuest = () => { /* ... (same as before) ... */
      if (auth().currentUser) {
          signOut().then(() => { setUser(null); setIsGuest(true); clearAuthErrors(); setPasswordResetSent(false); if (initializing) setInitializing(false); });
      } else { setUser(null); setIsGuest(true); clearAuthErrors(); setPasswordResetSent(false); if (initializing) setInitializing(false); }
  };

  // Function to exit guest mode
  const exitGuestMode = () => { /* ... (same as before) ... */
      setIsGuest(false);
  };


  // Value provided to consuming components
  const value = {
    user,
    isGuest,
    initializing,
    isSigningIn,
    isRegistering,
    isLoggingIn, // <-- Provide
    isSendingPasswordReset, // <-- Provide
    isDeletingAccount, // <-- Provide
    signInError,
    registrationError,
    emailSignInError, // <-- Provide
    passwordResetError, // <-- Provide
    deleteAccountError, // <-- Provide
    passwordResetSent, // <-- Provide
    googleSignIn,
    signOut,
    continueAsGuest,
    exitGuestMode,
    registerWithEmail,
    signInWithEmail, // <-- Provide
    sendPasswordReset, // <-- Provide
    deleteAccount, // <-- Provide
    clearAuthErrors,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to easily consume the context
// export const useAuth = (): AuthContextType => { ... }; // Keep hook as is
