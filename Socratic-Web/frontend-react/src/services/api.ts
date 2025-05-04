// src/services/api.ts (for Web Frontend)
// This file instantiates and exports the shared ApiClient for the web app.

import { auth } from '../firebaseConfig'; // Import web Firebase auth instance
import { ApiClient, GetIdTokenFunction } from '@socratic/api-client'; // Import shared client and type
// Import shared types if needed directly
// import { ApiHistoryMessage } from '@socratic/common-types';

// --- Web-Specific Token Function ---
// Implements how the web app gets the Firebase ID token using the JS SDK.
const getWebIdToken: GetIdTokenFunction = async (): Promise<string | null> => {
  const currentUser = auth.currentUser; // Get user from JS SDK
  if (!currentUser) {
    console.warn('[getWebIdToken] No current user found.');
    return null;
  }
  try {
    // console.log('[getWebIdToken] Getting Firebase ID Token...');
    const idToken = await currentUser.getIdToken(); // Get token from Firebase user
    return idToken;
  } catch (error) {
    console.error('[getWebIdToken] Error getting ID token:', error);
    return null;
  }
};
// --- End Token Function ---


// --- Determine Environment ---
// Use Vite's environment variables (import.meta.env)
// Ensure you have VITE_APP_ENV set in your .env files (e.g., VITE_APP_ENV=production)
// Or use import.meta.env.PROD which is true for production builds
const environment = import.meta.env.PROD ? 'PRODUCTION' : 'DEVELOPMENT';
// --- End Environment ---


// --- Instantiate and Export Shared API Client ---
// Create a single instance for the web app
const apiClientInstance = new ApiClient(getWebIdToken, environment);

export default apiClientInstance; // Export the configured instance

