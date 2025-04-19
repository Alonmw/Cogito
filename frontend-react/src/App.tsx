// src/App.tsx
import { useState } from 'react';
// Import screen components (we'll create these next)
import AuthScreen from './screens/AuthScreen';
import ChatScreen from './screens/ChatScreen';
// Remove the App.css import if you deleted the file
// import './App.css'

function App() {
  // State to track login status
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  // State to track if user chose to continue as guest
  const [isGuest, setIsGuest] = useState<boolean>(false);

  // Function to handle successful login (will be passed to AuthScreen)
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setIsGuest(false); // Ensure guest mode is off if logged in
    console.log('User logged in');
    // In a real app, you'd likely store the token here
  };

  // Function to handle continuing as guest (will be passed to AuthScreen)
  const handleGuestContinue = () => {
    setIsGuest(true);
    setIsLoggedIn(false); // Ensure logged in is off if guest
    console.log('Continuing as guest');
  };

  // Function to handle logout (will be passed to ChatScreen)
  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsGuest(false); // Reset both on logout
    console.log('User logged out');
    // In a real app, you'd clear stored tokens here
  };

  // Determine if the chat interface should be shown
  const showChat = isLoggedIn || isGuest;

  return (
    // Use a main container div - apply global layout classes here if needed
    // e.g., using Tailwind for full height flex column layout
    <div className="flex flex-col h-screen bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
      {!showChat ? (
        // Show AuthScreen if not logged in and not a guest
        <AuthScreen
          onLoginSuccess={handleLoginSuccess}
          onGuestContinue={handleGuestContinue}
        />
      ) : (
        // Show ChatScreen if logged in OR continued as guest
        <ChatScreen
          isGuest={isGuest} // Pass guest status to ChatScreen
          onLogout={handleLogout} // Pass logout handler
        />
      )}
    </div>
  );
}

export default App;
