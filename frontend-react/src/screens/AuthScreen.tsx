// src/screens/AuthScreen.tsx
// v5: Uses useAuth hook fully, removed props

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext'; // Import useAuth hook

// No props needed from App.tsx anymore
// interface AuthScreenProps {
//   onGuestContinue: () => void;
// }

const AuthScreen: React.FC = () => {
  // Get functions and state from context
  const { login, register, continueAsGuest, isLoading, error: authError } = useAuth();

  // State for input fields remains local
  const [username, setUsername] = useState(''); // Assuming email is used as username for Firebase
  const [password, setPassword] = useState('');
  // Local error state for form validation (optional)
  const [formError, setFormError] = useState<string | null>(null);

  const handleLoginSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    if (!username || !password) {
        setFormError("Email and password are required."); // Changed to Email
        return;
    }
    console.log('Attempting login via context with:', { username, password });
    const success = await login(username, password); // username is email here
    if (success) { console.log("Login successful (handled by context)"); }
    else { console.log("Login failed (handled by context)"); }
  };

  const handleRegisterSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    if (!username || !password) {
        setFormError("Email and password are required."); // Changed to Email
        return;
    }
    if (password.length < 8) { // Firebase default is 6, but keep 8 for consistency? Or lower?
        setFormError("Password must be at least 8 characters long.");
        return;
    }
    console.log('Attempting registration via context with:', { username, password });
    const success = await register(username, password); // username is email here
    if (success) {
      alert('Registration successful! You are now logged in.'); // Firebase logs in automatically
      // No need to call login, context state updates via onAuthStateChanged
      setUsername(''); setPassword(''); // Clear form
    } else {
       console.log("Registration failed (handled by context)");
    }
  };

  // Handler for the guest button uses context function directly
  const handleGuestClick = () => {
    setFormError(null);
    continueAsGuest(); // Call context function
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 p-4">
      <h1 className="text-4xl font-serif font-bold text-gray-800 dark:text-gray-100 mb-10">
        Socratic Partner
      </h1>

      <div className="w-full max-w-sm bg-white dark:bg-gray-700 shadow-xl rounded-lg p-8">
        {/* Display Combined Errors */}
        {(formError || authError) && (
            <p className="text-red-500 text-xs italic mb-4 text-center">
                {formError || authError}
            </p>
        )}

        {/* Combined Login/Register Form */}
        {/* Using email for Firebase Auth */}
        <form onSubmit={handleLoginSubmit} className="mb-6">
          <h2 className="text-2xl font-sans font-semibold text-center text-gray-700 dark:text-gray-200 mb-6">Login / Register</h2>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="auth-email">
              Email
            </label>
            <input
              id="auth-email"
              type="email" // Use email type
              value={username} // Still using 'username' state var, but it's for email
              onChange={(e) => { setUsername(e.target.value); setFormError(null); }}
              placeholder="Enter your email"
              required
              disabled={isLoading}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-600 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="auth-password">
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setFormError(null); }}
              placeholder="Enter your password (min 6 chars for Firebase)" // Firebase default min is 6
              required
              disabled={isLoading}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-600 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center justify-between space-x-2">
            {/* Login Button */}
            <button type="submit" disabled={isLoading} className="flex-1 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out disabled:opacity-50">
              {isLoading ? 'Working...' : 'Sign In'}
            </button>
            {/* Register Button */}
             <button
              type="button"
              onClick={(e) => handleRegisterSubmit(e as any)} // Call register handler
              disabled={isLoading}
              className="flex-1 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out disabled:opacity-50"
            >
              {isLoading ? 'Working...' : 'Register'}
            </button>
          </div>
        </form>

        {/* Continue as Guest */}
        <div className="text-center mt-6 border-t pt-6 dark:border-gray-600">
          <button onClick={handleGuestClick} disabled={isLoading} className="w-full bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out disabled:opacity-50">
            Continue as Guest
          </button>
        </div>
      </div>

      <p className="text-center text-gray-500 dark:text-gray-400 text-xs mt-8">
        &copy;2025 Socratic Partner. All rights reserved.
      </p>
    </div>
  );
};

export default AuthScreen;
