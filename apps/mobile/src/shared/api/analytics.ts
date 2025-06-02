// Simple no-op analytics service to avoid Firebase dependency issues
interface AnalyticsService {
  trackVoiceInteraction(data: any): Promise<void>;
  trackAppOpened(): void;
  setUserProperties(isGuest: boolean, uid?: string): void;
  trackPersonaSelection(data: any): Promise<void>;
  trackScreenView(data: any): void;
  getMessageMetadata(message: string): any;
  trackConversationStarted(data: any): Promise<void>;
  trackMessageSent(data: any): Promise<void>;
  initialize(config: any): void;
}

class NoOpAnalyticsService implements AnalyticsService {
  async trackVoiceInteraction(data: any): Promise<void> {
    // No-op implementation
  }

  trackAppOpened(): void {
    // No-op implementation
  }

  setUserProperties(isGuest: boolean, uid?: string): void {
    // No-op implementation
  }

  async trackPersonaSelection(data: any): Promise<void> {
    // No-op implementation
  }

  trackScreenView(data: any): void {
    // No-op implementation
  }

  getMessageMetadata(message: string): any {
    return {};
  }

  async trackConversationStarted(data: any): Promise<void> {
    // No-op implementation
  }

  async trackMessageSent(data: any): Promise<void> {
    // No-op implementation
  }

  initialize(config: any): void {
    // No-op implementation
  }
}

// Create the no-op analytics service instance
export const analyticsService = new NoOpAnalyticsService();

// Initialize (no-op)
analyticsService.initialize({
  enabled: false,
  debug: __DEV__,
  platform: 'mobile'
}); 