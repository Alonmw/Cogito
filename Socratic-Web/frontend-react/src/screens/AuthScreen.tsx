// src/screens/AuthScreen.tsx (Web Version)
import React, { useState, useEffect } from 'react';
// Import the web version of useAuth
import { useAuth } from '../context/AuthContext'; // Adjust path if needed

// Reusing the logo URI
const googleLogoUri = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png';

const AuthScreen: React.FC = () => {
  // Get state and functions from the WEB AuthContext
  const {
    googleSignIn,
    isSigningIn,
    signInError, // Google specific error
    continueAsGuest,
    register, // Renamed from registerWithEmail in web context
    isRegistering,
    registrationError,
    login, // Renamed from signInWithEmail in web context
    isLoggingIn,
    emailSignInError,
    sendPasswordReset,
    isSendingPasswordReset,
    passwordResetError,
    passwordResetSent,
    clearAuthErrors,
  } = useAuth();

  // State for Login/Register toggle
  const [isLoginView, setIsLoginView] = useState(true);
  // State for form inputs
  const [name, setName] = useState(''); // Only for registration
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Clear errors when switching views
  useEffect(() => {
    clearAuthErrors();
  }, [isLoginView, clearAuthErrors]);

  // Determine if any auth action is in progress
  const authInProgress = isSigningIn || isRegistering || isLoggingIn || isSendingPasswordReset;

  // --- Form Submit Handlers ---
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    if (!name.trim() || !email.trim() || !password.trim()) {
      alert("Missing Fields: Please fill in all registration fields."); // Use web alert
      return;
    }
    register(name, email, password);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      alert("Missing Fields: Please enter email and password.");
      return;
    }
    login(email, password);
  };

  const handleForgotPasswordClick = () => {
    if (!email.trim()) {
      alert("Missing Email: Please enter your email address first.");
      return;
    }
    sendPasswordReset(email);
  };

  // Function to toggle between Login and Register views
  const toggleView = () => {
    setIsLoginView(!isLoginView);
    // Clear form fields when toggling
    setName('');
    setEmail('');
    setPassword('');
    clearAuthErrors();
  };

  // Common input field classes
  const inputClasses = "w-full px-4 py-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400";
  // Common action button classes
  const actionButtonClasses = "w-full px-4 py-3 mt-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-gray-800";
  // Google button classes
  const googleButtonClasses = "w-full px-4 py-3 mt-4 flex items-center justify-center border rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 dark:bg-gray-200 dark:border-gray-400 dark:hover:bg-gray-300";
  // Text color for Google button
  const googleButtonTextColor = "text-blue-600 dark:text-blue-700";
  // Base text color
  const textColor = "text-gray-800 dark:text-gray-200";
  // Link color
  const linkColor = "text-blue-600 hover:underline dark:text-blue-400";


  return (
    <div className={`flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 ${textColor}`}>
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h1 className="text-3xl font-bold text-center">Welcome to Socratic Partner</h1>
        <p className="text-center text-gray-600 dark:text-gray-400">
          {isLoginView ? 'Sign in to your account' : 'Create a new account'}
        </p>

        {/* --- Conditionally Render Login or Register Form --- */}
        {isLoginView ? (
          // --- Login Form ---
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="sr-only">Email</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                disabled={authInProgress}
                className={inputClasses}
              />
            </div>
            <div>
              <label htmlFor="login-password" className="sr-only">Password</label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                disabled={authInProgress}
                className={inputClasses}
              />
            </div>
            {/* Forgot Password Link & Feedback */}
            <div className="text-right text-sm">
              <button
                type="button" // Prevent form submission
                onClick={handleForgotPasswordClick}
                disabled={authInProgress || isSendingPasswordReset}
                className={`${linkColor} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Forgot Password?
              </button>
            </div>
            {isSendingPasswordReset && <p className="text-sm text-center text-gray-600 dark:text-gray-400">Sending reset email...</p>}
            {passwordResetSent && <p className="text-sm text-center text-green-600 dark:text-green-400">Password reset email sent! Check your inbox.</p>}
            {passwordResetError && <p className="text-sm text-center text-red-600">Error: {passwordResetError}</p>}
            {/* End Feedback */}

            <button
              type="submit"
              disabled={authInProgress}
              className={actionButtonClasses}
            >
              {isLoggingIn ? 'Logging In...' : 'Log In'}
            </button>
            {emailSignInError && <p className="mt-2 text-sm text-center text-red-600">Error: {emailSignInError}</p>}
          </form>
          // --- End Login Form ---
        ) : (
          // --- Registration Form ---
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label htmlFor="register-name" className="sr-only">Name</label>
              <input
                id="register-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                required
                disabled={authInProgress}
                className={inputClasses}
              />
            </div>
            <div>
              <label htmlFor="register-email" className="sr-only">Email</label>
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                disabled={authInProgress}
                className={inputClasses}
              />
            </div>
            <div>
              <label htmlFor="register-password" className="sr-only">Password</label>
              <input
                id="register-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (min. 6 characters)"
                required
                minLength={6}
                disabled={authInProgress}
                className={inputClasses}
              />
            </div>
            <button
              type="submit"
              disabled={authInProgress}
              className={actionButtonClasses}
            >
              {isRegistering ? 'Signing Up...' : 'Sign Up'}
            </button>
            {registrationError && <p className="mt-2 text-sm text-center text-red-600">Error: {registrationError}</p>}
          </form>
          // --- End Registration Form ---
        )}
        {/* --- End Conditional Render --- */}


        {/* --- OR Separator and Google/Guest options (only show in Login view) --- */}
        {isLoginView && (
          <>
            <div className="my-6 flex items-center justify-center">
              <span className="flex-grow block border-t border-gray-300 dark:border-gray-600"></span>
              <span className="mx-4 text-sm font-medium text-gray-500 dark:text-gray-400">OR</span>
              <span className="flex-grow block border-t border-gray-300 dark:border-gray-600"></span>
            </div>

            {/* Google Sign-In Button */}
            <button
              type="button"
              onClick={googleSignIn}
              disabled={authInProgress}
              className={`${googleButtonClasses} focus:ring-blue-500`}
            >
              <img src={googleLogoUri} alt="Google logo" className="w-5 h-5 mr-3" />
              <span className={`font-medium ${googleButtonTextColor}`}>
                Sign in with Google
              </span>
            </button>
            {isSigningIn && <p className="mt-2 text-sm text-center text-gray-600 dark:text-gray-400">Signing in...</p>}
            {signInError && <p className="mt-2 text-sm text-center text-red-600">Error: {signInError}</p>}

            {/* Continue as Guest Button/Link */}
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={continueAsGuest}
                disabled={authInProgress}
                className={`text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50`}
              >
                Continue as Guest
              </button>
            </div>
          </>
        )}
        {/* --- End OR Separator etc. --- */}


        {/* --- Toggle Login/Register View --- */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={toggleView}
            disabled={authInProgress}
            className={`text-sm font-medium ${linkColor} disabled:opacity-50`}
          >
            {isLoginView ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
          </button>
        </div>
        {/* --- End Toggle --- */}

      </div>
    </div>
  );
};

export default AuthScreen;
