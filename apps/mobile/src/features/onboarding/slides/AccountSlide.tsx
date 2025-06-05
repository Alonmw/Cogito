import React, { useState } from 'react';
import { StyleSheet, TextInput, Alert, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { ThemedView } from '@shared/components/ThemedView';
import { ThemedText } from '@shared/components/ThemedText';
import { ThemedButton } from '@shared/components/ThemedButton';
import { ThemedCard } from '@shared/components/ThemedCard';
import { useAuth } from '@features/auth/AuthContext';
import { Colors } from '@shared/constants/Colors';

interface AccountSlideProps {
  onAccountCreated: () => void;
  onSkip: () => void;
}

export default function AccountSlide({ onAccountCreated, onSkip }: AccountSlideProps) {
  const {
    registerWithEmail,
    signInWithEmail,
    isRegistering,
    isLoggingIn,
    registrationError,
    emailSignInError,
  } = useAuth();

  const [isLoginView, setIsLoginView] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const authInProgress = isRegistering || isLoggingIn;

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Missing Fields", "Please fill in all registration fields.");
      return;
    }
    
    try {
      await registerWithEmail(name, email, password);
      // If successful, the AuthContext will update and we'll proceed
      onAccountCreated();
    } catch (error) {
      // Error is handled by AuthContext and displayed below
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing Fields", "Please enter email and password.");
      return;
    }
    
    try {
      await signInWithEmail(email, password);
      // If successful, proceed
      onAccountCreated();
    } catch (error) {
      // Error is handled by AuthContext and displayed below
    }
  };

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
    >
      <ThemedView style={styles.container}>
        <ThemedView style={styles.content}>
          <ThemedCard style={styles.formCard}>
            <ThemedText style={styles.title} type="title">
              {isLoginView ? "Welcome back!" : "Let's create an account"}
            </ThemedText>
            
            <ThemedText style={styles.subtitle} type="default">
              {isLoginView 
                ? "Sign in to sync your preferences and history"
                : "Save your philosophical journey and preferences"
              }
            </ThemedText>

            {!isLoginView && (
              <TextInput
                style={[styles.input, { color: Colors.text, borderColor: Colors.tabIconDefault }]}
                placeholder="Your name"
                placeholderTextColor={Colors.tabIconDefault}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                editable={!authInProgress}
              />
            )}

            <TextInput
              style={[styles.input, { color: Colors.text, borderColor: Colors.tabIconDefault }]}
              placeholder="Email"
              placeholderTextColor={Colors.tabIconDefault}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!authInProgress}
            />

            <TextInput
              style={[styles.input, { color: Colors.text, borderColor: Colors.tabIconDefault }]}
              placeholder={isLoginView ? "Password" : "Password (min. 6 characters)"}
              placeholderTextColor={Colors.tabIconDefault}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!authInProgress}
            />

            <ThemedButton
              title={isLoginView ? "Sign In" : "Create Account"}
              onPress={isLoginView ? handleLogin : handleRegister}
              variant="primary"
              size="large"
              isLoading={authInProgress}
              disabled={authInProgress}
              style={styles.authButton}
            />

            {(registrationError || emailSignInError) && (
              <ThemedText style={styles.errorText}>
                Error: {registrationError || emailSignInError}
              </ThemedText>
            )}

            <Pressable onPress={toggleView} disabled={authInProgress} style={styles.toggleButton}>
              <ThemedText style={[styles.toggleText, { color: Colors.tint }]}>
                {isLoginView ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
              </ThemedText>
            </Pressable>
          </ThemedCard>
        </ThemedView>

        <ThemedView style={styles.buttonContainer}>
          <ThemedButton
            title="Skip for now"
            onPress={onSkip}
            variant="secondary"
            size="large"
            style={styles.skipButton}
            disabled={authInProgress}
          />
        </ThemedView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 100,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  formCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Lora-SemiBold',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 12,
    color: Colors.text,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    color: Colors.text,
    opacity: 0.8,
  },
  input: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: Colors.background,
  },
  authButton: {
    width: '100%',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  toggleButton: {
    paddingVertical: 8,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  buttonContainer: {
    paddingHorizontal: 20,
  },
  skipButton: {
    borderRadius: 12,
    paddingVertical: 16,
  },
}); 