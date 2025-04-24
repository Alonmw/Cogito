    // src/services/api.ts
    import axios from 'axios'; // Or use fetch
    import { API_BASE_URL } from '../constants/api'; // Import base URL

    // Configure Axios instance (optional, but good practice)
    const apiClient = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        // We will add Authorization header logic later
      },
    });

    /**
     * Simple function to test connection to the backend root.
     * Replace with actual API calls later.
     */
    export const checkBackendConnection = async (): Promise<string | null> => {
      try {
        // Using Axios example:
        const response = await apiClient.get('/');
        console.log('Backend connection successful:', response.data);
        return response.data; // Should return "Backend is running!"

        /*
        // Using fetch example:
        const response = await fetch(API_BASE_URL + '/');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.text(); // Assuming root returns plain text
        console.log('Backend connection successful:', data);
        return data;
        */
      } catch (error) {
        console.error('Error connecting to backend:', error);
        // Handle specific error types if using Axios (e.g., error.response)
        if (axios.isAxiosError(error)) {
          console.error('Axios error details:', error.response?.data || error.message);
        }
        return null;
      }
    };

    // --- Add other API functions below ---
    // e.g., export const postDialogue = async (history) => { ... };
    // e.g., export const verifyGoogleToken = async (token) => { ... };

