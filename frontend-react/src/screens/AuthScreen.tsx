// src/screens/AuthScreen.tsx
// v2: Implemented basic UI structure with Tailwind

import React, { useState } from 'react';

// Define props expected from App.tsx
interface AuthScreenProps {
  onLoginSuccess: () => void; // Called after successful login/register API call (later)
  onGuestContinue: () => void; // Called when guest button clicked
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess, onGuestContinue }) => {
  // State for input fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // TODO: Add state for potential errors or loading indicators

  // Placeholder submit handlers - later these will call the API service
  const handleLoginSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent default form submission
    console.log('Attempting login with:', { username, password });
    // --- TODO: Call API service loginUser(username, password) ---
    // If API call is successful:
    onLoginSuccess(); // For now, just trigger the view switch
  };

  const handleRegisterSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('Attempting registration with:', { username, password });
    // --- TODO: Call API service registerUser(username, password) ---
    // If API call is successful:
    // Optionally log them in automatically after registration
    onLoginSuccess(); // For now, just trigger the view switch
  };

  // Handler for the guest button
  const handleGuestClick = () => {
    onGuestContinue();
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 p-4">
      {/* Apply traditional font to title */}
      <h1 className="text-4xl font-serif font-bold text-gray-800 dark:text-gray-100 mb-10">
        Socratic Partner
      </h1>

      <div className="w-full max-w-sm bg-white dark:bg-gray-700 shadow-xl rounded-lg p-8">
        {/* Login Form (Example) */}
        <form onSubmit={handleLoginSubmit} className="mb-6">
          <h2 className="text-2xl font-sans font-semibold text-center text-gray-700 dark:text-gray-200 mb-6">Login</h2>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="login-username">
              Username
            </label>
            <input
              id="login-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-600 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-600 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {/* Add password requirements/forgot password link later */}
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
            >
              Sign In
            </button>
          </div>
        </form>

        {/* Separator or Link to Register */}
        <div className="text-center mb-6">
           {/* TODO: Add link/button to switch to Register form */}
           <p className="text-sm text-gray-600 dark:text-gray-400">Don't have an account? (Register form TBD)</p>
           {/* Placeholder Register Button - uses same form handler for now */}
           <form onSubmit={handleRegisterSubmit}>
             {/* Can reuse username/password state for simplicity now */}
             <button type="submit" className="mt-2 w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out">
                Temp Register Btn
             </button>
           </form>
        </div>


        {/* Continue as Guest */}
        <div className="text-center">
          <button
            onClick={handleGuestClick}
            className="w-full bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
          >
            Continue as Guest
          </button>
        </div>
      </div>

      {/* Footer or other elements if needed */}
      <p className="text-center text-gray-500 dark:text-gray-400 text-xs mt-8">
        &copy;2025 Socratic Partner. All rights reserved.
      </p>
    </div>
  );
};

export default AuthScreen;
