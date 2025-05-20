# Mobile App Security Checklist

This document outlines security best practices for the Socratic-Mobile React Native/Expo application.

## Pre-Deployment Security Checklist

### Environment Variables

- [ ] Securely manage environment variables with Expo config plugins
- [ ] Ensure sensitive API keys are not hardcoded in the app
- [ ] Configure proper backend API URLs for staging/production
- [ ] Use `EXPO_PUBLIC_` prefix for variables that can be exposed to the client
- [ ] Store truly sensitive information server-side, not in the mobile app

### Firebase Configuration

- [ ] Properly configure Firebase for Android/iOS platforms
- [ ] Use platform-specific config files (google-services.json, GoogleService-Info.plist)
- [ ] Apply proper Firebase security rules for your databases
- [ ] Verify authentication flow works correctly on real devices

### Secure Storage

- [ ] Use `expo-secure-store` for storing sensitive information
- [ ] Never store API keys or tokens in AsyncStorage (non-encrypted)
- [ ] Implement proper token refresh mechanisms
- [ ] Handle app backgrounding/foregrounding securely

### Secure Communication

- [ ] Ensure all API communication uses HTTPS
- [ ] Implement certificate pinning for critical APIs
- [ ] Validate server responses before processing
- [ ] Implement proper error handling for network failures

### Input Validation

- [ ] Validate all user inputs on the client-side
- [ ] Implement proper form validation
- [ ] Sanitize user inputs to prevent injection attacks
- [ ] Handle file uploads securely (if applicable)

### Dependency Security

- [ ] Run `npm audit` to check for vulnerable dependencies
- [ ] Update dependencies to resolve any security issues
- [ ] Remove unused dependencies
- [ ] Use lockfiles to ensure dependency consistency

## Build Process

1. **Environment Setup:**
   - [ ] Configure EAS build profiles for staging/production
   - [ ] Set up secrets in EAS secret storage

2. **Development/Testing Builds:**
   ```bash
   eas build --profile development --platform android
   eas build --profile development --platform ios
   ```

3. **Production Builds:**
   ```bash
   eas build --profile production --platform android
   eas build --profile production --platform ios
   ```

## Platform-Specific Considerations

### Android Security

- [ ] Configure proper app permissions in app.json
- [ ] Implement Android App Bundle (AAB) for production releases
- [ ] Configure proper signing keys and store them securely
- [ ] Consider implementing SafetyNet attestation for high-risk operations

### iOS Security

- [ ] Configure required entitlements
- [ ] Ensure proper App Transport Security (ATS) settings
- [ ] Use secure keychain for sensitive information
- [ ] Configure data protection properly (NSData protection classes)

## Post-Deployment Verification

- [ ] Test authentication on real devices
- [ ] Verify deep linking works securely
- [ ] Test app behavior when network connection is lost
- [ ] Check for any console logs that might leak sensitive information
- [ ] Verify app properly handles background/foreground transitions

## Security Best Practices to Maintain

1. **Regular Updates:**
   - Keep Expo SDK and dependencies updated
   - Schedule regular security reviews
   - Stay informed about mobile security threats

2. **Monitoring:**
   - Implement crash reporting (Sentry, Firebase Crashlytics)
   - Monitor for unusual user behavior
   - Track API usage patterns

3. **Ongoing Testing:**
   - Regularly retest authentication flows
   - Check for new vulnerabilities in dependencies
   - Test on different device models and OS versions

## App Store Submission Security Checklist

- [ ] Remove any debugging code or excessive logging
- [ ] Verify app permissions are minimal and necessary
- [ ] Prepare proper privacy policy and terms of service
- [ ] Complete App Store privacy questionnaires accurately
- [ ] Document justification for sensitive API usage

## Additional Resources

- [OWASP Mobile Security Testing Guide](https://github.com/OWASP/owasp-mstg)
- [Expo Security Documentation](https://docs.expo.dev/guides/security/)
- [React Native Security Best Practices](https://reactnative.dev/docs/security)
- [Firebase Mobile Security](https://firebase.google.com/docs/auth/android/device-auth) 