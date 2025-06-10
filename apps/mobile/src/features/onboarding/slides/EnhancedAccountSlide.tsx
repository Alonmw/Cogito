import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, Alert, Platform, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { ThemedView } from '@shared/components/ThemedView';
import { ThemedText } from '@shared/components/ThemedText';
import { ThemedCard } from '@shared/components/ThemedCard';
import { AnimatedButton } from '@shared/components/AnimatedButton';
import { useAuth } from '@features/auth/AuthContext';
import { Colors } from '@shared/constants/Colors';

interface EnhancedAccountSlideProps {
  onAccountCreated: () => void;
  onSkip: () => void;
}

export default function EnhancedAccountSlide({ onAccountCreated, onSkip }: EnhancedAccountSlideProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithEmail } = useAuth();

  // Animation values
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(30);
  const formOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(30);
  const buttonScale = useSharedValue(0);

  useEffect(() => {
    // Orchestrated entrance animation
    titleOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
    titleTranslateY.value = withDelay(200, withSpring(0));
    
    formOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
    formTranslateY.value = withDelay(400, withSpring(0));
    
    buttonScale.value = withDelay(600, withSpring(1, { damping: 15, stiffness: 150 }));
  }, []);

  const handleAuth = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // For now, just use sign in for both cases since signup isn't available
      await signInWithEmail(email, password);
      onAccountCreated();
    } catch (error: any) {
      setError(error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

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

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.content}>
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
          
          <Animated.View style={formStyle}>
            <TextInput
              style={[styles.input, { borderColor: Colors.tabIconDefault, color: Colors.text }]}
              placeholder="Email"
              placeholderTextColor={Colors.tabIconDefault}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            
            <TextInput
              style={[styles.input, { borderColor: Colors.tabIconDefault, color: Colors.text }]}
              placeholder="Password"
              placeholderTextColor={Colors.tabIconDefault}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            
            {error ? (
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            ) : null}
            
            <AnimatedButton
              title={isSignUp ? 'Create Account' : 'Sign In'}
              onPress={handleAuth}
              variant="primary"
              size="large"
              style={styles.authButton}
              isLoading={isLoading}
            />
            
            <Pressable
              style={styles.toggleButton}
              onPress={() => setIsSignUp(!isSignUp)}
            >
              <ThemedText style={[styles.toggleText, { color: Colors.tint }]}>
                {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
              </ThemedText>
            </Pressable>
          </Animated.View>
        </ThemedCard>
      </ThemedView>
      
      <Animated.View style={[styles.buttonContainer, buttonStyle]}>
        <AnimatedButton
          title="Skip for now"
          onPress={onSkip}
          variant="secondary"
          size="large"
          style={styles.skipButton}
        />
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 120,
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