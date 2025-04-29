    // packages/api-client/src/index.ts
    import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
    // Import shared types
    import {
      ApiHistoryMessage,
      DialoguePayload,
      DialogueResponse,
      ApiErrorResponse
    } from '@socratic/common-types'; // Import from the shared types package

    // --- Configuration ---
    // Define possible environments and their URLs
    // These could be loaded from environment variables in the specific apps (web/mobile)
    const ENV_URLS = {
        // Use VITE_ prefix for web, maybe EXPO_PUBLIC_ for mobile via .env files
        DEVELOPMENT: process.env.VITE_STAGING_BACKEND_URL || process.env.EXPO_PUBLIC_STAGING_BACKEND_URL || 'https://socratic-questioner-dev.onrender.com', // Default dev
        PRODUCTION: process.env.VITE_PRODUCTION_BACKEND_URL || process.env.EXPO_PUBLIC_PRODUCTION_BACKEND_URL || 'https://socratic-questioner.onrender.com', // Default prod
    };

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
                    // Only add token to specific endpoints or based on a flag
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

        /**
         * Checks backend connection.
         */
        public async checkBackendConnection(): Promise<string | null> {
             try {
                const response = await this.axiosInstance.get<string>('/'); // Expect plain text
                console.log('[API Client] Backend connection successful:', response.data);
                return response.data;
            } catch (error) {
                console.error('[API Client] Error connecting to backend:', error);
                this.handleApiError(error, 'checkBackendConnection');
                return null;
            }
        }

        /**
         * Sends dialogue history to the backend.
         * @param history Array of messages formatted for the API.
         * @returns The AI's response text or null on error.
         */
        public async postDialogue(history: ApiHistoryMessage[]): Promise<string | null> {
            const payload: DialoguePayload = { history };
            console.log('[API Client] Sending payload to /api/dialogue:', JSON.stringify(payload, null, 2));
            try {
                const response = await this.axiosInstance.post<DialogueResponse>('/api/dialogue', payload);
                console.log('[API Client] Received dialogue response:', response.data);
                return response.data?.response ?? null; // Return null if response is missing
            } catch (error) {
                console.error('[API Client] Error posting dialogue:', error);
                this.handleApiError(error, 'postDialogue');
                return null;
            }
        }

        // --- Add methods for other endpoints later ---
        // e.g., public async getHistoryList(): Promise<ConversationSummary[] | null> { ... }
        // e.g., public async getConversation(id: string): Promise<ApiHistoryMessage[] | null> { ... }


        // --- Private Error Handler ---
        private handleApiError(error: any, functionName: string): void {
            if (axios.isAxiosError(error)) {
                const status = error.response?.status;
                const data = error.response?.data as ApiErrorResponse | any;
                const errorMessage = data?.error || data?.message || error.message;
                console.error(`[API Client Error] ${functionName} failed with status ${status}:`, errorMessage, error.response?.data);
                // Optionally re-throw specific errors or handle auth errors (e.g., 401)
            } else {
                console.error(`[API Client Error] Non-Axios error in ${functionName}:`, error);
            }
        }
    }

    // --- Export functions or a pre-configured instance if desired ---
    // Example: Exporting the class itself allows platform-specific instantiation

