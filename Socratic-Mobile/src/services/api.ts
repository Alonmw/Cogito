// src/services/api.ts
import axios from 'axios';
import auth from '@react-native-firebase/auth'; // Import Firebase auth
import { API_BASE_URL } from '@/src/constants/api'; // Adjust path if needed

// Define the structure the backend expects in the history array
interface ApiHistoryMessage {
  role: 'user' | 'assistant' | 'system'; // Add system if needed
  content: string;
}

// Define the structure for GiftedChat message (if needed elsewhere, or import from types)
// interface Message {
//   id: string;
//   text: string;
//   sender: 'user' | 'assistant';
//   timestamp: Date;
// }

// Configure Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Axios Request Interceptor to add Auth Token (Keep as is) ---
apiClient.interceptors.request.use(
  async (config) => {
    if (config.url === '/api/dialogue' && config.method === 'post') {
      const currentUser = auth().currentUser;
      if (currentUser) {
        try {
          console.log('[API Interceptor] Getting Firebase ID Token...');
          const idToken = await currentUser.getIdToken();
          if (idToken) {
            console.log('[API Interceptor] Attaching Authorization header.');
            config.headers.Authorization = `Bearer ${idToken}`;
          } else {
            console.warn('[API Interceptor] No ID Token found for current user.');
          }
        } catch (error) {
          console.error('[API Interceptor] Error getting ID token:', error);
        }
      } else {
        console.warn('[API Interceptor] No current user found for authenticated request.');
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
// --- End Interceptor ---


/**
 * Simple function to test connection to the backend root.
 */
export const checkBackendConnection = async (): Promise<string | null> => {
  // ... (Keep as is) ...
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
 * Sends the conversation history (already formatted) to the backend API.
 * @param history - Array of message objects with { role, content }
 * @returns The AI's response text or null on error
 */
// --- Updated function signature and logic ---
export const postDialogue = async (history: ApiHistoryMessage[]): Promise<string | null> => {
  // Log the history received from ChatScreen
  console.log('[API Service] postDialogue received history:', JSON.stringify(history, null, 2));
  try {
    // The history is already formatted correctly by mapToApiHistory in ChatScreen
    // Just wrap it in the 'history' key for the payload
    const payload = { history: history };
    console.log('[API Service] Sending payload to backend:', JSON.stringify(payload, null, 2));

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
      if (error.response?.status === 401 || error.response?.status === 403) {
         console.error("Authentication error calling backend. Token might be invalid or expired.");
      }
    }
    return null;
  }
};
// --- End Update ---
