// packages/analytics/src/types.ts
export interface ConversationStartedEvent {
  persona_id: string;
  persona_name: string;
  first_message: string;
  first_message_length: number;
  first_message_word_count: number;
  conversation_type: 'new_chat' | 'persona_suggestion' | 'voice_initiated';
  is_guest_user: boolean;
  timestamp: number;
}

export interface MessageSentEvent {
  message_type: 'text' | 'voice';
  message_length: number;
  word_count: number;
  persona_id: string;
  conversation_position: number;
  is_guest_user: boolean;
  has_active_conversation_id: boolean;
}

export interface VoiceInteractionEvent {
  action: 'recording_started' | 'recording_completed' | 'recording_cancelled' | 'transcription_success' | 'transcription_failed';
  recording_duration?: number;
  transcript_length?: number;
  cancellation_method?: 'slide_gesture' | 'timeout' | 'error';
  persona_id: string;
  is_guest_user: boolean;
}

export interface PersonaSelectionEvent {
  persona_id: string;
  persona_name: string;
  selection_method: 'direct_chat' | 'suggestion_prompt';
  suggestion_text?: string;
  is_guest_user: boolean;
}

export interface AppNavigationEvent {
  screen_name: string;
  previous_screen?: string;
  is_guest_user: boolean;
}

export interface AnalyticsConfig {
  enabled: boolean;
  debug: boolean;
  platform: 'mobile' | 'web';
}

export interface IAnalyticsService {
  initialize(config?: AnalyticsConfig): Promise<void>;
  setUserProperties(isGuest: boolean, userId?: string): Promise<void>;
  trackConversationStarted(params: ConversationStartedEvent): Promise<void>;
  trackMessageSent(params: MessageSentEvent): Promise<void>;
  trackVoiceInteraction(params: VoiceInteractionEvent): Promise<void>;
  trackPersonaSelection(params: PersonaSelectionEvent): Promise<void>;
  trackScreenView(params: AppNavigationEvent): Promise<void>;
  trackAppOpened(): Promise<void>;
  trackError(errorType: string, errorMessage: string, context?: object): Promise<void>;
  getMessageMetadata(message: string): { length: number; word_count: number };
} 