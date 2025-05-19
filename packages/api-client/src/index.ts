// packages/api-client/src/index.ts
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import {
  ApiHistoryMessage,
  DialoguePayload,
  DialogueResponse,
  ApiErrorResponse,
  ConversationSummary,
  HistoryListResponse,
  ConversationMessagesResponse,
  PersonaId
} from '@socratic/common-types';

export type GetIdTokenFunction = () => Promise<string | null>;

export class ApiClient {
    private axiosInstance: AxiosInstance;
    private getIdToken: GetIdTokenFunction;

    constructor(getIdTokenFunc: GetIdTokenFunction, baseUrl: string) {
        if (!baseUrl) {
            throw new Error("ApiClient: baseUrl must be provided.");
        }
        this.getIdToken = getIdTokenFunc;
        console.log(`[API Client] Initializing with base URL: ${baseUrl}`);

        this.axiosInstance = axios.create({
            baseURL: baseUrl,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Add request interceptor to attach auth token
        this.axiosInstance.interceptors.request.use(
            async (config: InternalAxiosRequestConfig) => {
                // Add token to dialogue and history endpoints
                if (config.url?.startsWith('/api/dialogue') || config.url?.startsWith('/api/history')) {
                    console.log(`[API Client Interceptor] Request to protected route: ${config.url}`); // Log which route
                    try {
                        const idToken = await this.getIdToken();
                        if (idToken) {
                            // Log only a portion of the token for security/brevity
                            console.log('[API Client Interceptor] Token retrieved, attaching Authorization header (first 15 chars):', idToken.substring(0, 15) + "...");
                            config.headers.Authorization = `Bearer ${idToken}`;
                        } else {
                            console.warn('[API Client Interceptor] No ID Token available from getIdToken function.');
                        }
                    } catch (error) {
                        console.error('[API Client Interceptor] Error getting ID token for header:', error);
                    }
                }
                return config;
            },
            (error) => Promise.reject(error)
        );
    }

    public async checkBackendConnection(): Promise<string | null> {
         try {
            const response = await this.axiosInstance.get<string>('/');
            return response.data;
        } catch (error) {
            this.handleApiError(error, 'checkBackendConnection');
            return null;
        }
    }

    public async postDialogue(
        history: ApiHistoryMessage[],
        conversationId?: number,
        personaId?: PersonaId
    ): Promise<DialogueResponse | null> {
        const payload: DialoguePayload = { history };
        if (conversationId !== undefined) {
            payload.conversation_id = conversationId;
        }
        if (personaId !== undefined) {
            payload.persona_id = personaId;
        }
        console.log('[DEBUG] POST /api/dialogue payload:', JSON.stringify(payload));
        try {
            const response = await this.axiosInstance.post<DialogueResponse>('/api/dialogue', payload);
            return response.data ?? null;
        } catch (error) {
            this.handleApiError(error, 'postDialogue');
            return null;
        }
    }

    public async getHistoryList(): Promise<ConversationSummary[] | null> {
        console.log('[API Client] Attempting to fetch history list from /api/history'); // Added log
        try {
            const response = await this.axiosInstance.get<HistoryListResponse>('/api/history');
            console.log('[API Client] Received history list response:', response.data);
            return response.data?.history ?? [];
        } catch (error) {
            console.error('[API Client] Error fetching history list:', error); // Keep detailed error log
            this.handleApiError(error, 'getHistoryList');
            if (axios.isAxiosError(error) && error.response?.status === 403) {
                throw error; // Re-throw to be caught by the calling component
            }
            return null;
        }
    }

    public async getConversationMessages(conversationId: number): Promise<ApiHistoryMessage[] | null> {
      console.log(`[API Client] Attempting to fetch messages for conversation ID: ${conversationId}`); // Added log
      try {
        const response = await this.axiosInstance.get<ConversationMessagesResponse>(`/api/history/${conversationId}`);
        console.log('[API Client] Received conversation messages:', response.data);
        return response.data?.messages ?? [];
      } catch (error) {
        console.error(`[API Client] Error fetching messages for conversation ${conversationId}:`, error); // Keep detailed error log
        this.handleApiError(error, `getConversationMessages(${conversationId})`);
        if (axios.isAxiosError(error) && error.response?.status === 403) {
          throw error;
        }
        return null;
      }
    }

    public async deleteConversation(conversationId: number): Promise<boolean> {
        console.log(`[API Client] Attempting to delete conversation ID: ${conversationId}`); // Added log
        try {
            const response = await this.axiosInstance.delete(`/api/history/${conversationId}`);
            if (response.status === 200 || response.status === 204) {
                console.log(`[API Client] Successfully deleted conversation ID: ${conversationId}`);
                return true;
            }
            console.warn(`[API Client] Unexpected status after deleting conversation ${conversationId}: ${response.status}`);
            return false;
        } catch (error) {
            console.error(`[API Client] Error deleting conversation ${conversationId}:`, error); // Keep detailed error log
            this.handleApiError(error, `deleteConversation(${conversationId})`);
            if (axios.isAxiosError(error) && (error.response?.status === 403 || error.response?.status === 404)) {
                throw error;
            }
            return false;
        }
    }

    public async updateConversationTitle(conversationId: number, newTitle: string): Promise<boolean> {
        console.log(`[API Client] Attempting to update title for conversation ID: ${conversationId} to "${newTitle}"`);
        try {
            const response = await this.axiosInstance.patch(`/api/history/${conversationId}`, {
                title: newTitle
            });
            if (response.status === 200 || response.status === 204) {
                console.log(`[API Client] Successfully updated title for conversation ID: ${conversationId}`);
                return true;
            }
            console.warn(`[API Client] Unexpected status after updating conversation ${conversationId}: ${response.status}`);
            return false;
        } catch (error) {
            console.error(`[API Client] Error updating title for conversation ${conversationId}:`, error);
            this.handleApiError(error, `updateConversationTitle(${conversationId})`);
            if (axios.isAxiosError(error) && (error.response?.status === 403 || error.response?.status === 404)) {
                throw error;
            }
            return false;
        }
    }

    private handleApiError(error: any, functionName: string): void {
        if (axios.isAxiosError(error)) {
            const status = error.response?.status;
            const data = error.response?.data as ApiErrorResponse | any;
            const errorMessage = data?.error || data?.message || error.message;
            console.error(`[API Client Error] ${functionName} failed with status ${status}:`, errorMessage, error.response?.data);
        } else {
            console.error(`[API Client Error] Non-Axios error in ${functionName}:`, error);
        }
    }
}
