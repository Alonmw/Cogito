// src/components/Header.tsx
import React from 'react';

interface HeaderProps {
  isGuest: boolean;
  onLogout: () => void;
  // onClearChat: () => void; // Add later
}

const Header: React.FC<HeaderProps> = ({ isGuest, onLogout }) => {
  // TODO: Implement Clear Chat button logic later
  const handleClearChat = () => {
    console.log("Clear Chat TBD");
  };

  return (
    <header className="p-4 border-b border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-between items-center flex-shrink-0">
      {/* Apply traditional font to title */}
      <h1 className="text-lg font-serif font-bold text-gray-800 dark:text-gray-100">
        Socratic Partner
      </h1>
      <div className="flex items-center space-x-3">
        <button
          onClick={handleClearChat}
          className="text-sm bg-transparent border border-gray-500 text-gray-600 dark:border-gray-400 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 py-1 px-3 rounded transition duration-150"
        >
          Clear Chat
        </button>
        {!isGuest ? (
          <button
            onClick={onLogout}
            className="text-sm bg-red-500 hover:bg-red-700 text-white py-1 px-3 rounded transition duration-150"
          >
            Logout
          </button>
        ) : (
          <span className="text-sm text-gray-500 dark:text-gray-400">Guest Mode</span>
          // Optionally show Login/Register buttons here for guests
        )}
      </div>
    </header>
  );
};

export default Header;
