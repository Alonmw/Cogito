// packages/analytics/src/index.ts
export * from './types';
export * from './base-service';
export * from './mobile-service';
export * from './noop-service';

// Factory function for creating the appropriate analytics service
export function createAnalyticsService(platform: 'mobile' | 'web', isDevelopment: boolean = false) {
  if (platform === 'mobile') {
    if (isDevelopment) {
      // Use no-op service in development to avoid Firebase import issues
      const { NoOpAnalyticsService } = require('./noop-service');
      return new NoOpAnalyticsService();
    } else {
      // Try production service first, fallback to regular service
      try {
        const { MobileAnalyticsServiceProduction } = require('./mobile-service-production');
        return new MobileAnalyticsServiceProduction();
      } catch (error) {
        console.warn('Production analytics service not available, using fallback');
        const { MobileAnalyticsService } = require('./mobile-service');
        return new MobileAnalyticsService();
      }
    }
  }
  
  // Future: WebAnalyticsService for the React web app
  throw new Error(`Analytics service for platform "${platform}" not implemented yet`);
} 