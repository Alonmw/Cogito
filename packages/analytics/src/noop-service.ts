import { BaseAnalyticsService } from './base-service';
import { 
  AnalyticsConfig,
  ConversationStartedEvent,
  MessageSentEvent,
  VoiceInteractionEvent,
  PersonaSelectionEvent,
  AppNavigationEvent
} from './types';

export class NoOpAnalyticsService extends BaseAnalyticsService {
  async initialize(config?: AnalyticsConfig): Promise<void> {
    this.config = { ...this.config, ...config };
    this.isEnabled = false;
    this.log('No-op analytics service initialized (development mode)');
  }

  async setUserProperties(isGuest: boolean, userId?: string): Promise<void> {
    this.log('setUserProperties (no-op)', { isGuest, hasUserId: !!userId });
  }

  async trackConversationStarted(params: ConversationStartedEvent): Promise<void> {
    this.log('trackConversationStarted (no-op)', { 
      persona_id: params.persona_id,
      conversation_type: params.conversation_type,
      message_length: params.first_message_length 
    });
  }

  async trackMessageSent(params: MessageSentEvent): Promise<void> {
    this.log('trackMessageSent (no-op)', { 
      message_type: params.message_type,
      persona_id: params.persona_id 
    });
  }

  async trackVoiceInteraction(params: VoiceInteractionEvent): Promise<void> {
    this.log('trackVoiceInteraction (no-op)', { 
      action: params.action,
      persona_id: params.persona_id 
    });
  }

  async trackPersonaSelection(params: PersonaSelectionEvent): Promise<void> {
    this.log('trackPersonaSelection (no-op)', { 
      persona_id: params.persona_id,
      selection_method: params.selection_method 
    });
  }

  async trackScreenView(params: AppNavigationEvent): Promise<void> {
    this.log('trackScreenView (no-op)', { screen_name: params.screen_name });
  }

  async trackAppOpened(): Promise<void> {
    this.log('trackAppOpened (no-op)');
  }

  async trackError(errorType: string, errorMessage: string, context?: object): Promise<void> {
    this.log('trackError (no-op)', { errorType, errorMessage });
  }
} 