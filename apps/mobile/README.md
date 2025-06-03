# Cogito 🦉

A React Native mobile app for engaging in philosophical conversations with AI personas like Socrates, Nietzsche, and Kant. Features voice input with slide-to-cancel functionality and anonymous analytics tracking.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Features

- 🎭 **Multiple AI Personas**: Chat with Socrates, Nietzsche, and Kant
- 🎤 **Voice Input**: Record voice messages with slide-to-cancel functionality
- 📱 **Cross-Platform**: Runs on iOS, Android, and web
- 🔐 **Firebase Authentication**: Google Sign-In and guest mode
- 📊 **Privacy-First Analytics**: Anonymous user interaction tracking
- 🎨 **Modern UI**: Beautiful interface with persona-specific theming

## Analytics

The app includes comprehensive analytics tracking for user interactions while maintaining complete privacy:

- **Anonymous Data Collection**: All user data is hashed and anonymized
- **First Message Tracking**: Specifically tracks the first message of every conversation
- **Voice Interaction Analytics**: Records voice usage patterns without storing audio content
- **Persona Selection Tracking**: Understands which philosophers users prefer

For production deployment, see `ANALYTICS_SETUP.md` for enabling Firebase Analytics.

## Architecture

This app is part of a pnpm monorepo workspace:
- `packages/analytics/` - Shared analytics service
- `packages/api-client/` - API communication layer  
- `packages/common-types/` - Shared TypeScript types

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
