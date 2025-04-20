// src/components/Header.tsx
// v3: Added onClearChat prop

import React from 'react';
import { useAuth } from '../context/AuthContext';

// Add onClearChat to props
interface HeaderProps {
  onClearChat: () => void;
}

const Header: React.FC<HeaderProps> = ({ onClearChat }) => { // Receive prop
  // Get state and functions from context
  const { currentUser, isGuest, logout } = useAuth(); // Use currentUser to check login status
  const isLoggedIn = !!currentUser; // Derive boolean

  // Use the passed prop for clearing chat
  // const handleClearChat = () => { console.log("Clear Chat TBD"); }; // Remove placeholder

  return (
    <header className="p-4 border-b border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-between items-center flex-shrink-0">
      <h1 className="text-lg font-serif font-bold text-gray-800 dark:text-gray-100">
        Socratic Partner
      </h1>
      <div className="flex items-center space-x-3">
        {/* Clear Chat button - now calls prop */}
        <button
          onClick={onClearChat} // Use the prop here
          className="text-sm bg-transparent border border-gray-500 text-gray-600 dark:border-gray-400 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 py-1 px-3 rounded transition duration-150"
        >
          Clear Chat
        </button>

        {/* Show Guest status or Logout button based on context state */}
        {isLoggedIn ? (
          <button
            onClick={logout}
            className="text-sm bg-red-500 hover:bg-red-700 text-white py-1 px-3 rounded transition duration-150"
          >
            Logout
          </button>
        ) : isGuest ? (
           <span className="text-sm text-gray-500 dark:text-gray-400">Guest Mode</span>
        ) : (
           // This state should ideally not be reachable if App logic is correct
           <span className="text-sm text-gray-500 dark:text-gray-400">Not Logged In</span>
        )}
      </div>
    </header>
  );
};

export default Header;

