// packages/api-client/src/index.ts
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import {
  ApiHistoryMessage,
  DialoguePayload,
  DialogueResponse,
  ApiErrorResponse
} from '@socratic/common-types';

// --- Removed environment variable checking logic ---

// Function type for getting the auth token (platform-specific)
export type GetIdTokenFunction = () => Promise<string | null>;

// --- API Client Class ---
export class ApiClient {
    private axiosInstance: AxiosInstance;
    private getIdToken: GetIdTokenFunction;
    private baseUrl: string; // Store the base URL

    // --- Constructor now accepts baseUrl directly ---
    constructor(getIdTokenFunc: GetIdTokenFunction, baseUrl: string) {
        if (!baseUrl) {
            throw new Error("ApiClient: baseUrl must be provided.");
        }
        this.getIdToken = getIdTokenFunc;
        this.baseUrl = baseUrl;
        console.log(`[API Client] Initializing with base URL: ${this.baseUrl}`);

        this.axiosInstance = axios.create({
            baseURL: this.baseUrl, // Use the provided baseUrl
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Add request interceptor to attach auth token
        this.axiosInstance.interceptors.request.use(
            async (config: InternalAxiosRequestConfig) => {
                // Add token only to relative paths (dialogue endpoint)
                if (config.url === '/api/dialogue' && config.method === 'post') {
                    try {
                        const idToken = await this.getIdToken();
                        if (idToken) {
                            // console.log('[API Client Interceptor] Attaching Authorization header.');
                            config.headers.Authorization = `Bearer ${idToken}`;
                        } else {
                            console.warn('[API Client Interceptor] No ID Token available.');
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
    // --- End Constructor Change ---

    // --- API Methods (Remain the same) ---

    public async checkBackendConnection(): Promise<string | null> {
         try {
            // Use relative path now, baseURL is set in instance
            const response = await this.axiosInstance.get<string>('/');
            console.log('[API Client] Backend connection successful:', response.data);
            return response.data;
        } catch (error) {
            console.error('[API Client] Error connecting to backend:', error);
            this.handleApiError(error, 'checkBackendConnection');
            return null;
        }
    }

    public async postDialogue(history: ApiHistoryMessage[]): Promise<string | null> {
        const payload: DialoguePayload = { history };
        // console.log('[API Client] Sending payload to /api/dialogue:', JSON.stringify(payload, null, 2));
        try {
            // Use relative path now
            const response = await this.axiosInstance.post<DialogueResponse>('/api/dialogue', payload);
            console.log('[API Client] Received dialogue response:', response.data);
            return response.data?.response ?? null;
        } catch (error) {
            console.error('[API Client] Error posting dialogue:', error);
            this.handleApiError(error, 'postDialogue');
            return null;
        }
    }

    // --- Private Error Handler (Remains the same) ---
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

