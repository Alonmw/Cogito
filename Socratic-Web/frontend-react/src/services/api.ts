// src/services/api.ts (for Web Frontend)
// This file instantiates and exports the shared ApiClient for the web app.

import { auth } from '../firebaseConfig'; // Import web Firebase auth instance
import { ApiClient, GetIdTokenFunction } from '@socratic/api-client'; // Import shared client and type

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


// --- Determine Environment and Base URL for Web ---
// Use Vite's import.meta.env
// import.meta.env.PROD is true when running `vite build`
// import.meta.env.DEV is true when running `vite` (dev server)
const isProduction = import.meta.env.PROD;
// --- Removed unused environment variable ---
// const environment = isProduction ? 'PRODUCTION' : 'DEVELOPMENT';
// --- End Removed variable ---
// Define URLs directly here or use VITE_ env vars if set up
const webBaseUrl = isProduction
    ? (import.meta.env.VITE_PRODUCTION_BACKEND_URL || 'https://socratic-questioner.onrender.com') // Production URL
    : (import.meta.env.VITE_STAGING_BACKEND_URL || 'https://socratic-questioner-dev.onrender.com'); // Staging URL
// --- End Environment/URL Determination ---


// --- Instantiate and Export Shared API Client ---
// Create a single instance for the web app
// Pass the determined environment directly
const apiClientInstance = new ApiClient(getWebIdToken, webBaseUrl);

export default apiClientInstance; // Export the configured instance

