// src/App.tsx
// v5: Uses AuthContext fully, removes local state/props for auth

// Removed useState import
// Import screen components
import AuthScreen from './screens/AuthScreen';
import ChatScreen from './screens/ChatScreen';
// Import the useAuth hook
import { useAuth } from './context/AuthContext';

function App() {
  // Get ALL relevant state from context
  const { currentUser, isGuest, isLoading: isAuthLoading } = useAuth();

  // Determine if the chat interface should be shown
  // Show chat if Firebase user exists OR if guest mode is active via context
  const showChat = !!currentUser || isGuest;

  // Show main loading indicator while Firebase checks initial auth state
  if (isAuthLoading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Loading Authentication...
      </div>
    );
  }

  return (
    // Use a main container div
    <div className="flex flex-col h-screen bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
      {!showChat ? (
        // Show AuthScreen if not logged in AND not in guest mode
        // No props needed, AuthScreen uses the context
        <AuthScreen />
      ) : (
        // Show ChatScreen if logged in OR in guest mode
        // No props needed for auth/guest status, ChatScreen/Header use context
        <ChatScreen />
      )}
    </div>
  );
}

export default App;
