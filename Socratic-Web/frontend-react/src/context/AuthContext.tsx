// src/context/AuthContext.tsx (Web Version)
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
// Import Firebase auth instance and JS SDK functions
import { auth } from '../firebaseConfig'; // Assuming firebaseConfig initializes Firebase JS SDK
import {
    User as FirebaseUser,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile,
    sendEmailVerification,
    sendPasswordResetEmail,
    // FirebaseError // <-- Removed unused/incorrect import
} from "firebase/auth";

// Define the shape of the context data (matching mobile where possible)
interface AuthContextType {
  currentUser: FirebaseUser | null;
  isGuest: boolean;
  isLoading: boolean;
  isSigningIn: boolean; // Google Sign-In loading
  isRegistering: boolean;
  isLoggingIn: boolean; // Email/Password login loading
  isSendingPasswordReset: boolean;
  signInError: string | null; // Google Sign-In error
  registrationError: string | null;
  emailSignInError: string | null;
  passwordResetError: string | null;
  passwordResetSent: boolean;
  googleSignIn: () => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  continueAsGuest: () => void;
  clearAuthErrors: () => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | null>(null);

// Create the Provider component
interface AuthProviderProps {
  children: ReactNode;
}

// --- Updated Type Guard ---
// Helper function to check if an error looks like a FirebaseError (has code and message)
// We don't need to import FirebaseError directly
function isFirebaseError(error: unknown): error is { code: string; message: string } {
    return typeof error === 'object' && error !== null && 'code' in error && typeof (error as any).code === 'string' && 'message' in error && typeof (error as any).message === 'string';
}
// --- End Updated Type Guard ---


export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSendingPasswordReset, setIsSendingPasswordReset] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [emailSignInError, setEmailSignInError] = useState<string | null>(null);
  const [passwordResetError, setPasswordResetError] = useState<string | null>(null);
  const [passwordResetSent, setPasswordResetSent] = useState(false);

  // Effect to listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("[Web Auth] Auth state changed. User:", user ? user.uid : null);
      setCurrentUser(user);
      if (user) { setIsGuest(false); }
      setIsSigningIn(false);
      setIsRegistering(false);
      setIsLoggingIn(false);
      setIsSendingPasswordReset(false);
      clearAuthErrors();
      setPasswordResetSent(false);
      if (isLoading) { setIsLoading(false); }
    }, (err: unknown) => { // Catch listener error as unknown
        console.error("[Web Auth] Error in onAuthStateChanged:", err);
        setCurrentUser(null);
        setIsGuest(false);
        setIsLoading(false);
        // Optionally set a generic error state here if needed
    });
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearAuthErrors = () => {
      setSignInError(null);
      setRegistrationError(null);
      setEmailSignInError(null);
      setPasswordResetError(null);
  };

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoggingIn(true);
    clearAuthErrors();
    setPasswordResetSent(false);
    setIsGuest(false);
    try {
      console.log("[Web Auth] Attempting Email/Password Sign In...");
      await signInWithEmailAndPassword(auth, email, password);
      console.log("[Web Auth] Email/Password Sign In successful.");
    } catch (err: unknown) { // Catch as unknown
      console.error("[Web Auth] Email Login failed:", err);
      // Use the updated type guard
      if (isFirebaseError(err)) {
          if (err.code === 'auth/invalid-email' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
              setEmailSignInError('Invalid email or password.');
          } else if (err.code === 'auth/user-disabled') {
              setEmailSignInError('This user account has been disabled.');
          } else {
              setEmailSignInError(err.message || 'Login failed.');
          }
      } else {
           setEmailSignInError('An unexpected error occurred during login.');
      }
      setIsLoggingIn(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<void> => {
      setIsRegistering(true);
      clearAuthErrors();
      setPasswordResetSent(false);
      setIsGuest(false);
      try {
          console.log("[Web Auth] Attempting Email/Password Registration...");
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          console.log("[Web Auth] User account created & signed in!");
          const newUser = userCredential.user;

          // Send verification email
          if (newUser) {
              try {
                  await sendEmailVerification(newUser);
                  alert("Registration Successful! Please check your email to verify your address.");
              } catch (verificationError: unknown) { // Catch as unknown
                  console.error("[Web Auth] Failed to send verification email:", verificationError);
                  alert("Verification Email Failed. Could not send verification email, but your account was created.");
              }
          }

          // Update profile display name
          if (newUser && name.trim()) {
              try {
                  await updateProfile(newUser, { displayName: name.trim() });
                  setCurrentUser(auth.currentUser);
              } catch (profileError: unknown) { // Catch as unknown
                  console.warn("[Web Auth] Could not update profile display name:", profileError);
              }
          }

      } catch (err: unknown) { // Catch as unknown
          console.error("[Web Auth] Email Register failed:", err);
          // Use the updated type guard
          if (isFirebaseError(err)) {
              if (err.code === 'auth/email-already-in-use') { setRegistrationError('Email already in use.'); }
              else if (err.code === 'auth/invalid-email') { setRegistrationError('Invalid email address.'); }
              else if (err.code === 'auth/weak-password') { setRegistrationError('Password too weak (min. 6 characters).'); }
              else { setRegistrationError(err.message || 'Registration failed.'); }
          } else {
              setRegistrationError('An unexpected error occurred during registration.');
          }
          setIsRegistering(false);
      }
  };

  const googleSignIn = async (): Promise<void> => {
      setIsSigningIn(true);
      clearAuthErrors();
      setPasswordResetSent(false);
      setIsGuest(false);
      try {
          console.log("[Web Auth] Attempting Google Sign In...");
          const provider = new GoogleAuthProvider();
          await signInWithPopup(auth, provider);
          console.log("[Web Auth] Google Sign In successful (popup closed).");
      } catch (err: unknown) { // Catch as unknown
          console.error("[Web Auth] Google Sign In failed:", err);
          // Use the updated type guard
          if (isFirebaseError(err)) {
              if (err.code === 'auth/popup-closed-by-user') { setSignInError('Sign in cancelled (popup closed).'); }
              else if (err.code === 'auth/cancelled-popup-request') { setSignInError('Sign in cancelled (multiple popups).'); }
              else { setSignInError(err.message || 'Google Sign in failed.'); }
          } else {
               setSignInError('An unexpected error occurred during Google Sign in.');
          }
          setIsSigningIn(false);
      }
  };

  const sendPasswordReset = async (email: string): Promise<void> => {
      setIsSendingPasswordReset(true);
      setPasswordResetError(null);
      setPasswordResetSent(false);
      try {
          console.log(`[Web Auth] Sending password reset email to ${email}...`);
          await sendPasswordResetEmail(auth, email);
          console.log('[Web Auth] Password reset email sent.');
          setPasswordResetSent(true);
      } catch (err: unknown) { // Catch as unknown
          console.error("[Web Auth] Password Reset failed:", err);
          // Use the updated type guard
          if (isFirebaseError(err)) {
              if (err.code === 'auth/invalid-email') { setPasswordResetError('Invalid email address.'); }
              else if (err.code === 'auth/user-not-found') { setPasswordResetError('No user found with this email.'); }
              else { setPasswordResetError(err.message || 'Failed to send reset email.'); }
          } else {
              setPasswordResetError('An unexpected error occurred sending reset email.');
          }
      } finally {
          setIsSendingPasswordReset(false);
      }
  };

  const logout = async (): Promise<void> => {
    clearAuthErrors();
    setPasswordResetSent(false);
    try {
        console.log("[Web Auth] Attempting Firebase Logout...");
        await signOut(auth);
        console.log("[Web Auth] Firebase Logout successful.");
        setIsGuest(false);
    } catch (err: unknown) { // Catch as unknown
         console.error("[Web Auth] Firebase Logout failed:", err);
         // Optionally set a generic error state if needed
    }
  };

  // Function to handle guest mode entry
  const continueAsGuest = () => {
      console.log("[Web Auth] Continuing as guest.");
      if (currentUser) {
          logout();
      } else {
          setCurrentUser(null);
          setIsGuest(true);
          clearAuthErrors();
          setPasswordResetSent(false);
          setIsLoading(false);
      }
  };


  // Value provided to consuming components
  const value = {
    currentUser,
    isGuest,
    isLoading,
    isSigningIn,
    isRegistering,
    isLoggingIn,
    isSendingPasswordReset,
    signInError,
    registrationError,
    emailSignInError,
    passwordResetError,
    passwordResetSent,
    googleSignIn,
    logout,
    register,
    login,
    sendPasswordReset,
    continueAsGuest,
    clearAuthErrors,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to easily consume the context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
