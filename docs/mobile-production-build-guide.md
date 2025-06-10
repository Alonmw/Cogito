# Mobile App Production Build Guide

This guide explains how to build production-ready Android App Bundle (AAB) and APK files for the Socratic mobile app.

## Prerequisites

### Required Tools
- **Node.js** (v18 or higher)
- **pnpm** (for monorepo workspace management)
- **EAS CLI** (Expo Application Services)
- **Android Studio** (for Android builds)
- **Java 17** (required for React Native builds)

### Installation
```bash
# Install pnpm if not already installed
npm install -g pnpm

# Install EAS CLI globally
npm install -g eas-cli

# Install dependencies (run from project root)
pnpm install
```

## Project Structure

The mobile app is located in `apps/mobile/` and uses:
- **Expo SDK 52** with React Native
- **EAS Build** for production builds
- **Firebase** for authentication and analytics
- **Custom keystores** for Android signing

## Build Configurations

### EAS Build Profiles (eas.json)

The project has several build profiles configured:

1. **development**: Development builds with dev client
2. **preview**: Internal distribution builds
3. **production**: Production APK builds
4. **production-aab**: Production App Bundle builds (recommended for Play Store)

### Android Signing Configuration

The app uses a custom keystore for production signing:
- **Keystore file**: `android/app/socratic-release-key.keystore`
- **Store password**: `Socratic123`
- **Key alias**: `socratic-key`
- **Key password**: `Socratic123`

## Building Production Versions

### 1. Android App Bundle (AAB) - Recommended for Play Store

```bash
# Navigate to mobile app directory
cd apps/mobile

# Build AAB locally
npx eas build --platform android --profile production-aab --local

# Build AAB on EAS cloud (requires EAS account)
npx eas build --platform android --profile production-aab
```

**Features of AAB builds:**
- Smaller download size (Google Play optimization)
- Dynamic delivery support
- Required format for Google Play Store
- Automatic signing with release keystore

### 2. Android APK - For Direct Distribution

```bash
# Navigate to mobile app directory
cd apps/mobile

# Build APK locally
npx eas build --platform android --profile production --local

# Build APK on EAS cloud
npx eas build --platform android --profile production
```

**Features of APK builds:**
- Universal APK for direct installation
- Larger file size than AAB
- Works for sideloading and alternative stores

### 3. Local vs Cloud Builds

#### Local Builds
- **Pros**: Faster, no cloud usage limits, full control
- **Cons**: Requires local Android development setup
- **Command suffix**: `--local`

#### Cloud Builds
- **Pros**: No local setup required, consistent environment
- **Cons**: Requires EAS subscription, slower upload/download
- **Command**: Default behavior without `--local`

## Build Process Details

### Step-by-Step Build Process

1. **Environment Setup**
   ```bash
   # Ensure you're in the correct directory
   cd apps/mobile
   
   # Verify EAS CLI installation
   npx eas --version
   
   # Login to EAS (for cloud builds)
   npx eas login
   ```

2. **Pre-build Validation**
   ```bash
   # Check app configuration
   npx expo doctor
   
   # Verify build configuration
   npx eas build:configure
   ```

3. **Start Build**
   ```bash
   # For AAB (recommended)
   npx eas build --platform android --profile production-aab --local
   
   # For APK
   npx eas build --platform android --profile production --local
   ```

4. **Build Output**
   - Local builds output to: `apps/mobile/build/`
   - Cloud builds provide download links
   - Build artifacts include `.aab` or `.apk` files

### Build Configuration Files

#### app.json
```json
{
  "expo": {
    "name": "Cogito",
    "version": "1.0.2",
    "android": {
      "package": "io.alonmw.socratic_questioner",
      "googleServicesFile": "./google-services.json"
    }
  }
}
```

#### eas.json
```json
{
  "build": {
    "production-aab": {
      "autoIncrement": true,
      "env": {
        "NODE_ENV": "production"
      },
      "android": {
        "buildType": "app-bundle",
        "credentialsSource": "remote"
      }
    }
  }
}
```

## Version Management

### Automatic Version Incrementing
- **versionCode**: Automatically incremented for each build
- **versionName**: Manually set in `app.json` (e.g., "1.0.2")

### Manual Version Updates
```bash
# Update version in app.json
{
  "expo": {
    "version": "1.0.3"  // Update this value
  }
}

# Update versionCode in android/app/build.gradle
versionCode 26  // Increment this value
```

## Troubleshooting

### Common Issues

1. **Build Fails with Keystore Error**
   ```bash
   # Verify keystore exists
   ls -la android/app/socratic-release-key.keystore
   
   # Check keystore details
   keytool -list -v -keystore android/app/socratic-release-key.keystore
   ```

2. **Dependencies Issues**
   ```bash
   # Clean and reinstall dependencies (from project root)
   pnpm clean
   pnpm install
   
   # Clear Expo cache
   npx expo r -c
   ```

3. **Build Size Issues**
   - Use AAB format for smaller sizes
   - Enable ProGuard/R8 code shrinking
   - Optimize images and assets

4. **Firebase Configuration**
   ```bash
   # Ensure google-services.json is present
   ls -la google-services.json
   
   # Verify Firebase configuration
   npx expo install @react-native-firebase/app
   ```

### Build Logs
- Local builds: Check terminal output
- Cloud builds: Available in EAS dashboard
- Android logs: Use `adb logcat` for device debugging

## Deployment

### Google Play Store (AAB)
1. Build AAB using `production-aab` profile
2. Upload to Google Play Console
3. Follow Play Store review process

### Direct Distribution (APK)
1. Build APK using `production` profile
2. Distribute via email, website, or alternative stores
3. Users need to enable "Install from Unknown Sources"

### Testing
- **Internal Testing**: Use `preview` profile for stakeholders
- **Staged Rollout**: Google Play Console for gradual release
- **Device Testing**: Install APK on various Android devices

## Security Considerations

1. **Keystore Security**
   - Keep keystore files secure and backed up
   - Use strong passwords for keystore and key
   - Store credentials securely (not in version control)

2. **Build Environment**
   - Use consistent build environments
   - Verify build integrity before distribution
   - Keep build tools updated

3. **App Signing**
   - Use Google Play App Signing for store releases
   - Maintain backup of upload key
   - Monitor signing key security

## Maintenance

### Regular Updates
- Keep Expo SDK updated
- Update React Native version periodically
- Review and update dependencies
- Test builds on latest Android versions

### Monitoring
- Monitor build success rates
- Track app performance post-release
- Collect crash reports and user feedback
- Monitor app size and performance metrics

---

## Quick Reference Commands

```bash
# Navigate to mobile app
cd apps/mobile

# Install dependencies (from root)
cd ../../ && pnpm install && cd apps/mobile

# Build AAB for Play Store
npx eas build --platform android --profile production-aab --local

# Build APK for direct distribution
npx eas build --platform android --profile production --local

# Check build status
npx eas build:list

# View build logs
npx eas build:view [BUILD_ID]
```

This guide ensures consistent, reproducible production builds of the Socratic mobile app for distribution through various channels. 