// src/screens/LoginScreen.tsx
import React, { useState, useEffect } from 'react'; // Added useEffect
import {
  View, Text, StyleSheet, ActivityIndicator, Pressable,
  Platform, Image, TextInput, ScrollView, Alert
} from 'react-native';
import { useAuth } from '@/src/context/AuthContext';
import { Colors } from '@/src/constants/Colors';
import { useColorScheme } from '@/src/hooks/useColorScheme';

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
    sendPasswordReset, // <-- Get reset function
    isSendingPasswordReset, // <-- Get reset loading state
    passwordResetError, // <-- Get reset error state
    passwordResetSent, // <-- Get reset success state
    clearAuthErrors, // <-- Get clear errors function
  } = useAuth();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  const [isLoginView, setIsLoginView] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Clear errors when switching views
  useEffect(() => {
    clearAuthErrors();
  }, [isLoginView, clearAuthErrors]);


  // Determine text/background colors for Google button
  const googleButtonTextColor = colorScheme === 'dark' ? '#0a7ea4' : themeColors.tint;
  const googleButtonBackgroundColor = colorScheme === 'light' ? '#F0F0F0' : '#F2F2F7';
  const googleButtonBorderColor = themeColors.tabIconDefault;

  // Determine text color for Login/Register buttons
  const actionButtonTextColor = colorScheme === 'dark' ? '#0a7ea4' : '#FFFFFF';

  // Handle Registration Button Press
  const handleRegister = () => {
      if (!name.trim() || !email.trim() || !password.trim()) {
          Alert.alert("Missing Fields", "Please fill in all registration fields.");
          return;
      }
      registerWithEmail(name, email, password);
      // Registration success/verification message is handled by Alert in context for now
  };

  // Handle Login Button Press
  const handleLogin = () => {
      if (!email.trim() || !password.trim()) {
          Alert.alert("Missing Fields", "Please enter email and password.");
          return;
      }
      signInWithEmail(email, password);
  };

  // --- Handle Forgot Password Press ---
  const handleForgotPassword = () => {
      if (!email.trim()) {
          Alert.alert("Missing Email", "Please enter your email address in the field above first.");
          return;
      }
      // Call the function from context, passing the current email value
      sendPasswordReset(email);
  };
  // --- End Handle Forgot Password ---


  // Determine if any auth action is in progress
  const authInProgress = isSigningIn || isRegistering || isLoggingIn || isSendingPasswordReset;

  // Function to toggle between Login and Register views
  const toggleView = () => {
      setIsLoginView(!isLoginView);
      // Clear form fields when toggling
      setName('');
      setEmail('');
      setPassword('');
      clearAuthErrors(); // Clear errors when switching views
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: themeColors.background }]}>
      <Text style={[styles.title, { color: themeColors.text }]}>
        Welcome to Socratic Partner
      </Text>
      <Text style={[styles.subtitle, { color: themeColors.text }]}>
        {isLoginView ? 'Sign in to your account' : 'Create a new account'}
      </Text>

      {/* --- Conditionally Render Login or Register Form --- */}
      {isLoginView ? (
        // --- Login Form ---
        <View style={styles.formContainer}>
          <TextInput
            style={[styles.input, { color: themeColors.text, borderColor: themeColors.tabIconDefault, backgroundColor: themeColors.background }]}
            placeholder="Email"
            placeholderTextColor={themeColors.tabIconDefault}
            value={email}
            onChangeText={setEmail} // Allow email input for password reset
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
          {/* Forgot Password Link */}
          <Pressable onPress={handleForgotPassword} disabled={authInProgress} style={styles.forgotPasswordButton}>
              <Text style={[styles.forgotPasswordText, { color: themeColors.tabIconDefault }]}>Forgot Password?</Text>
          </Pressable>
          {/* Password Reset Feedback */}
          {isSendingPasswordReset && (
              <View style={styles.feedbackContainer}>
                  <ActivityIndicator size="small" color={themeColors.text} />
                  <Text style={[styles.feedbackText, { marginLeft: 10, color: themeColors.text }]}>Sending reset email...</Text>
              </View>
          )}
          {passwordResetSent && (
              <View style={styles.feedbackContainer}>
                  <Text style={[styles.feedbackText, styles.successText]}>Password reset email sent! Check your inbox.</Text>
              </View>
          )}
          {passwordResetError && (
              <View style={styles.feedbackContainer}>
                  <Text style={[styles.feedbackText, styles.errorText]}>Error: {passwordResetError}</Text>
              </View>
          )}
          {/* End Password Reset Feedback */}

          <Pressable
            onPress={handleLogin}
            disabled={authInProgress}
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: themeColors.tint },
              authInProgress && styles.buttonDisabled,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={[styles.actionButtonText, { color: actionButtonTextColor }]}>Log In</Text>
          </Pressable>
          {/* Email Login Loading/Error */}
          {isLoggingIn && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={themeColors.text} />
                <Text style={{ marginLeft: 10, color: themeColors.text }}>Logging in...</Text>
              </View>
          )}
          {emailSignInError && (
            <Text style={styles.errorText}>Error: {emailSignInError}</Text>
          )}
        </View>
        // --- End Login Form ---
      ) : (
        // --- Registration Form ---
        <View style={styles.formContainer}>
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
          <Pressable
            onPress={handleRegister}
            disabled={authInProgress}
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: themeColors.tint },
              authInProgress && styles.buttonDisabled,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={[styles.actionButtonText, { color: actionButtonTextColor }]}>Sign Up</Text>
          </Pressable>
          {/* Registration Loading/Error */}
          {isRegistering && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={themeColors.text} />
                <Text style={{ marginLeft: 10, color: themeColors.text }}>Registering...</Text>
              </View>
          )}
          {registrationError && (
            <Text style={styles.errorText}>Error: {registrationError}</Text>
          )}
        </View>
        // --- End Registration Form ---
      )}
      {/* --- End Conditional Render --- */}


      {/* --- OR Separator --- */}
      {/* Only show OR and Google/Guest if in Login view */}
      {isLoginView && (
        <>
            <View style={styles.orSeparator}>
                <View style={[styles.line, {backgroundColor: themeColors.tabIconDefault}]} />
                <Text style={[styles.orText, {color: themeColors.tabIconDefault}]}>OR</Text>
                <View style={[styles.line, {backgroundColor: themeColors.tabIconDefault}]} />
            </View>

            {/* --- Google Sign-In Button --- */}
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
                <View style={styles.googleButtonContent}>
                <Image
                    source={{ uri: googleLogoUri }}
                    style={styles.googleLogo}
                    resizeMode="contain"
                />
                <Text style={[styles.googleButtonText, { color: googleButtonTextColor }]}>
                    Sign in with Google
                </Text>
                </View>
            </Pressable>
            {/* Google Sign In Loading/Error */}
            {isSigningIn && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={themeColors.text} />
                    <Text style={{ marginLeft: 10, color: themeColors.text }}>Signing in...</Text>
                </View>
            )}
            {signInError && ( // Google specific error
                <Text style={styles.errorText}>Error: {signInError}</Text>
            )}
            {/* --- End Google Sign-In Button --- */}


            {/* --- Toggle Login/Register View --- */}
          <Pressable onPress={toggleView} disabled={authInProgress} style={styles.toggleButton}>
              <Text style={[styles.toggleText, { color: themeColors.tint }]}>
                  {isLoginView ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
              </Text>
          </Pressable>
          {/* --- End Toggle --- */}


            {/* Continue as Guest Button/Link */}
            <Pressable onPress={continueAsGuest} disabled={authInProgress} style={styles.guestButton}>
                <Text style={[styles.guestText, { color: themeColors.tabIconDefault }]}>
                Continue as Guest
                </Text>
            </Pressable>
        </>
      )}

    </ScrollView> // Close ScrollView
  );
}

