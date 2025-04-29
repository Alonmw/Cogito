// packages/common-types/src/index.ts

/**
 * Represents a single message in the format expected by the backend API history.
 */
export interface ApiHistoryMessage {
  role: 'user' | 'assistant' | 'system'; // Added system role
  content: string;
}

/**
 * Represents the structure of the payload sent to the /api/dialogue endpoint.
 */
export interface DialoguePayload {
    history: ApiHistoryMessage[];
    // Add other potential payload fields here later if needed
}

/**
 * Represents the structure of the successful response from the /api/dialogue endpoint.
 */
export interface DialogueResponse {
    response: string;
}

/**
 * Represents the structure of error responses from the backend API.
 */
export interface ApiErrorResponse {
    error: string;
}

// Add other shared types here as needed, for example:
// export interface UserProfile { ... }
// export interface ConversationSummary { ... }

