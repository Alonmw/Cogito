// app/(tabs)/profile.tsx
import React from 'react';
import { Alert } from 'react-native';
import { useAuth } from '@/src/context/AuthContext';
import { Colors } from '@/src/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '@/src/components/ThemedView';
import { ThemedText } from '@/src/components/ThemedText';
import { ThemedButton } from '@/src/components/ThemedButton';
import { ThemedCard } from '@/src/components/ThemedCard';

export default function ProfileScreen() {
  const { user, signOut, isGuest, exitGuestMode } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: signOut },
      ]
    );
  };

  const navigateToLogin = () => {
    exitGuestMode();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <ThemedView style={{ flex: 1, padding: 20 }}>
        <ThemedText type="title" style={{ textAlign: 'center', marginBottom: 28 }}>
          Profile
        </ThemedText>
        {user ? (
          <ThemedCard style={{ marginBottom: 30, padding: 18 }}>
            <ThemedText type="subtitle" style={{ marginBottom: 8 }}>Email:</ThemedText>
            <ThemedText style={{ marginBottom: 16 }}>{user.email || 'N/A'}</ThemedText>
            <ThemedText type="subtitle" style={{ marginBottom: 8 }}>Display Name:</ThemedText>
            <ThemedText style={{ marginBottom: 16 }}>{user.displayName || '(Not Set)'}</ThemedText>
            <ThemedButton
              title="Logout"
              onPress={handleLogout}
              variant="primary"
              style={{ marginTop: 10 }}
            />
          </ThemedCard>
        ) : isGuest ? (
          <ThemedCard style={{ marginBottom: 30, alignItems: 'center', padding: 18 }}>
            <ThemedText style={{ marginBottom: 10, textAlign: 'center' }}>
              You are currently using the app as a guest.
            </ThemedText>
            <ThemedText style={{ marginBottom: 30, textAlign: 'center' }}>
              Log in or sign up to save history and access all features.
            </ThemedText>
            <ThemedButton
              title="Log In / Sign Up"
              onPress={navigateToLogin}
              variant="primary"
              style={{ marginTop: 10 }}
            />
          </ThemedCard>
        ) : (
          <ThemedText style={{ textAlign: 'center' }}>Not logged in.</ThemedText>
        )}
      </ThemedView>
    </SafeAreaView>
  );
}
