# Firebase Analytics Setup Guide

## Development vs Production

Currently, the app is configured to use a **no-op analytics service** during development to avoid Firebase import issues. For production deployment, you'll need to add Firebase Analytics back.

## Steps to Enable Firebase Analytics for Production

### 1. Install Firebase Analytics Package

```bash
cd Socratic-Mobile
pnpm add @react-native-firebase/analytics@^22.2.0
```

### 2. Update app.json

Add the Firebase Analytics plugin back to `app.json`:

```json
{
  "expo": {
    "plugins": [
      "expo-router",
      "@react-native-firebase/app",
      "@react-native-firebase/analytics",  // Add this line back
      "@react-native-google-signin/google-signin",
      "expo-av",
      // ... other plugins
    ]
  }
}
```

### 3. Update Analytics Service

In `Socratic-Mobile/src/services/analytics.ts`, change the development flag:

```typescript
// For production, use false to enable real Firebase Analytics
export const analyticsService = createAnalyticsService('mobile', false);
```

### 4. Rebuild the App

After making these changes, you'll need to rebuild the native code:

```bash
# Clear cache and rebuild
npx expo prebuild --clean
npx expo run:ios  # or npx expo run:android
```

## Current Development Setup

- **Analytics Service**: No-op service (logs events to console only)
- **Firebase Analytics**: Package removed to avoid ES module import issues
- **Event Tracking**: All analytics calls are functional but don't send data

## Analytics Events Being Tracked

The app is already instrumented to track:

- `conversation_started` - First message of every conversation (anonymized)
- `message_sent` - Each message with metadata
- `voice_interaction` - Voice recording lifecycle
- `persona_selected` - Persona choices
- `screen_view` - Navigation tracking
- `app_open` - App launches
- `app_error` - Error tracking

## Privacy Features

- Message content is hashed, never stored as plain text
- User IDs are hashed for anonymity
- Only metadata tracked (length, word count)
- Firebase Analytics provides automatic anonymization
- GDPR/CCPA compliant

## Testing Analytics

In development, check the console logs to see analytics events being tracked:

```
[Analytics] trackConversationStarted (no-op) { persona_id: 'socrates', conversation_type: 'voice', message_length: 25 }
```

In production, events will be sent to Firebase Analytics dashboard. 