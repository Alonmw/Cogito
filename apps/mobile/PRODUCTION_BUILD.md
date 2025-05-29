# Production Build Guide

## Overview

This guide covers building the Socratic Mobile app for production with Firebase Analytics enabled.

## Prerequisites

1. **EAS CLI**: Install the Expo Application Services CLI
   ```bash
   npm install -g @expo/eas-cli
   ```

2. **EAS Account**: Login to your Expo account
   ```bash
   eas login
   ```

3. **Firebase Configuration**: Ensure you have:
   - `google-services.json` (Android) in the project root
   - Firebase project configured with Analytics enabled

## Analytics Configuration

The app is configured to automatically detect the environment:
- **Development**: Uses no-op analytics service (logs to console)
- **Production**: Uses real Firebase Analytics

This is handled automatically in `src/services/analytics.ts`:
```typescript
const isProductionBuild = process.env.NODE_ENV === 'production' || !__DEV__;
export const analyticsService = createAnalyticsService('mobile', !isProductionBuild);
```

## Build Commands

### Build for Android Only
```bash
npm run build:android
```


### Clean Build (if needed)
```bash
npm run prebuild:clean
npm run build:production
```

## Build Process

1. **Prepare Environment**
   ```bash
   pnpm install
   ```

2. **Verify Firebase Configuration**
   - Ensure `google-services.json` is present for Android
   - Ensure `GoogleService-Info.plist` is present for iOS
   - Verify Firebase project has Analytics enabled

3. **Start Production Build**
   ```bash
   npm run build:production
   ```

4. **Monitor Build Progress**
   - Check build status at: https://expo.dev/accounts/[your-account]/projects/socratic-mobile/builds
   - Build typically takes 10-20 minutes

## Analytics Events in Production

Once deployed, the app will track these events to Firebase Analytics:

### Core Events
- **`conversation_started`**: First message of every conversation
  - `persona_id`: Which philosopher was selected
  - `first_message_hash`: Anonymized hash of the message content
  - `first_message_length`: Character count
  - `first_message_word_count`: Word count
  - `conversation_type`: 'voice' or 'text'
  - `is_guest_user`: Boolean

- **`message_sent`**: Each subsequent message
  - `message_type`: 'text' or 'voice'
  - `persona_id`: Current philosopher
  - `conversation_position`: Message number in conversation

- **`voice_interaction`**: Voice recording events
  - `action`: 'started', 'completed', 'cancelled', 'transcription_success', 'transcription_failed'
  - `duration_ms`: Recording duration
  - `persona_id`: Current philosopher

### User Behavior Events
- **`persona_selected`**: Philosopher selection
- **`screen_view`**: Navigation tracking
- **`app_open`**: App launches
- **`app_error`**: Error tracking

## Privacy & Compliance

✅ **GDPR/CCPA Compliant**
- Message content is hashed, never stored as plain text
- User IDs are hashed for anonymity
- Only metadata tracked (length, word count)
- Firebase Analytics provides automatic anonymization

## Troubleshooting

### Build Fails
1. Check Firebase configuration files are present
2. Verify EAS project is properly configured
3. Run `npm run prebuild:clean` and try again

### Analytics Not Working
1. Verify Firebase project has Analytics enabled
2. Check Firebase console for incoming events
3. Ensure production build (not development)

### Version Conflicts
1. Check all Firebase packages are version 22.2.0
2. Run `pnpm install` to resolve dependencies

## Testing Production Build

### Local Testing
```bash
# Build development client
eas build --profile development --platform ios
# Install on device and test
```

### Production Testing
```bash
# Build production version
npm run build:production
# Download and install .apk/.ipa files
```

## Deployment

After successful build:
1. Download build artifacts from Expo dashboard
2. Upload to Google Play Store (Android) or App Store (iOS)
3. Monitor Firebase Analytics dashboard for incoming events

## Monitoring

### Firebase Analytics Dashboard
- Real-time events: Firebase Console > Analytics > Realtime
- Event reports: Firebase Console > Analytics > Events
- User behavior: Firebase Console > Analytics > Behavior

### Key Metrics to Monitor
- Daily active users
- Conversation start rate
- Voice vs text usage
- Persona popularity
- User retention 