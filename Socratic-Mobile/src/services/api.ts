// src/services/api.ts
import auth from '@react-native-firebase/auth'; // Import Mobile Firebase auth
import { ApiClient, GetIdTokenFunction } from '@socratic/api-client'; // Import shared client and type

// --- Mobile-Specific Token Function ---
// Implements how the mobile app gets the Firebase ID token using @react-native-firebase/auth.
const getMobileIdToken: GetIdTokenFunction = async (): Promise<string | null> => {
  const currentUser = auth().currentUser; // Get user from RNFirebase
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


// --- Determine Environment and Base URL for Mobile ---
// Use __DEV__ global variable provided by React Native/Expo
const isDevelopment = __DEV__;
const environment = isDevelopment ? 'DEVELOPMENT' : 'PRODUCTION';
// Define URLs directly here or use EXPO_PUBLIC_ env vars if set up
const mobileBaseUrl = isDevelopment
    ? (process.env.EXPO_PUBLIC_STAGING_BACKEND_URL || 'https://socratic-questioner-dev.onrender.com') // Staging URL
    : (process.env.EXPO_PUBLIC_PRODUCTION_BACKEND_URL || 'https://socratic-questioner.onrender.com'); // Production URL
// --- End Environment/URL Determination ---


// --- Instantiate and Export Shared API Client ---
// Create a single instance of the ApiClient for the mobile app,
// providing the mobile-specific token function and the determined baseUrl.
const apiClientInstance = new ApiClient(getMobileIdToken, mobileBaseUrl);

export default apiClientInstance; // Export the configured instance

