// src/services/api.ts
import axios from 'axios';
import auth from '@react-native-firebase/auth'; // Import Firebase auth
import { API_BASE_URL } from '@/src/constants/api'; // Adjust path if needed

// Define the structure for a message (can be shared in types/index.ts later)
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

// Configure Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Axios Request Interceptor to add Auth Token ---
apiClient.interceptors.request.use(
  async (config) => {
    // Check if the request requires authentication (e.g., based on URL or config flag)
    // For now, let's assume all POST requests to /api/dialogue require auth
    if (config.url === '/api/dialogue' && config.method === 'post') {
      const currentUser = auth().currentUser;
      if (currentUser) {
        try {
          console.log('[API Interceptor] Getting Firebase ID Token...');
          const idToken = await currentUser.getIdToken(); // Get token from Firebase user
          if (idToken) {
            console.log('[API Interceptor] Attaching Authorization header.');
            config.headers.Authorization = `Bearer ${idToken}`;
          } else {
            console.warn('[API Interceptor] No ID Token found for current user.');
          }
        } catch (error) {
          console.error('[API Interceptor] Error getting ID token:', error);
          // Handle error appropriately, maybe reject the request or sign out user
        }
      } else {
        console.warn('[API Interceptor] No current user found for authenticated request.');
        // Handle case where user should be logged in but isn't
      }
    }
    return config; // Return the modified config
  },
  (error) => {
    // Handle request error
    return Promise.reject(error);
  }
);
// --- End Interceptor ---


/**
 * Simple function to test connection to the backend root.
 */
export const checkBackendConnection = async (): Promise<string | null> => {
  try {
    const response = await apiClient.get('/');
    console.log('Backend connection successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error connecting to backend:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', error.response?.data || error.message);
    }
    return null;
  }
};

/**
 * Sends the conversation history to the backend API.
 * @param history - Array of message objects
 * @returns The AI's response text or null on error
 */
export const postDialogue = async (history: Message[]): Promise<string | null> => {
  try {
    console.log('[API Service] Sending dialogue history:', history);
    // Send only necessary data (e.g., sender and text) if backend expects that format
    const payload = { history: history.map(msg => ({ role: msg.sender, content: msg.text })) };

    const response = await apiClient.post<{ response: string }>('/api/dialogue', payload);

    console.log('[API Service] Received dialogue response:', response.data);
    if (response.data && response.data.response) {
      return response.data.response;
    } else {
      console.error('[API Service] Invalid response format from backend:', response.data);
      return null;
    }
  } catch (error) {
    console.error('[API Service] Error posting dialogue:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', error.response?.status, error.response?.data || error.message);
      // Handle specific backend errors (e.g., 401 Unauthorized, 403 Forbidden)
      if (error.response?.status === 401 || error.response?.status === 403) {
         // Maybe trigger sign out or show specific message
         console.error("Authentication error calling backend. Token might be invalid or expired.");
      }
    }
    return null;
  }
};

