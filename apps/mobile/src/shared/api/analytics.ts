import { createAnalyticsService } from '@socratic/analytics';

// Create the mobile analytics service instance
// Use no-op service to avoid Firebase ES module import issues
export const analyticsService = createAnalyticsService('mobile', true);

// Initialize with mobile-specific config
analyticsService.initialize({
  enabled: true, // Service will handle development vs production internally
  debug: __DEV__, // Enable debug logging in development
  platform: 'mobile'
}); 