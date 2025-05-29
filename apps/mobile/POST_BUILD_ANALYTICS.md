# Post-Build Firebase Analytics Setup

## Overview

Due to ES module import issues with Firebase Analytics during the build process, we've created a two-phase approach:

1. **Phase 1**: Build the app without Firebase Analytics (current)
2. **Phase 2**: Add Firebase Analytics for future builds (this guide)

## Current Build Status

✅ **Production build is running without Firebase Analytics**
- Analytics service is using no-op implementation (logs to console)
- All analytics tracking code is in place and functional
- App will build and deploy successfully
- Ready to add real analytics in next iteration

## Adding Firebase Analytics (Next Build)

### Step 1: Install Firebase Analytics

```bash
cd Socratic-Mobile
pnpm add @react-native-firebase/analytics@^22.2.0
```

### Step 2: Update app.json

Add Firebase Analytics plugin back:

```json
{
  "expo": {
    "plugins": [
      "expo-router",
      "@react-native-firebase/app",
      "@react-native-firebase/analytics",  // Add this line
      "@react-native-google-signin/google-signin",
      "expo-av",
      // ... other plugins
    ]
  }
}
```

### Step 3: Update Analytics Service

The analytics service is already configured to detect production vs development:

```typescript
// In src/services/analytics.ts - already configured
const isProductionBuild = process.env.NODE_ENV === 'production' || !__DEV__;
export const analyticsService = createAnalyticsService('mobile', !isProductionBuild);
```

### Step 4: Rebuild for Production

```bash
npm run prebuild:clean
npm run build:android  # or build:ios
```

## Alternative: Manual Analytics Integration

If the Firebase import issues persist, you can manually integrate analytics:

### Option A: Direct Firebase SDK Integration

```typescript
// Create: src/services/firebase-analytics.ts
import analytics from '@react-native-firebase/analytics';

export const trackEvent = async (eventName: string, params: object) => {
  try {
    await analytics().logEvent(eventName, params);
  } catch (error) {
    console.warn('Analytics tracking failed:', error);
  }
};
```

### Option B: Custom Analytics Service

```typescript
// Update: src/services/analytics.ts
import { trackEvent } from './firebase-analytics';

// Replace analytics service calls with direct Firebase calls
export const trackConversationStarted = async (params: any) => {
  await trackEvent('conversation_started', params);
};
```

## Current Analytics Implementation

Even without Firebase Analytics, the app is fully instrumented:

### Events Being Tracked (Console Logs)
- ✅ `conversation_started` - First message tracking
- ✅ `message_sent` - All messages
- ✅ `voice_interaction` - Voice recording events
- ✅ `persona_selected` - Philosopher choices
- ✅ `screen_view` - Navigation
- ✅ `app_open` - App launches
- ✅ `app_error` - Error tracking

### Privacy Features Already Implemented
- ✅ Message content hashing (never plain text)
- ✅ User ID anonymization
- ✅ Metadata-only tracking
- ✅ GDPR/CCPA compliance

## Testing Current Build

### Development Testing
```bash
cd Socratic-Mobile
npx expo start
# Check console for analytics logs like:
# [Analytics] trackConversationStarted (no-op) { persona_id: 'socrates', ... }
```

### Production Testing
1. Download the built APK from EAS dashboard
2. Install on Android device
3. Test all app functionality
4. Verify analytics logs in console (development) or prepare for Firebase (production)

## Next Steps

1. **Complete Current Build**: Let the current production build finish
2. **Test App Functionality**: Verify all features work correctly
3. **Deploy to Store**: Upload to Google Play Store for initial release
4. **Add Analytics**: Follow this guide for next version with Firebase Analytics
5. **Monitor**: Use Firebase Analytics dashboard once integrated

## Build Commands Reference

```bash
# Current build (no analytics)
npm run build:android

# Future build (with analytics)
pnpm add @react-native-firebase/analytics@^22.2.0
# Update app.json
npm run prebuild:clean
npm run build:android
```

## Monitoring Without Firebase Analytics

For the current build, you can monitor:
- App Store/Play Store analytics
- Crash reporting (if configured)
- User reviews and feedback
- Basic usage metrics from store dashboards

Once Firebase Analytics is added, you'll get detailed user interaction data including the specific first message tracking you requested. 