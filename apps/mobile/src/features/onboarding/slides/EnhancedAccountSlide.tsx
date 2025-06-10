import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, Alert, Platform, Pressable, Dimensions, Image } from 'react-native';
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
                            color: Colors.text,
                            borderColor: focusedInput === 'name' ? Colors.tint : Colors.tabIconDefault,
                            backgroundColor: Colors.background,
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
                  )}
                  
                  <Animated.View style={[emailInputAnimatedStyle, styles.inputContainer]}>
                    <AnimatedTextInput
                      style={[
                        styles.input,
                        {
                          color: Colors.text,
                          borderColor: focusedInput === 'email' ? Colors.tint : Colors.tabIconDefault,
                          backgroundColor: Colors.background,
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
                      editable={!authInProgress}
                      onFocus={() => handleInputFocus('email', emailInputScale)}
                      onBlur={() => handleInputBlur(emailInputScale)}
                    />
                  </Animated.View>
                  
                  <Animated.View style={[passwordInputAnimatedStyle, styles.inputContainer]}>
                    <AnimatedTextInput
                      style={[
                        styles.input,
                        {
                          color: Colors.text,
                          borderColor: focusedInput === 'password' ? Colors.tint : Colors.tabIconDefault,
                          backgroundColor: Colors.background,
                          borderWidth: focusedInput === 'password' ? 2 : 1,
                        }
                      ]}
                      placeholder={isSignUp ? "Password (min. 6 characters)" : "Password"}
                      placeholderTextColor={Colors.tabIconDefault}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                      editable={!authInProgress}
                      onFocus={() => handleInputFocus('password', passwordInputScale)}
                      onBlur={() => handleInputBlur(passwordInputScale)}
                    />
                  </Animated.View>
                  
                  {(registrationError || emailSignInError) && (
                    <ThemedText style={styles.errorText}>
                      Error: {registrationError || emailSignInError}
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
                      disabled={authInProgress}
                    />
                  </Animated.View>
                  
                  <AnimatedPressable
                    style={[toggleButtonAnimatedStyle, styles.toggleButton]}
                    onPress={handleToggleView}
                    disabled={authInProgress}
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
              disabled={authInProgress}
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
  const welcomeMessage = user?.displayName
    ? `Welcome, ${user.displayName.split(' ')[0]}!`
    : 'Account created successfully!';

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  const logoStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${logoRotation.value}deg` },
      { scale: logoScale.value },
    ],
  }));

  return (
    <Animated.View style={[styles.successContainer, animatedStyle]}>
      <Animated.View style={[styles.logoContainer, logoStyle]}>
        <Image
          source={require('@/shared/assets/images/owl-logo-prod.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
      <ThemedText style={styles.successTitle} type="title">{welcomeMessage}</ThemedText>
      <ThemedText style={styles.successSubtitle} type="default">
        You're all set to begin your journey.
      </ThemedText>
      <AnimatedButton
        title="Continue"
        onPress={onContinue}
        variant="primary"
        size="large"
        style={styles.continueButton}
      />
    </Animated.View>
  );
};

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
    width: '100%',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
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
    alignSelf: 'stretch',
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
    color: '#EF4444',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
    minHeight: 20,
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
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    width: '100%',
  },
  logoContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  successSubtitle: {
    fontSize: 18,
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 32,
  },
  continueButton: {
    width: '80%',
    maxWidth: 300,
  },
}); 