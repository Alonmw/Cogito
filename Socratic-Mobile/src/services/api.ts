// src/services/api.ts
import auth from '@react-native-firebase/auth';
import { ApiClient, GetIdTokenFunction } from '@socratic/api-client';

// --- Mobile-Specific Token Function ---
const getMobileIdToken: GetIdTokenFunction = async (): Promise<string | null> => {
  const currentUser = auth().currentUser;
  if (!currentUser) {
    console.warn('[getMobileIdToken] No current user found.');
    return null;
  }
  try {
    console.log('[getMobileIdToken] Attempting to get Firebase ID Token...');
    const idToken = await currentUser.getIdToken(true); // Pass true to force refresh
    if (idToken) {
        console.log('[getMobileIdToken] Successfully got ID Token (first 15 chars):', idToken.substring(0, 15) + "...");
    } else {
        console.warn('[getMobileIdToken] currentUser.getIdToken() returned null or undefined.');
    }
    return idToken;
  } catch (error) {
    console.error('[getMobileIdToken] Error getting ID token:', error);
    return null;
  }
};
// --- End Token Function ---


// --- Determine Environment and Base URL for Mobile ---
const isDevelopment = __DEV__;
const environment = isDevelopment ? 'DEVELOPMENT' : 'PRODUCTION';
const mobileBaseUrl = isDevelopment
    ? (process.env.EXPO_PUBLIC_STAGING_BACKEND_URL || 'https://socratic-questioner-dev.onrender.com')
    : (process.env.EXPO_PUBLIC_PRODUCTION_BACKEND_URL || 'https://socratic-questioner.onrender.com');
// --- End Environment/URL Determination ---


// --- Instantiate and Export Shared API Client ---
const apiClientInstance = new ApiClient(getMobileIdToken, mobileBaseUrl);

export default apiClientInstance;

