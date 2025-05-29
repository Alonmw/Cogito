import { BaseAnalyticsService } from './base-service';
import { 
  AnalyticsConfig,
  ConversationStartedEvent,
  MessageSentEvent,
  VoiceInteractionEvent,
  PersonaSelectionEvent,
  AppNavigationEvent
} from './types';

// Conditional Firebase Analytics import
let analytics: any = null;

// Function to safely load Firebase Analytics
function loadFirebaseAnalytics() {
  try {
    // Only load in React Native runtime environment
    if (typeof global !== 'undefined' && typeof require === 'function') {
      const analyticsModule = require('@react-native-firebase/analytics');
      return analyticsModule.default || analyticsModule;
    }
    return null;
  } catch (error) {
    console.warn('Firebase Analytics not available:', (error as Error).message);
    return null;
  }
}

export class MobileAnalyticsService extends BaseAnalyticsService {
  async initialize(config?: AnalyticsConfig): Promise<void> {
    this.config = { ...this.config, ...config };
    
    try {
      // Attempt to load Firebase Analytics
      analytics = loadFirebaseAnalytics();
      
      if (analytics && typeof analytics === 'function') {
        await analytics().setAnalyticsCollectionEnabled(this.config.enabled);
        this.isEnabled = this.config.enabled;
        this.log('Mobile analytics initialized successfully');
      } else {
        this.isEnabled = false;
        this.log('Firebase Analytics not available - analytics disabled');
      }
    } catch (error) {
      this.warn('Mobile analytics initialization failed', error);
      this.isEnabled = false;
    }
  }

  async setUserProperties(isGuest: boolean, userId?: string): Promise<void> {
    if (!this.isEnabled || !analytics) return;
    
    try {
      await analytics().setUserProperty('user_type', isGuest ? 'guest' : 'authenticated');
      await analytics().setUserProperty('platform', 'mobile');
      
      if (!isGuest && userId) {
        const hashedUserId = await this.hashUserId(userId);
        await analytics().setUserId(hashedUserId);
      }
      
      this.log('User properties set', { isGuest, hasUserId: !!userId });
    } catch (error) {
      this.warn('Failed to set user properties', error);
    }
  }

  async trackConversationStarted(params: ConversationStartedEvent): Promise<void> {
    if (!this.isEnabled || !analytics) return;

    try {
      const anonymizedParams = {
        persona_id: params.persona_id,
        persona_name: params.persona_name,
        first_message_hash: await this.hashMessage(params.first_message),
        first_message_length: params.first_message_length,
        first_message_word_count: params.first_message_word_count,
        conversation_type: params.conversation_type,
        is_guest_user: params.is_guest_user,
        timestamp: params.timestamp,
        platform: 'mobile',
      };

      await analytics().logEvent('conversation_started', anonymizedParams);
      this.log('Tracked conversation started', anonymizedParams);
    } catch (error) {
      this.warn('Failed to track conversation started', error);
    }
  }

  async trackMessageSent(params: MessageSentEvent): Promise<void> {
    if (!this.isEnabled || !analytics) return;

    try {
      const eventParams = {
        ...params,
        platform: 'mobile',
      };
      
      await analytics().logEvent('message_sent', eventParams);
      this.log('Tracked message sent', eventParams);
    } catch (error) {
      this.warn('Failed to track message sent', error);
    }
  }

  async trackVoiceInteraction(params: VoiceInteractionEvent): Promise<void> {
    if (!this.isEnabled || !analytics) return;

    try {
      const eventParams = {
        ...params,
        platform: 'mobile',
      };
      
      await analytics().logEvent('voice_interaction', eventParams);
      this.log('Tracked voice interaction', eventParams);
    } catch (error) {
      this.warn('Failed to track voice interaction', error);
    }
  }

  async trackPersonaSelection(params: PersonaSelectionEvent): Promise<void> {
    if (!this.isEnabled || !analytics) return;

    try {
      const anonymizedParams = {
        persona_id: params.persona_id,
        persona_name: params.persona_name,
        selection_method: params.selection_method,
        suggestion_hash: params.suggestion_text ? await this.hashMessage(params.suggestion_text) : undefined,
        suggestion_length: params.suggestion_text?.length || 0,
        is_guest_user: params.is_guest_user,
        platform: 'mobile',
      };

      await analytics().logEvent('persona_selected', anonymizedParams);
      this.log('Tracked persona selection', anonymizedParams);
    } catch (error) {
      this.warn('Failed to track persona selection', error);
    }
  }

  async trackScreenView(params: AppNavigationEvent): Promise<void> {
    if (!this.isEnabled || !analytics) return;

    try {
      await analytics().logScreenView({
        screen_name: params.screen_name,
        screen_class: params.screen_name,
      });

      const eventParams = {
        ...params,
        platform: 'mobile',
      };
      
      await analytics().logEvent('screen_view', eventParams);
      this.log('Tracked screen view', eventParams);
    } catch (error) {
      this.warn('Failed to track screen view', error);
    }
  }

  async trackAppOpened(): Promise<void> {
    if (!this.isEnabled || !analytics) return;

    try {
      await analytics().logEvent('app_open', {
        timestamp: Date.now(),
        platform: 'mobile',
      });
      this.log('Tracked app open');
    } catch (error) {
      this.warn('Failed to track app open', error);
    }
  }

  async trackError(errorType: string, errorMessage: string, context?: object): Promise<void> {
    if (!this.isEnabled || !analytics) return;

    try {
      await analytics().logEvent('app_error', {
        error_type: errorType,
        error_message: errorMessage.substring(0, 100),
        context: JSON.stringify(context || {}).substring(0, 200),
        timestamp: Date.now(),
        platform: 'mobile',
      });
      this.log('Tracked error', { errorType, errorMessage });
    } catch (error) {
      this.warn('Failed to track error', error);
    }
  }
} 