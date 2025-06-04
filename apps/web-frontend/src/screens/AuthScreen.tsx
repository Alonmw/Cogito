// src/screens/AuthScreen.tsx (Web Version)
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // Adjust path if needed

const googleLogoUri = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png';

const AuthScreen: React.FC = () => {
  const {
    googleSignIn, isSigningIn, signInError, continueAsGuest, register,
    isRegistering, registrationError, login, isLoggingIn, emailSignInError,
    sendPasswordReset, isSendingPasswordReset, passwordResetError,
    passwordResetSent, clearAuthErrors,
  } = useAuth();

  const [isLoginView, setIsLoginView] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => { clearAuthErrors(); }, [isLoginView, clearAuthErrors]);

  const authInProgress = isSigningIn || isRegistering || isLoggingIn || isSendingPasswordReset;

  // --- Form Submit Handlers ---
  const handleRegisterSubmit = (e: React.FormEvent) => { /* ... */
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) { alert("Missing Fields..."); return; }
    register(name, email, password);
  };
  const handleLoginSubmit = (e: React.FormEvent) => { /* ... */
    e.preventDefault();
    if (!email.trim() || !password.trim()) { alert("Missing Fields..."); return; }
    login(email, password);
  };
  const handleForgotPasswordClick = () => { /* ... */
    if (!email.trim()) { alert("Missing Email..."); return; }
    sendPasswordReset(email);
  };
  const toggleView = () => { /* ... */
    setIsLoginView(!isLoginView); setName(''); setEmail(''); setPassword(''); clearAuthErrors();
  };

  // Tailwind classes
  const inputClasses = "w-full px-4 py-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 disabled:opacity-50";
  const actionButtonClasses = "w-full px-4 py-3 mt-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-gray-800";
  const googleButtonClasses = "w-full px-4 py-3 mt-4 flex items-center justify-center border rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 dark:bg-gray-200 dark:border-gray-400 dark:hover:bg-gray-300";
  const googleButtonTextColor = "text-blue-600 dark:text-blue-700";
  const textColor = "text-gray-800 dark:text-gray-200";
  const linkColor = "text-blue-600 hover:underline dark:text-blue-400";
  const errorTextClass = "text-sm text-center text-red-600 mt-2"; // Combined error style
  const loadingTextClass = "text-sm text-center text-gray-600 dark:text-gray-400 mt-2"; // Loading style
  const successTextClass = "text-sm text-center text-green-600 dark:text-green-400 mt-2"; // Success style


  return (
    <div className={`flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 ${textColor}`}>
      <div className="w-full max-w-md p-8 space-y-4 bg-white rounded-lg shadow-md dark:bg-gray-800"> {/* Reduced space-y */}
        <h1 className="text-3xl font-bold text-center">Welcome to Cogito</h1>
        <p className="text-center text-gray-600 dark:text-gray-400">
          {isLoginView ? 'Sign in to your account' : 'Create a new account'}
        </p>

        {isLoginView ? (
          // --- Login Form ---
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* ... Inputs ... */}
            <div><input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required disabled={authInProgress} className={inputClasses} /></div>
            <div><input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required disabled={authInProgress} className={inputClasses} /></div>
            {/* Forgot Password & Feedback */}
            <div className="text-right text-sm">
              <button type="button" onClick={handleForgotPasswordClick} disabled={authInProgress || isSendingPasswordReset} className={`${linkColor} disabled:opacity-50 disabled:cursor-not-allowed`}>Forgot Password?</button>
            </div>
            {/* Password Reset Feedback (Conditional Render) */}
            {isSendingPasswordReset && <p className={loadingTextClass}>Sending reset email...</p>}
            {passwordResetSent && <p className={successTextClass}>Password reset email sent! Check your inbox.</p>}
            {passwordResetError && <p className={errorTextClass}>Error: {passwordResetError}</p>}

            {/* Login Button & Error */}
            <button type="submit" disabled={authInProgress} className={actionButtonClasses}>
              {isLoggingIn ? 'Logging In...' : 'Log In'}
            </button>
             {/* Login Feedback (Conditional Render) */}
            {isLoggingIn && <p className={loadingTextClass}>Logging in...</p>}
            {emailSignInError && <p className={errorTextClass}>Error: {emailSignInError}</p>}
          </form>
          // --- End Login Form ---
        ) : (
          // --- Registration Form ---
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
             {/* ... Inputs ... */}
             <div><input id="register-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required disabled={authInProgress} className={inputClasses} /></div>
             <div><input id="register-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required disabled={authInProgress} className={inputClasses} /></div>
             <div><input id="register-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (min. 6 characters)" required minLength={6} disabled={authInProgress} className={inputClasses} /></div>
            {/* Register Button & Error */}
            <button type="submit" disabled={authInProgress} className={actionButtonClasses}>
              {isRegistering ? 'Signing Up...' : 'Sign Up'}
            </button>
             {/* Registration Feedback (Conditional Render) */}
            {isRegistering && <p className={loadingTextClass}>Registering...</p>}
            {registrationError && <p className={errorTextClass}>Error: {registrationError}</p>}
          </form>
          // --- End Registration Form ---
        )}

        {/* OR Separator, Google, Guest (Login View Only) */}
        {isLoginView && (
          <>
            <div className="my-4 flex items-center justify-center"> {/* Reduced margin */}
              <span className="flex-grow block border-t border-gray-300 dark:border-gray-600"></span>
              <span className="mx-4 text-sm font-medium text-gray-500 dark:text-gray-400">OR</span>
              <span className="flex-grow block border-t border-gray-300 dark:border-gray-600"></span>
            </div>
            {/* Google Button & Error */}
            <button type="button" onClick={googleSignIn} disabled={authInProgress} className={`${googleButtonClasses} focus:ring-blue-500`}>
              <img src={googleLogoUri} alt="Google logo" className="w-5 h-5 mr-3" />
              <span className={`font-medium ${googleButtonTextColor}`}>Sign in with Google</span>
            </button>
             {/* Google Feedback (Conditional Render) */}
            {isSigningIn && <p className={loadingTextClass}>Signing in...</p>}
            {signInError && <p className={errorTextClass}>Error: {signInError}</p>}

            {/* Guest Button */}
            <div className="mt-4 text-center">
              <button type="button" onClick={continueAsGuest} disabled={authInProgress} className={`text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50`}>Continue as Guest</button>
            </div>
          </>
        )}

        {/* Toggle View Link */}
        <div className="mt-6 text-center">
          <button type="button" onClick={toggleView} disabled={authInProgress} className={`text-sm font-medium ${linkColor} disabled:opacity-50`}>
            {isLoginView ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AuthScreen;