// Updated Styles
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    opacity: 0.8,
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  actionButton: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10, // Added margin top
  },
  actionButtonText: {
    // Color is now applied dynamically
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotPasswordButton: {
      alignSelf: 'flex-end', // Align to the right
      marginBottom: 15, // Space below link, before button
      paddingVertical: 5, // Make touch target slightly larger
  },
  forgotPasswordText: {
      fontSize: 14,
      // textDecorationLine: 'underline', // Optional underline
  },
  feedbackContainer: { // Container for reset feedback
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 5,
      marginBottom: 10,
      height: 20, // Reserve space
      width: '100%',
      justifyContent: 'center',
  },
  feedbackText: { // Base style for feedback text
      fontSize: 14,
      textAlign: 'center',
  },
  successText: { // Style for success message
      color: 'green',
  },
  orSeparator: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '80%',
      marginVertical: 20,
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
    paddingVertical: 15,
    paddingHorizontal: 20,
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
      marginRight: 15,
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
      marginTop: 10,
      height: 20,
  },
  errorText: { // Style for error messages (keep red)
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
    marginHorizontal: 20,
    minHeight: 20,
  },
  toggleButton: {
      marginTop: 25,
  },
  toggleText: {
      fontSize: 15,
      fontWeight: '500',
  },
  guestButton: {
      marginTop: 20,
  },
  guestText: {
    fontSize: 15,
  },
});
