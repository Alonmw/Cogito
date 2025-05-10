// packages/common-types/src/index.ts

/**
 * Represents a single message in the format expected by the backend API history.
 */
export interface ApiHistoryMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string; // Optional: if backend sends it for individual messages
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

// --- NEW: Add ConversationSummary ---
/**
 * Represents a summary of a conversation for display in history lists.
 */
export interface ConversationSummary {
    id: number;       // Unique ID of the conversation
    title: string;    // A title for the conversation (e.g., first user message)
    updated_at: string; // ISO string timestamp of the last update
    // Add other summary fields if needed, e.g., message_count
}
// --- End NEW ---


/**
 * Represents the structure of the response from the GET /api/history endpoint.
 */
export interface HistoryListResponse {
    history: ConversationSummary[];
}

/**
 * Represents the structure of the response from the GET /api/history/<id> endpoint.
 */
export interface ConversationMessagesResponse {
    messages: ApiHistoryMessage[];
}


// Add other shared types here as needed, for example:
// export interface UserProfile { ... }
