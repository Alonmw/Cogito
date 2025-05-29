import { 
  IAnalyticsService, 
  AnalyticsConfig,
  ConversationStartedEvent,
  MessageSentEvent,
  VoiceInteractionEvent,
  PersonaSelectionEvent,
  AppNavigationEvent
} from './types';

export abstract class BaseAnalyticsService implements IAnalyticsService {
  protected isEnabled = true;
  protected config: AnalyticsConfig = {
    enabled: true,
    debug: false,
    platform: 'mobile'
  };

  abstract initialize(config?: AnalyticsConfig): Promise<void>;
  abstract setUserProperties(isGuest: boolean, userId?: string): Promise<void>;
  abstract trackConversationStarted(params: ConversationStartedEvent): Promise<void>;
  abstract trackMessageSent(params: MessageSentEvent): Promise<void>;
  abstract trackVoiceInteraction(params: VoiceInteractionEvent): Promise<void>;
  abstract trackPersonaSelection(params: PersonaSelectionEvent): Promise<void>;
  abstract trackScreenView(params: AppNavigationEvent): Promise<void>;
  abstract trackAppOpened(): Promise<void>;
  abstract trackError(errorType: string, errorMessage: string, context?: object): Promise<void>;

  // Shared utility methods
  protected async hashMessage(message: string): Promise<string> {
    let hash = 0;
    for (let i = 0; i < message.length; i++) {
      const char = message.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  protected async hashUserId(userId: string): Promise<string> {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `user_${Math.abs(hash).toString(16)}`;
  }

  protected countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  getMessageMetadata(message: string) {
    return {
      length: message.length,
      word_count: this.countWords(message),
    };
  }

  protected log(message: string, data?: any) {
    if (this.config.debug) {
      console.log(`📊 Analytics: ${message}`, data || '');
    }
  }

  protected warn(message: string, error?: any) {
    console.warn(`📊 Analytics Warning: ${message}`, error || '');
  }
} 