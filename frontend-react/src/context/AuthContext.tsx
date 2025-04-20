// src/context/AuthContext.tsx
// v7: Removed incorrect setIsLoggedIn calls

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
// Import Firebase auth instance and functions
import { auth } from '../firebaseConfig';
import {
    User as FirebaseUser,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    AuthError,
    UserCredential
} from "firebase/auth";

// Define the shape of the context data
interface AuthContextType {
  currentUser: FirebaseUser | null;
  isGuest: boolean;
  isLoading: boolean;
  error: string | null;
  isLoggedIn: boolean; // Keep derived flag for convenience
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (email: string, password: string) => Promise<boolean>;
  continueAsGuest: () => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | null>(null);

// Create the Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Effect to listen for Firebase auth state changes
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed listener fired. User:", user ? user.uid : null);
      setCurrentUser(user);
      if (user) { setIsGuest(false); }
      if (isLoading) { setIsLoading(false); } // Only influence initial load
    }, (err) => {
        console.error("Error in onAuthStateChanged listener:", err);
        setCurrentUser(null);
        setIsGuest(false);
        setIsLoading(false);
        setError("Failed to initialize authentication state.");
    });
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Firebase signIn successful, userCredential:", userCredential.user?.uid);
      // Explicitly set state immediately for faster UI update
      setCurrentUser(userCredential.user);
      // setIsLoggedIn(true); // <-- REMOVED THIS LINE
      setIsGuest(false);
      setIsLoading(false);
      return true;
    } catch (err: any) {
      console.error("Firebase Login failed:", err);
      setError((err as AuthError).message || 'Login failed.');
      setIsLoading(false);
      return false;
    }
  };

  const register = async (email: string, password: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
          const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
          console.log("Firebase Registration successful, userCredential:", userCredential.user?.uid);
          // Explicitly set state immediately
          setCurrentUser(userCredential.user);
          // setIsLoggedIn(true); // <-- REMOVED THIS LINE
          setIsGuest(false);
          setIsLoading(false);
          return true;
      } catch (err: any) {
          console.error("Firebase Register failed:", err);
          setError((err as AuthError).message || 'Registration failed.');
          setIsLoading(false);
          return false;
      }
  };


  const logout = async (): Promise<void> => {
    setError(null);
    setIsLoading(true);
    try {
        await signOut(auth);
        // onAuthStateChanged will set currentUser to null
        setIsGuest(false);
        console.log("Firebase Logout successful.");
    } catch (err: any) {
         console.error("Firebase Logout failed:", err);
         setError((err as AuthError).message || 'Logout failed.');
    } finally {
        setIsLoading(false);
    }
  };

  // Function to handle guest mode entry
  const continueAsGuest = () => {
      console.log("Continuing as guest via context.");
      if (currentUser) { logout(); }
      setCurrentUser(null);
      setIsGuest(true);
      setError(null);
  };


  // Value provided to consuming components
  const isLoggedIn = !!currentUser; // Derived flag
  const value = {
    currentUser,
    isGuest,
    isLoading,
    error,
    isLoggedIn, // Provide derived boolean flag
    login,
    logout,
    register,
    continueAsGuest,
  };

  // Render children immediately, App.tsx handles global loading state now
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
