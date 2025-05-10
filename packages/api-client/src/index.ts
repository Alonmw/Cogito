// packages/api-client/src/index.ts
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import {
  ApiHistoryMessage,
  DialoguePayload,
  DialogueResponse,
  ApiErrorResponse,
  ConversationSummary,
  HistoryListResponse,
  ConversationMessagesResponse // Ensure this is imported
} from '@socratic/common-types';

// Function type for getting the auth token (platform-specific)
export type GetIdTokenFunction = () => Promise<string | null>;

// API Client Class
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
                if (config.url?.startsWith('/api/dialogue') || config.url?.startsWith('/api/history')) {
                    try {
                        const idToken = await this.getIdToken();
                        if (idToken) {
                            config.headers.Authorization = `Bearer ${idToken}`;
                        } else {
                            console.warn('[API Client Interceptor] No ID Token available for protected route.');
                        }
                    } catch (error) {
                        console.error('[API Client Interceptor] Error getting ID token:', error);
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
        conversationId?: number
    ): Promise<DialogueResponse | null> {
        const payload: DialoguePayload = { history };
        if (conversationId !== undefined) {
            payload.conversation_id = conversationId;
        }
        try {
            const response = await this.axiosInstance.post<DialogueResponse>('/api/dialogue', payload);
            return response.data ?? null;
        } catch (error) {
            this.handleApiError(error, 'postDialogue');
            return null;
        }
    }

    public async getHistoryList(): Promise<ConversationSummary[] | null> {
        try {
            const response = await this.axiosInstance.get<HistoryListResponse>('/api/history');
            return response.data?.history ?? [];
        } catch (error) {
            this.handleApiError(error, 'getHistoryList');
            if (axios.isAxiosError(error) && error.response?.status === 403) {
                throw error;
            }
            return null;
        }
    }

    public async getConversationMessages(conversationId: number): Promise<ApiHistoryMessage[] | null> {
      console.log(`[API Client] Fetching messages for conversation ID: ${conversationId}`);
      try {
        const response = await this.axiosInstance.get<ConversationMessagesResponse>(`/api/history/${conversationId}`);
        console.log('[API Client] Received conversation messages:', response.data);
        return response.data?.messages ?? [];
      } catch (error) {
        console.error(`[API Client] Error fetching messages for conversation ${conversationId}:`, error);
        this.handleApiError(error, `getConversationMessages(${conversationId})`);
        if (axios.isAxiosError(error) && error.response?.status === 403) {
          throw error;
        }
        return null;
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
