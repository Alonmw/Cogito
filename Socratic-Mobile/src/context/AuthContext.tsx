import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { Alert } from 'react-native';

// Define the shape of the context value
interface AuthContextType {
  user: FirebaseAuthTypes.User | null;
  isGuest: boolean;
  initializing: boolean;
  isSigningIn: boolean; // Google Sign-In loading
  isRegistering: boolean;
  isLoggingIn: boolean;
  isSendingPasswordReset: boolean; // <-- Add reset loading state
  signInError: string | null; // Google Sign-In error
  registrationError: string | null;
  emailSignInError: string | null;
  passwordResetError: string | null; // <-- Add reset error state
  passwordResetSent: boolean; // <-- Add reset success state
  googleSignIn: () => Promise<void>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
  registerWithEmail: (name: string, email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>; // <-- Add reset function
  clearAuthErrors: () => void; // <-- Add function to clear errors manually
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
  const [isGuest, setIsGuest] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSendingPasswordReset, setIsSendingPasswordReset] = useState(false); // <-- Add state
  const [signInError, setSignInError] = useState<string | null>(null); // Google specific
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [emailSignInError, setEmailSignInError] = useState<string | null>(null);
  const [passwordResetError, setPasswordResetError] = useState<string | null>(null); // <-- Add state
  const [passwordResetSent, setPasswordResetSent] = useState(false); // <-- Add state

  // Firebase Auth State Listener
  useEffect(() => {
    const subscriber = auth().onAuthStateChanged((user) => {
      console.log('[AUTH Context] Firebase Auth State Changed:', user ? user.uid : null);
      setUser(user);
      if (user) {
        setIsGuest(false);
      }
      if (initializing) setInitializing(false);
      // Reset loading/error states on auth change
      setIsSigningIn(false);
      setIsRegistering(false);
      setIsLoggingIn(false);
      setIsSendingPasswordReset(false);
      clearAuthErrors(); // Clear errors on auth change
      setPasswordResetSent(false); // Reset success message
    });
    return subscriber;
  }, [initializing]);

  // --- Function to clear all auth errors ---
  const clearAuthErrors = () => {
      setSignInError(null);
      setRegistrationError(null);
      setEmailSignInError(null);
      setPasswordResetError(null);
  };
  // --- End Clear Errors ---

