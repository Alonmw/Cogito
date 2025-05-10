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
    conversation_id?: number; // <-- CRUCIAL: Ensure this line exists and is optional
}

/**
 * Represents the structure of the successful response from the /api/dialogue endpoint.
 */
export interface DialogueResponse {
    response: string;
    conversation_id: number; // Backend should return the ID of the active/new conversation
}

/**
 * Represents the structure of error responses from the backend API.
 */
export interface ApiErrorResponse {
    error: string;
}

/**
 * Represents a summary of a conversation for display in history lists.
 */
export interface ConversationSummary {
    id: number;
    title: string;
    updated_at: string;
}

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
