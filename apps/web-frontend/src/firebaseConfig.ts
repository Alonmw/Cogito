// src/firebaseConfig.ts
import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
// Import other Firebase services as needed (e.g., getFirestore)

// Your web app's Firebase configuration using environment variables
// Vite exposes env vars prefixed with VITE_ via import.meta.env
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Basic check if config values are loaded
if (!firebaseConfig.apiKey) {
    console.error("Firebase config values missing. Check your .env file and VITE_ prefixes.");
}

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;

try {
    app = initializeApp(firebaseConfig);
    // Initialize Firebase Authentication and get a reference to the service
    auth = getAuth(app);
    console.log("Firebase Initialized Successfully.");
} catch (error) {
    console.error("Firebase initialization failed:", error);
    // Handle initialization error appropriately
    // You might want to show an error message to the user
    // For now, we'll re-throw or assign dummy objects if needed elsewhere
    // throw error; // Or handle gracefully
}

// Export the necessary Firebase services
// Export 'auth' to be used by AuthContext and components
export { auth };
// Export 'app' if needed by other Firebase services (like Firestore)
// export { app };

