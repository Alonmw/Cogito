// src/services/api.ts
// This file will now be responsible for instantiating and exporting
// the shared ApiClient for the mobile app.

import auth from '@react-native-firebase/auth'; // Needed for mobile token function
import { ApiClient, GetIdTokenFunction } from '@socratic/api-client'; // Import shared client and type
// Import shared types if needed directly (though often used via ApiClient methods)
// import { ApiHistoryMessage } from '@socratic/common-types';

// --- Mobile-Specific Token Function ---
// This function implements how the mobile app gets the Firebase ID token.
const getMobileIdToken: GetIdTokenFunction = async (): Promise<string | null> => {
  const currentUser = auth().currentUser;
  if (!currentUser) {
    console.warn('[getMobileIdToken] No current user found.');
    return null;
  }
  try {
    // console.log('[getMobileIdToken] Getting Firebase ID Token...');
    const idToken = await currentUser.getIdToken(); // Get token from Firebase user
    return idToken;
  } catch (error) {
    console.error('[getMobileIdToken] Error getting ID token:', error);
    return null;
  }
};
// --- End Token Function ---


// --- Determine Environment ---
// TODO: Implement a proper way to determine environment (e.g., using build variants or env variables)
// For now, default to DEVELOPMENT. Use EXPO_PUBLIC_ prefix for env vars.
const environment = process.env.EXPO_PUBLIC_APP_ENV === 'production' ? 'PRODUCTION' : 'DEVELOPMENT';
// --- End Environment ---


// --- Instantiate and Export Shared API Client ---
// Create a single instance of the ApiClient for the mobile app,
// providing the mobile-specific token function and environment.
const apiClientInstance = new ApiClient(getMobileIdToken, environment);

export default apiClientInstance; // Export the configured instance

// --- Removed Old Mobile-Specific Code ---
// - Removed local ApiHistoryMessage interface (now in @socratic/common-types)
// - Removed local Axios instance setup (now inside ApiClient)
// - Removed local Axios interceptor (now inside ApiClient, uses provided getToken function)
// - Removed local checkBackendConnection function (now a method on ApiClient)
// - Removed local postDialogue function (now a method on ApiClient)
// --- End Removed Code ---

