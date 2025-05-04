// packages/api-client/src/index.ts
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import {
  ApiHistoryMessage,
  DialoguePayload,
  DialogueResponse,
  ApiErrorResponse
} from '@socratic/common-types';

// --- Helper to get environment variables safely in different environments ---
function getEnvVariable(viteKey: string, expoKey: string): string | undefined {
    // Check Vite/Web environment first using import.meta.env
    // Use explicit check for 'import.meta' object existence
    // @ts-ignore - Acknowledge TS might not know import.meta globally
    if (typeof import.meta !== 'undefined' && import.meta.env) {
        // @ts-ignore
        console.log(`[API Client] Checking Vite env var: ${viteKey}`);
        // @ts-ignore
        return import.meta.env[viteKey];
    }
    // Check Node/Expo environment ONLY if Vite's env isn't available
    // Use careful check for process and process.env existence
    else if (typeof process !== 'undefined' && typeof process.env !== 'undefined') {
        console.log(`[API Client] Checking Expo/Node env var: ${expoKey}`);
        return process.env[expoKey];
    }
    // Fallback if neither environment object is found
    console.log(`[API Client] No env var context found for ${viteKey} or ${expoKey}`);
    return undefined;
}
// --- End Helper ---


// --- Configuration ---
const ENV_URLS = {
    DEVELOPMENT: getEnvVariable('VITE_STAGING_BACKEND_URL', 'EXPO_PUBLIC_STAGING_BACKEND_URL') || 'https://socratic-questioner-dev.onrender.com', // Default dev
    PRODUCTION: getEnvVariable('VITE_PRODUCTION_BACKEND_URL', 'EXPO_PUBLIC_PRODUCTION_BACKEND_URL') || 'https://socratic-questioner.onrender.com', // Default prod
};
// --- End Configuration ---


// Function type for getting the auth token (platform-specific)
export type GetIdTokenFunction = () => Promise<string | null>;

// --- API Client Class ---
export class ApiClient {
    private axiosInstance: AxiosInstance;
    private getIdToken: GetIdTokenFunction;
    private baseUrl: string;

    constructor(getIdTokenFunc: GetIdTokenFunction, environment: 'DEVELOPMENT' | 'PRODUCTION' = 'DEVELOPMENT') {
        this.getIdToken = getIdTokenFunc;
        this.baseUrl = ENV_URLS[environment];
        console.log(`[API Client] Initializing for environment: ${environment} with base URL: ${this.baseUrl}`);

        this.axiosInstance = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Add request interceptor to attach auth token
        this.axiosInstance.interceptors.request.use(
            async (config: InternalAxiosRequestConfig) => {
                if (config.url === '/api/dialogue' && config.method === 'post') {
                    try {
                        const idToken = await this.getIdToken();
                        if (idToken) {
                            console.log('[API Client Interceptor] Attaching Authorization header.');
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

    // --- API Methods ---

    public async checkBackendConnection(): Promise<string | null> {
         try {
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
        console.log('[API Client] Sending payload to /api/dialogue:', JSON.stringify(payload, null, 2));
        try {
            const response = await this.axiosInstance.post<DialogueResponse>('/api/dialogue', payload);
            console.log('[API Client] Received dialogue response:', response.data);
            return response.data?.response ?? null;
        } catch (error) {
            console.error('[API Client] Error posting dialogue:', error);
            this.handleApiError(error, 'postDialogue');
            return null;
        }
    }

    // --- Private Error Handler ---
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

