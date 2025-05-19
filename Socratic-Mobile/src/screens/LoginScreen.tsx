// src/screens/LoginScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, Pressable,
  Platform, Image, TextInput, ScrollView, Alert, KeyboardAvoidingView
} from 'react-native';
import { useAuth } from '@/src/context/AuthContext';
import { Colors } from '@/src/constants/Colors';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import { ThemedButton } from '@/src/components/ThemedButton';
import { ThemedCard } from '@/src/components/ThemedCard';
import { ThemedView } from '@/src/components/ThemedView';
import { ThemedText } from '@/src/components/ThemedText';

const googleLogoUri = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png';

export default function LoginScreen() {
  const {
    googleSignIn,
    isSigningIn,
    signInError,
    continueAsGuest,
    registerWithEmail,
    isRegistering,
    registrationError,
    signInWithEmail,
    isLoggingIn,
    emailSignInError,
    sendPasswordReset,
    isSendingPasswordReset,
    passwordResetError,
    passwordResetSent,
    clearAuthErrors,
  } = useAuth();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  const [isLoginView, setIsLoginView] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');


  const googleButtonTextColor = colorScheme === 'dark' ? '#0a7ea4' : themeColors.tint;
  const googleButtonBackgroundColor = colorScheme === 'light' ? '#F0F0F0' : '#F2F2F7';
  const googleButtonBorderColor = themeColors.tabIconDefault;
  const actionButtonTextColor = colorScheme === 'dark' ? '#0a7ea4' : '#FFFFFF';

  const handleRegister = () => {
      if (!name.trim() || !email.trim() || !password.trim()) {
          Alert.alert("Missing Fields", "Please fill in all registration fields.");
          return;
      }
      registerWithEmail(name, email, password);
  };

  const handleLogin = () => {
      if (!email.trim() || !password.trim()) {
          Alert.alert("Missing Fields", "Please enter email and password.");
          return;
      }
      signInWithEmail(email, password);
  };

  const handleForgotPassword = () => {
      if (!email.trim()) {
          Alert.alert("Missing Email", "Please enter your email address in the field above first.");
          return;
      }
      sendPasswordReset(email);
  };

  const authInProgress = isSigningIn || isRegistering || isLoggingIn || isSendingPasswordReset;

  const toggleView = () => {
      setIsLoginView(!isLoginView);
      setName('');
      setEmail('');
      setPassword('');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <ThemedView style={[styles.container, { backgroundColor: themeColors.background }]}>
        <ThemedView style={styles.topSection}>
          <ThemedText type="title" style={styles.title}>
            Welcome to Socratic Partner
          </ThemedText>
          <ThemedText type="subtitle" style={styles.subtitle}>
            {isLoginView ? 'Sign in to your account' : 'Create a new account'}
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.bottomSection}>
          <ThemedCard style={styles.formCard}>
            {isLoginView ? (
              // --- Login Form ---
              <>
                <TextInput
                  style={[styles.input, { color: themeColors.text, borderColor: themeColors.tabIconDefault, backgroundColor: themeColors.background }]}
                  placeholder="Email"
                  placeholderTextColor={themeColors.tabIconDefault}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!authInProgress}
                />
                <TextInput
                  style={[styles.input, { color: themeColors.text, borderColor: themeColors.tabIconDefault, backgroundColor: themeColors.background }]}
                  placeholder="Password"
                  placeholderTextColor={themeColors.tabIconDefault}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  editable={!authInProgress}
                />
                <Pressable onPress={handleForgotPassword} disabled={authInProgress} style={styles.forgotPasswordButton}>
                  <ThemedText style={styles.forgotPasswordText} type="link">Forgot Password?</ThemedText>
                </Pressable>
                {isSendingPasswordReset && (
                  <ThemedView style={styles.feedbackContainer}>
                    <ActivityIndicator size="small" color={themeColors.text} />
                    <ThemedText style={[styles.feedbackText, { marginLeft: 10 }]}>{'Sending reset email...'}</ThemedText>
                  </ThemedView>
                )}
                {passwordResetSent && (
                  <ThemedView style={styles.feedbackContainer}>
                    <ThemedText style={[styles.feedbackText, styles.successText]}>Password reset email sent! Check your inbox.</ThemedText>
                  </ThemedView>
                )}
                {passwordResetError && (
                  <ThemedView style={styles.feedbackContainer}>
                    <ThemedText style={[styles.feedbackText, styles.errorText]}>Error: {passwordResetError}</ThemedText>
                  </ThemedView>
                )}
                <ThemedButton
                  title="Log In"
                  onPress={handleLogin}
                  variant="primary"
                  size="large"
                  isLoading={isLoggingIn}
                  disabled={authInProgress}
                  style={{ marginTop: 12 }}
                />
                {emailSignInError && (
                  <ThemedText style={styles.errorText}>Error: {emailSignInError}</ThemedText>
                )}
              </>
              // --- End Login Form ---
            ) : (
              // --- Registration Form ---
              <>
                <TextInput
                  style={[styles.input, { color: themeColors.text, borderColor: themeColors.tabIconDefault, backgroundColor: themeColors.background }]}
                  placeholder="Name"
                  placeholderTextColor={themeColors.tabIconDefault}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  editable={!authInProgress}
                />
                <TextInput
                  style={[styles.input, { color: themeColors.text, borderColor: themeColors.tabIconDefault, backgroundColor: themeColors.background }]}
                  placeholder="Email"
                  placeholderTextColor={themeColors.tabIconDefault}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!authInProgress}
                />
                <TextInput
                  style={[styles.input, { color: themeColors.text, borderColor: themeColors.tabIconDefault, backgroundColor: themeColors.background }]}
                  placeholder="Password (min. 6 characters)"
                  placeholderTextColor={themeColors.tabIconDefault}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  editable={!authInProgress}
                />
                <ThemedButton
                  title="Sign Up"
                  onPress={handleRegister}
                  variant="primary"
                  size="large"
                  isLoading={isRegistering}
                  disabled={authInProgress}
                  style={{ marginTop: 12 }}
                />
                {registrationError && (
                  <ThemedText style={styles.errorText}>Error: {registrationError}</ThemedText>
                )}
              </>
              // --- End Registration Form ---
            )}
          </ThemedCard>
          {/* --- OR Separator, Google Button, and Guest Button (ONLY IN LOGIN VIEW) --- */}
          {isLoginView && (
            <>
              <ThemedView style={styles.orSeparator}>
                <ThemedView style={[styles.line, {backgroundColor: themeColors.tabIconDefault}]} />
                <ThemedText style={[styles.orText, {color: themeColors.tabIconDefault}]}>OR</ThemedText>
                <ThemedView style={[styles.line, {backgroundColor: themeColors.tabIconDefault}]} />
              </ThemedView>
              <Pressable
                onPress={googleSignIn}
                disabled={authInProgress}
                style={({ pressed }) => [
                  styles.googleButton,
                  {
                    backgroundColor: googleButtonBackgroundColor,
                    borderColor: googleButtonBorderColor,
                  },
                  authInProgress && styles.buttonDisabled,
                  pressed && styles.buttonPressed,
                ]}
              >
                <ThemedView style={styles.googleButtonContent}>
                  <Image
                    source={{ uri: googleLogoUri }}
                    style={styles.googleLogo}
                    resizeMode="contain"
                  />
                  <ThemedText style={[styles.googleButtonText, { color: googleButtonTextColor }]}>
                    Sign in with Google
                  </ThemedText>
                </ThemedView>
              </Pressable>
              {isSigningIn && (
                <ThemedView style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={themeColors.text} />
                  <ThemedText style={{ marginLeft: 10, color: themeColors.text }}>{'Signing in...'}</ThemedText>
                </ThemedView>
              )}
              {signInError && (
                <ThemedText style={styles.errorText}>Error: {signInError}</ThemedText>
              )}
              <Pressable onPress={continueAsGuest} disabled={authInProgress} style={styles.guestButton}>
                <ThemedText style={[styles.guestText, { color: themeColors.tabIconDefault }]}>
                  Continue as Guest
                </ThemedText>
              </Pressable>
            </>
          )}
          {/* --- Toggle Login/Register View - ALWAYS VISIBLE --- */}
          <Pressable onPress={toggleView} disabled={authInProgress} style={styles.toggleButton}>
            <ThemedText style={[styles.toggleText, { color: themeColors.tint }]}>
              {isLoginView ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
            </ThemedText>
          </Pressable>
        </ThemedView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

// Styles (Keep your existing styles from the previous version)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: undefined,
  },
  topSection: {
    paddingTop: 48,
    paddingBottom: 12,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  bottomSection: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
    opacity: 0.8,
  },
  formCard: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    marginTop: 0,
  },
  input: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
    fontSize: 16,
  },
  actionButton: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 8,
    paddingVertical: 2,
  },
  forgotPasswordText: {
    fontSize: 14,
  },
  feedbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 6,
    height: 20,
    width: '100%',
    justifyContent: 'center',
  },
  feedbackText: {
    fontSize: 14,
    textAlign: 'center',
  },
  successText: {
    color: 'green',
  },
  orSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    marginVertical: 12,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  orText: {
    marginHorizontal: 10,
    fontWeight: '600',
  },
  googleButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    flexDirection: 'row',
    borderWidth: 1,
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  googleLogo: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    height: 20,
  },
  errorText: {
    color: 'red',
    marginTop: 6,
    textAlign: 'center',
    marginHorizontal: 10,
    minHeight: 20,
  },
  toggleButton: {
    marginTop: 18,
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '500',
  },
  guestButton: {
    marginTop: 14,
  },
  guestText: {
    fontSize: 15,
  },
});
