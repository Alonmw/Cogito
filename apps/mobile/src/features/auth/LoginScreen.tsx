// src/screens/LoginScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, Pressable,
  Platform, Image, TextInput, ScrollView, Alert, KeyboardAvoidingView,
  Dimensions
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
  Easing,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import { useAuth } from '@features/auth/AuthContext';
import { Colors } from '@shared/constants/Colors';
import { ThemedButton } from '@shared/components/ThemedButton';
import { ThemedCard } from '@shared/components/ThemedCard';
import { ThemedView } from '@shared/components/ThemedView';
import { ThemedText } from '@shared/components/ThemedText';
import { RandomQuote } from '@shared/components/RandomQuote';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AnimatedButton } from '@shared/components/AnimatedButton';
import { FontAwesome } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');
const googleLogoUri = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png';

// Animated components
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

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
    user,
    isGuest,
  } = useAuth();

  const router = useRouter();
  const params = useLocalSearchParams();
  const [isLoginView, setIsLoginView] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // Animation values
  const formTranslateX = useSharedValue(0);
  const cardScale = useSharedValue(1);
  const buttonScale = useSharedValue(1);
  const guestButtonScale = useSharedValue(1);
  const emailInputScale = useSharedValue(1);
  const passwordInputScale = useSharedValue(1);
  const nameInputScale = useSharedValue(1);
  const loadingOpacity = useSharedValue(0);
  const toggleButtonScale = useSharedValue(1);

  const googleButtonTextColor = Colors.tint;
  const googleButtonBackgroundColor = '#FFFFFF';
  const googleButtonBorderColor = Colors.tabIconDefault;

  // Handle redirect after successful authentication
  useEffect(() => {
    if (user || isGuest) {
      const redirectPersonaId = params.redirectPersonaId as string;
      const redirectInitialUserMessage = params.redirectInitialUserMessage as string;
      const redirectConversationId = params.redirectConversationId as string;

      if (redirectPersonaId || redirectInitialUserMessage || redirectConversationId) {
        console.log('[LOGIN] User authenticated, redirecting to chat with params:', { 
          redirectPersonaId, 
          redirectInitialUserMessage, 
          redirectConversationId 
        });
        
        const redirectParams: any = {};
        if (redirectPersonaId) redirectParams.personaId = redirectPersonaId;
        if (redirectInitialUserMessage) redirectParams.initialUserMessage = redirectInitialUserMessage;
        if (redirectConversationId) redirectParams.conversationId = redirectConversationId;
        
        router.replace({ pathname: '/(tabs)', params: redirectParams });
      } else {
        console.log('[LOGIN] User authenticated, no redirect params, going to persona selection');
        router.replace('/persona-selection');
      }
    }
  }, [user, isGuest, params, router]);

  // Animation for loading states
  useEffect(() => {
    const authInProgress = isSigningIn || isRegistering || isLoggingIn || isSendingPasswordReset;
    loadingOpacity.value = withTiming(authInProgress ? 1 : 0, {
      duration: 300,
      easing: Easing.inOut(Easing.ease),
    });
  }, [isSigningIn, isRegistering, isLoggingIn, isSendingPasswordReset]);

  const handleRegister = () => {
    buttonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
    
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Missing Fields", "Please fill in all registration fields.");
      return;
    }
    registerWithEmail(name, email, password);
  };

  const handleLogin = () => {
    buttonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
    
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

  const handleGoogleSignIn = () => {
    googleSignIn();
  };

  const handleContinueAsGuest = () => {
    guestButtonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
    continueAsGuest();
  };

  const authInProgress = isSigningIn || isRegistering || isLoggingIn || isSendingPasswordReset;

  const toggleView = () => {
    toggleButtonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );

    // Simple immediate state change without complex animation
    setIsLoginView(!isLoginView);
    setName('');
    setEmail('');
    setPassword('');
    
    // Simple scale animation for the form card
    cardScale.value = withSequence(
      withTiming(0.95, { duration: 150 }),
      withTiming(1, { duration: 150 })
    );
  };

  const handleInputFocus = (inputName: string, scaleValue: Animated.SharedValue<number>) => {
    setFocusedInput(inputName);
    scaleValue.value = withSpring(1.02, { damping: 15, stiffness: 200 });
  };

  const handleInputBlur = (scaleValue: Animated.SharedValue<number>) => {
    setFocusedInput(null);
    scaleValue.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  // Animated styles
  const formAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: formTranslateX.value }],
    };
  });

  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: cardScale.value }],
    };
  });

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  const guestButtonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: guestButtonScale.value }],
    };
  });

  const emailInputAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: emailInputScale.value }],
    };
  });

  const passwordInputAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: passwordInputScale.value }],
    };
  });

  const nameInputAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: nameInputScale.value }],
    };
  });

  const toggleButtonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: toggleButtonScale.value }],
    };
  });

  const loadingAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: loadingOpacity.value,
    };
  });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <ThemedView style={[styles.container, { backgroundColor: Colors.background }]}>
        {/* Gradient overlay */}
        <View style={styles.gradientOverlay} />
        
        <ThemedView style={styles.topSection}>
          <ThemedView style={styles.quoteContainer}>
            <RandomQuote />
          </ThemedView>
        </ThemedView>
        
        <ThemedView style={styles.bottomSection}>
          <Animated.View style={[formAnimatedStyle, { width: '100%', alignItems: 'center' }]}>
            <Animated.View style={[cardAnimatedStyle, { width: '100%', maxWidth: 400 }]}>
              <ThemedCard style={styles.formCard}>
                {isLoginView ? (
                  // --- Login Form ---
                  <>
                    <Animated.View style={[emailInputAnimatedStyle, { width: '100%' }]}>
                      <AnimatedTextInput
                        style={[
                          styles.input,
                          {
                            color: Colors.text,
                            borderColor: focusedInput === 'email' ? Colors.tint : Colors.tabIconDefault,
                            backgroundColor: Colors.card,
                            borderWidth: focusedInput === 'email' ? 2 : 1,
                          }
                        ]}
                        placeholder="Email"
                        placeholderTextColor={Colors.tabIconDefault}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        editable={!authInProgress}
                        onFocus={() => handleInputFocus('email', emailInputScale)}
                        onBlur={() => handleInputBlur(emailInputScale)}
                      />
                    </Animated.View>
                    
                    <Animated.View style={[passwordInputAnimatedStyle, { width: '100%' }]}>
                      <AnimatedTextInput
                        style={[
                          styles.input,
                          {
                            color: Colors.text,
                            borderColor: focusedInput === 'password' ? Colors.tint : Colors.tabIconDefault,
                            backgroundColor: Colors.card,
                            borderWidth: focusedInput === 'password' ? 2 : 1,
                          }
                        ]}
                        placeholder="Password"
                        placeholderTextColor={Colors.tabIconDefault}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        editable={!authInProgress}
                        onFocus={() => handleInputFocus('password', passwordInputScale)}
                        onBlur={() => handleInputBlur(passwordInputScale)}
                      />
                    </Animated.View>
                    
                    <Pressable onPress={handleForgotPassword} disabled={authInProgress} style={styles.forgotPasswordButton}>
                      <ThemedText style={styles.forgotPasswordText} type="link">Forgot Password?</ThemedText>
                    </Pressable>
                    
                    {isSendingPasswordReset && (
                      <Animated.View style={[styles.feedbackContainer, loadingAnimatedStyle]}>
                        <ActivityIndicator size="small" color={Colors.tint} />
                        <ThemedText style={[styles.feedbackText, { marginLeft: 10 }]}>Sending reset email...</ThemedText>
                      </Animated.View>
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
                    
                    <Animated.View style={[buttonAnimatedStyle, { width: '100%' }]}>
                      <ThemedButton
                        title="Log In"
                        onPress={handleLogin}
                        variant="primary"
                        size="large"
                        isLoading={isLoggingIn}
                        disabled={authInProgress}
                        style={styles.primaryButton}
                      />
                    </Animated.View>
                    
                    {emailSignInError && (
                      <ThemedText style={styles.errorText}>Error: {emailSignInError}</ThemedText>
                    )}
                  </>
                ) : (
                  // --- Registration Form ---
                  <>
                    <Animated.View style={[nameInputAnimatedStyle, { width: '100%' }]}>
                      <AnimatedTextInput
                        style={[
                          styles.input,
                          {
                            color: Colors.text,
                            borderColor: focusedInput === 'name' ? Colors.tint : Colors.tabIconDefault,
                            backgroundColor: Colors.card,
                            borderWidth: focusedInput === 'name' ? 2 : 1,
                          }
                        ]}
                        placeholder="Name"
                        placeholderTextColor={Colors.tabIconDefault}
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                        editable={!authInProgress}
                        onFocus={() => handleInputFocus('name', nameInputScale)}
                        onBlur={() => handleInputBlur(nameInputScale)}
                      />
                    </Animated.View>
                    
                    <Animated.View style={[emailInputAnimatedStyle, { width: '100%' }]}>
                      <AnimatedTextInput
                        style={[
                          styles.input,
                          {
                            color: Colors.text,
                            borderColor: focusedInput === 'email' ? Colors.tint : Colors.tabIconDefault,
                            backgroundColor: Colors.card,
                            borderWidth: focusedInput === 'email' ? 2 : 1,
                          }
                        ]}
                        placeholder="Email"
                        placeholderTextColor={Colors.tabIconDefault}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        editable={!authInProgress}
                        onFocus={() => handleInputFocus('email', emailInputScale)}
                        onBlur={() => handleInputBlur(emailInputScale)}
                      />
                    </Animated.View>
                    
                    <Animated.View style={[passwordInputAnimatedStyle, { width: '100%' }]}>
                      <AnimatedTextInput
                        style={[
                          styles.input,
                          {
                            color: Colors.text,
                            borderColor: focusedInput === 'password' ? Colors.tint : Colors.tabIconDefault,
                            backgroundColor: Colors.card,
                            borderWidth: focusedInput === 'password' ? 2 : 1,
                          }
                        ]}
                        placeholder="Password (min. 6 characters)"
                        placeholderTextColor={Colors.tabIconDefault}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        editable={!authInProgress}
                        onFocus={() => handleInputFocus('password', passwordInputScale)}
                        onBlur={() => handleInputBlur(passwordInputScale)}
                      />
                    </Animated.View>
                    
                    <Animated.View style={[buttonAnimatedStyle, { width: '100%' }]}>
                      <ThemedButton
                        title="Sign Up"
                        onPress={handleRegister}
                        variant="primary"
                        size="large"
                        isLoading={isRegistering}
                        disabled={authInProgress}
                        style={styles.primaryButton}
                      />
                    </Animated.View>
                    
                    {registrationError && (
                      <ThemedText style={styles.errorText}>Error: {registrationError}</ThemedText>
                    )}
                  </>
                )}
              </ThemedCard>
            </Animated.View>
          </Animated.View>
          
          {/* OR Separator, Google Button, and Guest Button (ONLY IN LOGIN VIEW) */}
          {isLoginView && (
            <>
              <ThemedView style={styles.orSeparator}>
                <ThemedView style={[styles.line, { backgroundColor: Colors.tabIconDefault }]} />
                <ThemedText style={[styles.orText, { color: Colors.tabIconDefault }]}>OR</ThemedText>
                <ThemedView style={[styles.line, { backgroundColor: Colors.tabIconDefault }]} />
              </ThemedView>
              
              <AnimatedButton
                title="Sign in with Google"
                onPress={handleGoogleSignIn}
                variant="secondary"
                size="large"
                style={styles.googleButton}
                isLoading={isSigningIn}
                disabled={authInProgress}
                icon={<FontAwesome name="google" size={18} color={Colors.text} style={{ marginRight: 12 }} />}
              />
              
              {signInError && (
                <ThemedText style={styles.errorText}>Error: {signInError}</ThemedText>
              )}
              
              <AnimatedPressable 
                onPress={handleContinueAsGuest} 
                disabled={authInProgress} 
                style={[guestButtonAnimatedStyle, styles.guestButton]}
              >
                <ThemedText style={[styles.guestText, { color: Colors.tabIconDefault }]}>
                  Continue as Guest
                </ThemedText>
              </AnimatedPressable>
            </>
          )}
          
          {/* Toggle Login/Register View - ALWAYS VISIBLE */}
          <AnimatedPressable 
            onPress={toggleView} 
            disabled={authInProgress} 
            style={[toggleButtonAnimatedStyle, styles.toggleButton]}
          >
            <ThemedText style={[styles.toggleText, { color: Colors.tint }]}>
              {isLoginView ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
            </ThemedText>
          </AnimatedPressable>
        </ThemedView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

// Enhanced styles with better visual design
const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    opacity: 0.05,
  },
  topSection: {
    paddingTop: 80,
    paddingBottom: 8,
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    paddingHorizontal: 16,
  },
  quoteContainer: {
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
  },
  bottomSection: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  formCard: {
    width: '100%',
    alignItems: 'center',
    padding: 20,
    marginBottom: 12,
    borderRadius: 20,
    backgroundColor: Colors.card,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  input: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '500',
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButton: {
    marginTop: 12,
    borderRadius: 12,
    shadowColor: Colors.tint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  feedbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 4,
    minHeight: 20,
    width: '100%',
    justifyContent: 'center',
  },
  feedbackText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  successText: {
    color: '#10B981',
    fontWeight: '600',
  },
  orSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    marginVertical: 12,
  },
  line: {
    flex: 1,
    height: 1,
    opacity: 0.3,
  },
  orText: {
    marginHorizontal: 16,
    fontWeight: '600',
    fontSize: 14,
  },
  googleButton: {
    width: '100%',
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: Colors.card,
    borderColor: Colors.tabIconDefault,
    borderWidth: 1,
  },
  errorText: {
    color: '#EF4444',
    marginTop: 4,
    textAlign: 'center',
    marginHorizontal: 10,
    minHeight: 20,
    fontSize: 14,
    fontWeight: '500',
  },
  toggleButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '600',
  },
  guestButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  guestText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
