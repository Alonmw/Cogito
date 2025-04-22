// src/services/api.ts
// v4: Added logic to get and send Firebase ID token

import { auth } from '../firebaseConfig'; // Import Firebase auth instance

// --- Configuration ---
const PRODUCTION_FRONTEND_HOSTNAME = "socratic-questioner.vercel.app";
const PRODUCTION_BACKEND_URL = "https://socratic-questioner.onrender.com"; // Base URL
// !!! IMPORTANT: Make sure this matches your actual staging backend URL !!!
const STAGING_BACKEND_URL = "https://socratic-questioner-dev.onrender.com";

let baseUrl: string;
if (typeof window !== 'undefined' && window.location.hostname === PRODUCTION_FRONTEND_HOSTNAME) {
    baseUrl = PRODUCTION_BACKEND_URL;
} else {
    baseUrl = STAGING_BACKEND_URL; // Default to staging for previews, local dev
}
console.log("API Service using base URL:", baseUrl);
// --- End Configuration ---


// Helper function for API requests
async function fetchApi(endpoint: string, options: RequestInit = {}, includeAuth: boolean = false) {
    const url = `${baseUrl}${endpoint}`;
    const defaultHeaders: HeadersInit = { // Use HeadersInit type
        'Content-Type': 'application/json',
    };

    // --- Add Authorization Header if needed and available ---
    if (includeAuth) {
        const currentUser = auth.currentUser; // Get current user from Firebase auth
        if (currentUser) {
            try {
                const idToken = await currentUser.getIdToken(); // Get Firebase ID Token
                defaultHeaders['Authorization'] = `Bearer ${idToken}`;
                console.log("Authorization header added.");
            } catch (error) {
                console.error("Error getting Firebase ID token:", error);
                // Handle error - maybe throw, maybe proceed without token?
                // For now, let's proceed without, backend might handle optional auth
            }
        } else {
            console.log("No current user found, proceeding without Authorization header.");
        }
    }
    // --- End Auth Header ---


    const config: RequestInit = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    try {
        console.log(`fetchApi: Calling ${options.method || 'GET'} ${url}`);
        const response = await fetch(url, config);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: `HTTP error! status: ${response.status}` }));
            console.error(`API Error (${response.status}) on ${endpoint}:`, errorData);
            const error = new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
            (error as any).status = response.status;
            throw error;
        }
        if (response.status === 204) {
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error(`Network or other error calling ${endpoint}:`, error);
        throw error;
    }
}


// --- Authentication API Calls (No changes needed here) ---
// Inside api.ts (from api_service_v4)

export const registerUser = async (username: string, password: string) => { // Declared here
    return fetchApi('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, password }), // <-- Used here
    });
};

export const loginUser = async (username: string, password: string) => { // Declared here
    return fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }), // <-- Used here
    });
};


// --- Dialogue API Call ---
// Define MessageData interface (or import from Message.tsx)
interface MessageData {
  role: 'user' | 'assistant';
  content: string;
}

// Updated to use fetchApi with includeAuth flag
export const postDialogue = async (history: MessageData[]) => {
    // Call fetchApi, setting includeAuth to true
    return fetchApi('/api/dialogue', {
        method: 'POST',
        body: JSON.stringify({ history }),
    }, true); // <-- Pass true here to include auth token if available
};

