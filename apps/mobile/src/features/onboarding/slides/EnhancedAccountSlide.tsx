import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, Alert, Platform, Pressable, Dimensions, Image, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { ThemedView } from '@shared/components/ThemedView';
import { ThemedText } from '@shared/components/ThemedText';
import { ThemedCard } from '@shared/components/ThemedCard';
import { AnimatedButton } from '@shared/components/AnimatedButton';
import { useAuth } from '@features/auth/AuthContext';
import { Colors } from '@shared/constants/Colors';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { FontAwesome } from '@expo/vector-icons';

// Animated components
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface EnhancedAccountSlideProps {
  onAccountCreated: () => void;
  onSkip: () => void;
}

export default function EnhancedAccountSlide({ onAccountCreated, onSkip }: EnhancedAccountSlideProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(true);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const {
    signInWithEmail,
    registerWithEmail,
    isRegistering,
    registrationError,
    isLoggingIn,
    emailSignInError,
    user,
    googleSignIn,
    isSigningIn,
    signInError,
  } = useAuth();

  // Animation values
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(30);
  const formOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(30);
  const buttonScale = useSharedValue(0);
  const cardScale = useSharedValue(1);
  const nameInputScale = useSharedValue(1);
  const emailInputScale = useSharedValue(1);
  const passwordInputScale = useSharedValue(1);
  const authButtonScale = useSharedValue(1);
  const toggleButtonScale = useSharedValue(1);
  const skipButtonScale = useSharedValue(1);
  const successViewOpacity = useSharedValue(0);
  const successViewScale = useSharedValue(0.8);
  const logoScale = useSharedValue(0);
  const logoRotation = useSharedValue(30);

  useEffect(() => {
    // Orchestrated entrance animation
    titleOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
    titleTranslateY.value = withDelay(200, withSpring(0));
    
    formOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
    formTranslateY.value = withDelay(400, withSpring(0));
    
    buttonScale.value = withDelay(600, withSpring(1, { damping: 15, stiffness: 150 }));
  }, []);

  // Effect to handle successful authentication
  useEffect(() => {
    if (user && !isRegistering && !isLoggingIn) {
      setShowSuccess(true);
      successViewOpacity.value = withTiming(1, { duration: 400 });
      successViewScale.value = withSpring(1);
      
      logoScale.value = withDelay(200, withSpring(1, { damping: 15, stiffness: 150 }));
      logoRotation.value = withDelay(200, withSpring(0, { damping: 20, stiffness: 100 }));
    }
  }, [user, isRegistering, isLoggingIn]);

  const handleAuth = async () => {
    authButtonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );

    if (isSignUp) {
      if (!name.trim() || !email.trim() || !password.trim()) {
        Alert.alert("Missing Fields", "Please fill in all registration fields.");
        return;
      }
      try {
        await registerWithEmail(name, email, password);
      } catch (error: any) {
        // Error is handled by the auth context
      }
    } else {
      if (!email.trim() || !password.trim()) {
        Alert.alert("Missing Fields", "Please enter email and password.");
        return;
      }
      try {
        await signInWithEmail(email, password);
      } catch (error: any) {
        // Error is handled by the auth context
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await googleSignIn();
    } catch (error) {
      // Error is handled by the auth context
      // We could show an alert here if we wanted to.
    }
  };

  const handleToggleView = () => {
    toggleButtonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );

    // Simple immediate state change with card animation
    setIsSignUp(!isSignUp);
    setName('');
    setEmail('');
    setPassword('');
    
    // Simple scale animation for the form card
    cardScale.value = withSequence(
      withTiming(0.95, { duration: 150 }),
      withTiming(1, { duration: 150 })
    );
  };

  const handleSkip = () => {
    skipButtonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
    onSkip();
  };

  const handleInputFocus = (inputName: string, scaleValue: Animated.SharedValue<number>) => {
    setFocusedInput(inputName);
    scaleValue.value = withSpring(1.02, { damping: 15, stiffness: 200 });
  };

  const handleInputBlur = (scaleValue: Animated.SharedValue<number>) => {
    setFocusedInput(null);
    scaleValue.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  const authInProgress = isRegistering || isLoggingIn;
  const anyAuthInProgress = authInProgress || isSigningIn;

  // Animated styles
  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const formStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslateY.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  const nameInputAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: nameInputScale.value }],
  }));

  const emailInputAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: emailInputScale.value }],
  }));

  const passwordInputAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: passwordInputScale.value }],
  }));

  const authButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: authButtonScale.value }],
  }));

  const toggleButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: toggleButtonScale.value }],
  }));

  const skipButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: skipButtonScale.value }],
  }));

  const successViewAnimatedStyle = useAnimatedStyle(() => ({
    opacity: successViewOpacity.value,
    transform: [{ scale: successViewScale.value }],
  }));

  return (
    <ThemedView style={[styles.container, showSuccess && { paddingTop: 0, paddingBottom: 0, justifyContent: 'center' }]}>
      {showSuccess ? (
        <SuccessView 
          user={user} 
          opacity={successViewOpacity} 
          scale={successViewScale}
          logoScale={logoScale}
          logoRotation={logoRotation}
          onContinue={onAccountCreated}
        />
      ) : (
        <>
          <ThemedView style={styles.content}>
            <Animated.View style={[cardAnimatedStyle, { width: '100%' }]}>
              <ThemedCard style={styles.formCard}>
                <Animated.View style={titleStyle}>
                  <ThemedText style={styles.title} type="title">
                    {isSignUp ? 'Create Account' : 'Sign In'}
                  </ThemedText>
                  <ThemedText style={styles.subtitle} type="default">
                    {isSignUp 
                      ? 'Create an account to save your conversations and preferences'
                      : 'Sign in to access your saved conversations'
                    }
                  </ThemedText>
                </Animated.View>
                
                <Animated.View style={[formStyle, { width: '100%' }]}>
                  {isSignUp && (
                    <Animated.View style={[nameInputAnimatedStyle, styles.inputContainer]}>
                      <AnimatedTextInput
                        style={[
                          styles.input,
                          {
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
                        editable={!anyAuthInProgress}
                        onFocus={() => handleInputFocus('name', nameInputScale)}
                        onBlur={() => handleInputBlur(nameInputScale)}
                      />
                    </Animated.View>
                  )}
                  
                  <Animated.View style={[emailInputAnimatedStyle, styles.inputContainer]}>
                    <AnimatedTextInput
                      style={[
                        styles.input,
                        {
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
                      autoCorrect={false}
                      editable={!anyAuthInProgress}
                      onFocus={() => handleInputFocus('email', emailInputScale)}
                      onBlur={() => handleInputBlur(emailInputScale)}
                    />
                  </Animated.View>
                  
                  <Animated.View style={[passwordInputAnimatedStyle, styles.inputContainer]}>
                    <AnimatedTextInput
                      style={[
                        styles.input,
                        {
                          borderColor: focusedInput === 'password' ? Colors.tint : Colors.tabIconDefault,
                          backgroundColor: Colors.card,
                          borderWidth: focusedInput === 'password' ? 2 : 1,
                        }
                      ]}
                      placeholder={isSignUp ? "Password (min. 6 characters)" : "Password"}
                      placeholderTextColor={Colors.tabIconDefault}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                      editable={!anyAuthInProgress}
                      onFocus={() => handleInputFocus('password', passwordInputScale)}
                      onBlur={() => handleInputBlur(passwordInputScale)}
                    />
                  </Animated.View>
                  
                  {(registrationError || emailSignInError || signInError) && (
                    <ThemedText style={styles.errorText}>
                      Error: {registrationError || emailSignInError || signInError}
                    </ThemedText>
                  )}
                  
                  <Animated.View style={[authButtonAnimatedStyle, { width: '100%' }]}>
                    <AnimatedButton
                      title={isSignUp ? 'Create Account' : 'Sign In'}
                      onPress={handleAuth}
                      variant="primary"
                      size="large"
                      style={styles.authButton}
                      isLoading={authInProgress}
                      disabled={anyAuthInProgress}
                    />
                  </Animated.View>

                  <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />
                    <ThemedText style={styles.dividerText}>Or</ThemedText>
                    <View style={styles.dividerLine} />
                  </View>

                  <Animated.View style={[{ width: '100%' }]}>
                    <AnimatedButton
                      title={isSignUp ? "Sign up with Google" : "Sign in with Google"}
                      onPress={handleGoogleSignIn}
                      variant="secondary"
                      size="large"
                      style={styles.googleButton}
                      isLoading={isSigningIn}
                      disabled={anyAuthInProgress}
                      icon={<FontAwesome name="google" size={18} color={Colors.text} style={{ marginRight: 12 }} />}
                    />
                  </Animated.View>
                  
                  <AnimatedPressable
                    style={[toggleButtonAnimatedStyle, styles.toggleButton]}
                    onPress={handleToggleView}
                    disabled={anyAuthInProgress}
                  >
                    <ThemedText style={[styles.toggleText, { color: Colors.tint }]}>
                      {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
                    </ThemedText>
                  </AnimatedPressable>
                </Animated.View>
              </ThemedCard>
            </Animated.View>
          </ThemedView>
          
          <Animated.View style={[styles.buttonContainer, buttonStyle]}>
            <AnimatedPressable
              style={[skipButtonAnimatedStyle, styles.skipButton]}
              onPress={handleSkip}
              disabled={anyAuthInProgress}
            >
              <ThemedText style={[styles.skipButtonText, { color: Colors.tabIconDefault }]}>
                Skip for now
              </ThemedText>
            </AnimatedPressable>
          </Animated.View>
        </>
      )}
    </ThemedView>
  );
}

// Success View Component
interface SuccessViewProps {
  user: FirebaseAuthTypes.User | null;
  opacity: Animated.SharedValue<number>;
  scale: Animated.SharedValue<number>;
  logoScale: Animated.SharedValue<number>;
  logoRotation: Animated.SharedValue<number>;
  onContinue: () => void;
}

const SuccessView: React.FC<SuccessViewProps> = ({ user, opacity, scale, logoScale, logoRotation, onContinue }) => {
  const successButtonScale = useSharedValue(1);

  const handleContinue = () => {
    successButtonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
    onContinue();
  };

  const successViewStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });
  
  const logoStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotation.value}deg` },
    ],
  }));

  return (
    <Animated.View style={[successStyles.successContainer, successViewStyle]}>
      <ThemedCard style={successStyles.successCard}>
        <Animated.View style={logoStyle}>
          <Image
            source={require('@shared/assets/images/owl-logo-prod.png')}
            style={successStyles.successLogo}
            resizeMode="contain"
          />
        </Animated.View>
        <ThemedText style={successStyles.successTitle}>
          Welcome, {user?.displayName || 'Explorer'}!
        </ThemedText>
        <ThemedText style={successStyles.successSubtitle}>
          You're all set. Let the enlightening conversations begin.
        </ThemedText>
        <AnimatedButton
          title="Continue"
          onPress={handleContinue}
          variant="primary"
          size="large"
          style={successStyles.successButton}
        />
      </ThemedCard>
    </Animated.View>
  );
};

const successStyles = StyleSheet.create({
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'transparent',
  },
  successCard: {
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: Colors.card,
    width: '100%',
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 15,
  },
  successLogo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    color: Colors.text,
  },
  successSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: Colors.text,
    opacity: 0.8,
    lineHeight: 24,
  },
  successButton: {
    borderRadius: 12,
    paddingVertical: 16,
    width: '100%',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 80,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formCard: {
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    backgroundColor: Colors.card,
  },
  title: {
    fontFamily: 'Lora-SemiBold',
    fontSize: 26,
    textAlign: 'center',
    marginBottom: 8,
    color: Colors.text,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
    color: Colors.text,
    opacity: 0.8,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 12,
  },
  input: {
    width: '100%',
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '500',
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    color: Colors.text,
  },
  authButton: {
    width: '100%',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 12,
    marginBottom: 8,
    shadowColor: Colors.tint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    color: Colors.destructive,
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 4,
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  googleButton: {
    borderRadius: 25,
    paddingVertical: 12,
    backgroundColor: Colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  googleButtonText: {
    color: Colors.text,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.tabIconDefault,
    opacity: 0.3,
  },
  dividerText: {
    marginHorizontal: 12,
    color: Colors.tabIconDefault,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButton: {
    flex: 2,
    marginLeft: 8,
  },
}); 