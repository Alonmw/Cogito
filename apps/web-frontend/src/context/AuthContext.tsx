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
    // AuthError, // Keep commented/removed
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile,
    sendEmailVerification, // <-- Need this
    sendPasswordResetEmail // <-- Need this
    // FirebaseError // Removed
} from "firebase/auth";

// Define the shape of the context data (matching mobile where possible)
interface AuthContextType {
  currentUser: FirebaseUser | null;
  isGuest: boolean;
  isLoading: boolean;
  isSigningIn: boolean; // Google Sign-In loading
  isRegistering: boolean;
  isLoggingIn: boolean; // Email/Password login loading
  isSendingPasswordReset: boolean; // <-- Add reset loading state
  signInError: string | null; // Google Sign-In error
  registrationError: string | null;
  emailSignInError: string | null;
  passwordResetError: string | null; // <-- Add reset error state
  passwordResetSent: boolean; // <-- Add reset success state
  googleSignIn: () => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>; // <-- Add reset function
  continueAsGuest: () => void;
  clearAuthErrors: () => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | null>(null!);

// Create the Provider component
interface AuthProviderProps {
  children: ReactNode;
}

// --- Updated Type Guard ---
// Helper function to check if an error looks like a FirebaseError (has code and message)
interface FirebaseErrorLike { code: string; message: string; }
function isFirebaseError(error: unknown): error is FirebaseErrorLike {
    return ( typeof error === 'object' && error !== null && 'code' in error && typeof (error as any).code === 'string' && 'message' in error && typeof (error as any).message === 'string' );
}
// --- End Updated Type Guard ---


export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSendingPasswordReset, setIsSendingPasswordReset] = useState(false); // <-- Add state
  const [signInError, setSignInError] = useState<string | null>(null);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [emailSignInError, setEmailSignInError] = useState<string | null>(null);
  const [passwordResetError, setPasswordResetError] = useState<string | null>(null); // <-- Add state
  const [passwordResetSent, setPasswordResetSent] = useState(false); // <-- Add state

  // Effect to listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("[Web Auth] Auth state changed. User:", user ? user.uid : null);
      setCurrentUser(user);
      if (user) { setIsGuest(false); }
      setIsSigningIn(false);
      setIsRegistering(false);
      setIsLoggingIn(false);
      setIsSendingPasswordReset(false); // <-- Reset state
      clearAuthErrors();
      setPasswordResetSent(false); // <-- Reset state
      if (isLoading) { setIsLoading(false); }
    }, (err: unknown) => {
        console.error("[Web Auth] Error in onAuthStateChanged:", err);
        setCurrentUser(null);
        setIsGuest(false);
        setIsLoading(false);
    });
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearAuthErrors = () => {
      setSignInError(null);
      setRegistrationError(null);
      setEmailSignInError(null);
      setPasswordResetError(null); // <-- Clear reset error
  };

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoggingIn(true);
    clearAuthErrors();
    setPasswordResetSent(false); // <-- Reset state
    setIsGuest(false);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: unknown) {
      console.error("[Web Auth] Email Login failed:", err);
      let errorMsg = 'An unexpected error occurred during login.';
      if (isFirebaseError(err)) {
          if (err.code === 'auth/invalid-email' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') { errorMsg = 'Invalid email or password.'; }
          else if (err.code === 'auth/user-disabled') { errorMsg = 'This user account has been disabled.'; }
          else { errorMsg = err.message || 'Login failed.'; }
      } else if (err instanceof Error) { errorMsg = err.message; }
      setEmailSignInError(errorMsg);
      setIsLoggingIn(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<void> => {
      setIsRegistering(true);
      clearAuthErrors();
      setPasswordResetSent(false); // <-- Reset state
      setIsGuest(false);
      try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const newUser = userCredential.user;

          // --- Send verification email ---
          if (newUser) {
              try {
                  await sendEmailVerification(newUser);
                  // Use web alert or a more sophisticated notification system
                  alert("Registration Successful! Please check your email to verify your address.");
              } catch (verificationError: unknown) {
                  console.error("[Web Auth] Failed to send verification email:", verificationError);
                  alert("Verification Email Failed. Could not send verification email, but your account was created.");
              }
          }
          // --- End verification email ---

          // Update profile display name
          if (newUser && name.trim()) {
              try {
                  await updateProfile(newUser, { displayName: name.trim() });
                  setCurrentUser(auth.currentUser);
              } catch (profileError: unknown) {
                  console.warn("[Web Auth] Could not update profile display name:", profileError);
              }
          }

      } catch (err: unknown) {
          console.error("[Web Auth] Email Register failed:", err);
          let errorMsg = 'An unexpected error occurred during registration.';
          if (isFirebaseError(err)) {
              if (err.code === 'auth/email-already-in-use') { errorMsg = 'Email already in use.'; }
              else if (err.code === 'auth/invalid-email') { errorMsg = 'Invalid email address.'; }
              else if (err.code === 'auth/weak-password') { errorMsg = 'Password too weak (min. 6 characters).'; }
              else { errorMsg = err.message || 'Registration failed.'; }
          } else if (err instanceof Error) { errorMsg = err.message; }
          setRegistrationError(errorMsg);
          setIsRegistering(false);
      }
  };

  const googleSignIn = async (): Promise<void> => {
      setIsSigningIn(true);
      clearAuthErrors();
      setPasswordResetSent(false); // <-- Reset state
      setIsGuest(false);
      try {
          const provider = new GoogleAuthProvider();
          await signInWithPopup(auth, provider);
      } catch (err: unknown) {
          console.error("[Web Auth] Google Sign In failed:", err);
          let errorMsg = 'An unexpected error occurred during Google Sign in.';
          if (isFirebaseError(err)) {
              if (err.code === 'auth/popup-closed-by-user') { errorMsg = 'Sign in cancelled (popup closed).'; }
              else if (err.code === 'auth/cancelled-popup-request') { errorMsg = 'Sign in cancelled (multiple popups).'; }
              else { errorMsg = err.message || 'Google Sign in failed.'; }
          } else if (err instanceof Error) { errorMsg = err.message; }
          setSignInError(errorMsg);
          setIsSigningIn(false);
      }
  };

  // --- Password Reset Function ---
  const sendPasswordReset = async (email: string): Promise<void> => {
      setIsSendingPasswordReset(true); // <-- Set loading state
      setPasswordResetError(null); // <-- Clear previous error
      setPasswordResetSent(false); // <-- Reset success state
      try {
          await sendPasswordResetEmail(auth, email);
          setPasswordResetSent(true); // <-- Set success state
      } catch (err: unknown) {
          console.error("[Web Auth] Password Reset failed:", err);
          let errorMsg = 'An unexpected error occurred sending reset email.';
          if (isFirebaseError(err)) {
              if (err.code === 'auth/invalid-email') { errorMsg = 'Invalid email address.'; }
              else if (err.code === 'auth/user-not-found') { errorMsg = 'No user found with this email.'; }
              else { errorMsg = err.message || 'Failed to send reset email.'; }
          } else if (err instanceof Error) { errorMsg = err.message; }
          setPasswordResetError(errorMsg); // <-- Set error state
      } finally {
          setIsSendingPasswordReset(false); // <-- Clear loading state
      }
  };
  // --- End Password Reset Function ---

  const logout = async (): Promise<void> => {
    clearAuthErrors();
    setPasswordResetSent(false); // <-- Reset state
    try { await signOut(auth); setIsGuest(false); }
    catch (err: unknown) { console.error("[Web Auth] Firebase Logout failed:", err); }
  };

  const continueAsGuest = () => {
      if (currentUser) { logout(); }
      else {
          setCurrentUser(null);
          setIsGuest(true);
          clearAuthErrors();
          setPasswordResetSent(false); // <-- Reset state
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
    isSendingPasswordReset, // <-- Provide reset loading state
    signInError,
    registrationError,
    emailSignInError,
    passwordResetError, // <-- Provide reset error state
    passwordResetSent, // <-- Provide reset success state
    googleSignIn,
    logout,
    register,
    login,
    sendPasswordReset, // <-- Provide reset function
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