  // Google Sign-In Function
  const googleSignIn = async () => {
    setIsSigningIn(true);
    clearAuthErrors(); // Clear all errors
    setPasswordResetSent(false);
    setIsGuest(false);
    try {
      // ... (rest of googleSignIn logic) ...
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      await GoogleSignin.signIn();
      const { idToken } = await GoogleSignin.getTokens();
      if (!idToken) throw new Error("Google Sign-In getTokens() failed.");
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      await auth().signInWithCredential(googleCredential);
    } catch (error: any) {
      setIsSigningIn(false);
      console.error('[AUTH Context ERROR] Google Sign-In Error:', error);
       if (error.code === statusCodes.SIGN_IN_CANCELLED) { setSignInError('Sign in cancelled.'); }
       else if (error.code === statusCodes.IN_PROGRESS) { setSignInError('Sign in is already in progress.'); }
       else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) { setSignInError('Google Play Services not available or outdated.'); }
       else { setSignInError(`Sign in failed: ${error.message || error.code || 'Unknown error'}`); }
    }
  };

  // Email/Password Registration Function
  const registerWithEmail = async (name: string, email: string, password: string) => {
    setIsRegistering(true);
    clearAuthErrors();
    setPasswordResetSent(false);
    setIsGuest(false);
    try {
      console.log('[AUTH Context] Attempting Email/Password Registration...');
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      console.log('[AUTH Context] User account created & signed in!');

      const newUser = userCredential.user; // User is automatically signed in

      // --- Send Verification Email ---
      if (newUser) {
          try {
              console.log('[AUTH Context] Sending verification email...');
              await newUser.sendEmailVerification();
              console.log('[AUTH Context] Verification email sent.');
              // Optional: Set state to show "Verification email sent" message in UI
              Alert.alert("Registration Successful", "Account created! Please check your email to verify your address."); // Simple feedback for now
          } catch (verificationError) {
              console.error('[AUTH Context ERROR] Failed to send verification email:', verificationError);
              // Don't block login, just inform user if needed
              Alert.alert("Verification Email Failed", "Could not send verification email, but your account was created.");
          }
      }
      // --- End Send Verification ---

      // Update profile with display name
      if (newUser && name.trim()) {
        try {
            console.log('[AUTH Context] Updating user profile display name...');
            await newUser.updateProfile({ displayName: name.trim() });
            console.log('[AUTH Context] Profile updated.');
            // Manually update the user state immediately
            const updatedUser = auth().currentUser;
            if (updatedUser) setUser(updatedUser);
        } catch (profileError) {
            console.warn('[AUTH Context WARN] Could not update profile display name:', profileError);
        }
      }
      // User state also updated by listener eventually

    } catch (error: any) {
      setIsRegistering(false); // Reset on error
      console.error('[AUTH Context ERROR] Email Registration Error:', error);
      if (error.code === 'auth/email-already-in-use') { setRegistrationError('Email already in use.'); }
      else if (error.code === 'auth/invalid-email') { setRegistrationError('Invalid email address.'); }
      else if (error.code === 'auth/weak-password') { setRegistrationError('Password too weak (min. 6 characters).'); }
      else { setRegistrationError(`Registration failed: ${error.message || error.code || 'Unknown error'}`); }
    }
  };

  // Email/Password Sign-In Function
  const signInWithEmail = async (email: string, password: string) => {
    setIsLoggingIn(true);
    clearAuthErrors();
    setPasswordResetSent(false);
    setIsGuest(false);
    try {
      console.log('[AUTH Context] Attempting Email/Password Sign In...');
      await auth().signInWithEmailAndPassword(email, password);
      console.log('[AUTH Context] Email/Password Sign In successful.');
      // User state updated by listener
    } catch (error: any) {
      setIsLoggingIn(false); // Reset on error
      console.error('[AUTH Context ERROR] Email Sign In Error:', error);
      if (error.code === 'auth/invalid-email' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') { setEmailSignInError('Invalid email or password.'); }
      else if (error.code === 'auth/user-disabled') { setEmailSignInError('This user account has been disabled.'); }
      else { setEmailSignInError(`Login failed: ${error.message || error.code || 'Unknown error'}`); }
    }
  };

  // --- Password Reset Function ---
  const sendPasswordReset = async (email: string) => {
      setIsSendingPasswordReset(true);
      setPasswordResetError(null);
      setPasswordResetSent(false); // Reset success message
      try {
          console.log(`[AUTH Context] Sending password reset email to ${email}...`);
          await auth().sendPasswordResetEmail(email);
          console.log('[AUTH Context] Password reset email sent.');
          setPasswordResetSent(true); // Set success state
      } catch (error: any) {
          console.error('[AUTH Context ERROR] Password Reset Error:', error);
          if (error.code === 'auth/invalid-email') {
              setPasswordResetError('Invalid email address.');
          } else if (error.code === 'auth/user-not-found') {
              setPasswordResetError('No user found with this email address.');
          } else {
              setPasswordResetError(`Failed to send reset email: ${error.message || error.code || 'Unknown error'}`);
          }
      } finally {
          setIsSendingPasswordReset(false); // Reset loading state
      }
  };
  // --- End Password Reset Function ---


  // Sign Out Function
  const signOut = async () => {
    // ... (sign out logic remains the same) ...
     try {
      console.log('[AUTH Context] Attempting Google Sign Out...');
      try { await GoogleSignin.signOut(); console.log('[AUTH Context] Google Sign Out successful.'); }
      catch (googleSignOutError: any) { if (googleSignOutError.code !== statusCodes.SIGN_IN_REQUIRED) { console.warn('[AUTH Context] Non-critical Google Sign Out error:', googleSignOutError); } else { console.log('[AUTH Context] Google Sign Out skipped.'); } }
      console.log('[AUTH Context] Attempting Firebase Sign Out...');
      await auth().signOut();
      console.log('[AUTH Context] Firebase Sign Out successful.');
      setIsGuest(false);
    } catch (error: any) { console.error('[AUTH Context ERROR] Sign Out Error:', error); Alert.alert('Sign Out Failed', `An error occurred: ${error.message}`); }
  };

  // Function to set guest mode
  const continueAsGuest = () => {
      console.log('[AUTH Context] Continuing as Guest.');
      setUser(null);
      setIsGuest(true);
      clearAuthErrors(); // Clear all errors
      setPasswordResetSent(false);
      setInitializing(false);
  };


  // Value provided to consuming components
  const value = {
    user,
    isGuest,
    initializing,
    isSigningIn,
    isRegistering,
    isLoggingIn,
    isSendingPasswordReset, // <-- Provide reset loading state
    signInError, // Google specific
    registrationError,
    emailSignInError,
    passwordResetError, // <-- Provide reset error state
    passwordResetSent, // <-- Provide reset success state
    googleSignIn,
    signOut,
    continueAsGuest,
    registerWithEmail,
    signInWithEmail,
    sendPasswordReset, // <-- Provide reset function
    clearAuthErrors, // <-- Provide clear errors function
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
